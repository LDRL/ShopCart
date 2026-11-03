import type { Response } from "express";
import { body, param, query, validationResult } from "express-validator";

import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import type { AuthRequest } from "../types/auth.types.js";
import {
    cambiarEstadoDevolucionService,
    cambiarEstadoPedidoService,
    cancelarPedidoService,
    crearPedidoService,
    listarDevolucionesPorPedidoService,
    listarPedidosService,
    obtenerPedidoService,
    solicitarDevolucionService,
    type ActorPedido,
} from "../services/pedido.service.js";

const ERRORES_CONFLICTO = new Set([
    50801, 50807, 50808, 50812, 50334, 50337,
]);
const ERRORES_NO_ENCONTRADOS = new Set([50809, 50813]);
const ERRORES_INTERNOS = new Set([50802, 50819, 50821]);

const ESTADOS_DEVOLUCION = [
    "Solicitada",
    "Aprobada",
    "Rechazada",
    "Recibida",
    "Completada",
];

const responderErrorPedido = (
    res: Response,
    error: unknown,
    contexto: string
): void => {
    const numero = obtenerNumeroErrorSql(error);
    const mensaje = error instanceof Error ? error.message : "Error desconocido";

    if (error instanceof Error) {
        switch (error.message) {
            case "PEDIDO_NO_ENCONTRADO":
            case "DEVOLUCION_NO_ENCONTRADA":
                res.status(404).json({ msg: "El pedido no existe" });
                return;
            case "PEDIDO_NO_AUTORIZADO":
            case "DEVOLUCION_NO_AUTORIZADA":
                res.status(403).json({ msg: "No tiene permiso para esta operacion" });
                return;
            case "PEDIDO_TRANSICION_INVALIDA":
                res.status(409).json({ msg: "La transicion de estado no esta permitida" });
                return;
            case "PEDIDO_ESTADO_INVALIDO":
                res.status(400).json({ msg: "El estado solicitado no es valido" });
                return;
            default:
                break;
        }
    }

    if (numero !== undefined && ERRORES_NO_ENCONTRADOS.has(numero)) {
        res.status(404).json({ msg: mensaje });
        return;
    }

    if (numero !== undefined && ERRORES_CONFLICTO.has(numero)) {
        res.status(409).json({ msg: mensaje });
        return;
    }

    if (numero !== undefined && ERRORES_INTERNOS.has(numero)) {
        console.error(`Error al ${contexto}:`, mensaje);
        res.status(500).json({ msg: "Hubo un error al procesar el pedido" });
        return;
    }

    if (numero !== undefined && numero >= 50000 && numero < 60000) {
        res.status(400).json({ msg: mensaje });
        return;
    }

    console.error(`Error al ${contexto}:`, mensaje);
    res.status(500).json({ msg: "Hubo un error al procesar el pedido" });
};

const obtenerActor = (req: AuthRequest): ActorPedido | null => {
    const IDUsuario = req.user?.IDUsuario;
    const IDRol = req.user?.IDRol;

    if (typeof IDUsuario !== "number" || typeof IDRol !== "number") {
        return null;
    }

    return { IDUsuario, IDRol };
};

const responderNoAutorizado = (res: Response): void => {
    res.status(401).json({ error: "No autorizado" });
};

const responderDatosInvalidos = (req: AuthRequest, res: Response): boolean => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return true;
    }

    return false;
};

export const validarCrearPedido = [
    body("productos")
        .isArray({ min: 1 })
        .withMessage("productos debe ser un arreglo con al menos un producto"),
    body("productos.*.IDProductoVariante")
        .isInt({ min: 1 })
        .withMessage("IDProductoVariante debe ser un entero positivo")
        .toInt(),
    body("productos.*.cantidad")
        .isInt({ min: 1 })
        .withMessage("cantidad debe ser un entero mayor que cero")
        .toInt(),
    body("codigoCupon")
        .optional({ nullable: true })
        .isString()
        .withMessage("codigoCupon debe ser una cadena de texto")
        .trim()
        .isLength({ max: 50 })
        .withMessage("codigoCupon no puede exceder 50 caracteres"),
    body("direccionEntrega")
        .isString()
        .withMessage("direccionEntrega debe ser una cadena de texto")
        .trim()
        .notEmpty()
        .withMessage("direccionEntrega es obligatoria")
        .isLength({ max: 500 })
        .withMessage("direccionEntrega no puede exceder 500 caracteres"),
    body("observaciones")
        .optional({ nullable: true })
        .isString()
        .withMessage("observaciones debe ser una cadena de texto")
        .trim()
        .isLength({ max: 500 })
        .withMessage("observaciones no puede exceder 500 caracteres"),
    body("minutosExpiracion")
        .optional({ nullable: true })
        .isInt({ min: 1, max: 1440 })
        .withMessage("minutosExpiracion debe estar entre 1 y 1440")
        .toInt(),
];

export const validarCambiarEstadoPedido = [
    param("IDPedido")
        .isInt({ min: 1 })
        .withMessage("IDPedido debe ser un entero positivo")
        .toInt(),
    body("IDEstadoPedido")
        .isInt({ min: 1 })
        .withMessage("IDEstadoPedido debe ser un entero positivo")
        .toInt(),
    body("observaciones")
        .optional({ nullable: true })
        .isString()
        .withMessage("observaciones debe ser una cadena de texto")
        .trim()
        .isLength({ max: 500 })
        .withMessage("observaciones no puede exceder 500 caracteres"),
];

export const validarCancelarPedido = [
    param("IDPedido")
        .isInt({ min: 1 })
        .withMessage("IDPedido debe ser un entero positivo")
        .toInt(),
    body("motivo")
        .isString()
        .withMessage("motivo debe ser una cadena de texto")
        .trim()
        .notEmpty()
        .withMessage("motivo es obligatorio")
        .isLength({ max: 500 })
        .withMessage("motivo no puede exceder 500 caracteres"),
];

export const validarSolicitarDevolucion = [
    param("IDPedido")
        .isInt({ min: 1 })
        .withMessage("IDPedido debe ser un entero positivo")
        .toInt(),
    body("productos")
        .isArray({ min: 1 })
        .withMessage("productos debe ser un arreglo con al menos una linea"),
    body("productos.*.IDPedidoDetalle")
        .isInt({ min: 1 })
        .withMessage("IDPedidoDetalle debe ser un entero positivo")
        .toInt(),
    body("productos.*.cantidad")
        .isInt({ min: 1 })
        .withMessage("cantidad debe ser un entero mayor que cero")
        .toInt(),
    body("motivo")
        .isString()
        .withMessage("motivo debe ser una cadena de texto")
        .trim()
        .notEmpty()
        .withMessage("motivo es obligatorio")
        .isLength({ max: 500 })
        .withMessage("motivo no puede exceder 500 caracteres"),
];

export const validarCambiarEstadoDevolucion = [
    param("IDDevolucion")
        .isInt({ min: 1 })
        .withMessage("IDDevolucion debe ser un entero positivo")
        .toInt(),
    body("estado")
        .isIn(ESTADOS_DEVOLUCION)
        .withMessage(`estado debe ser uno de: ${ESTADOS_DEVOLUCION.join(", ")}`),
    body("observaciones")
        .optional({ nullable: true })
        .isString()
        .withMessage("observaciones debe ser una cadena de texto")
        .trim()
        .isLength({ max: 500 })
        .withMessage("observaciones no puede exceder 500 caracteres"),
];

export const validarFiltrosPedidos = [
    query("IDCliente")
        .optional()
        .isInt({ min: 1 })
        .withMessage("IDCliente debe ser un entero positivo")
        .toInt(),
    query("IDEstadoPedido")
        .optional()
        .isInt({ min: 1 })
        .withMessage("IDEstadoPedido debe ser un entero positivo")
        .toInt(),
    query("buscar")
        .optional()
        .isString()
        .withMessage("buscar debe ser una cadena de texto")
        .trim()
        .isLength({ max: 100 })
        .withMessage("buscar no puede exceder 100 caracteres"),
    query("pagina")
        .optional()
        .isInt({ min: 1 })
        .withMessage("pagina debe ser un entero positivo")
        .toInt(),
    query("tamanoPagina")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("tamanoPagina debe estar entre 1 y 100")
        .toInt(),
];

export const postPedido = async ( req: AuthRequest, res: Response ): Promise<void> => {
    if (responderDatosInvalidos(req, res)) {
        return;
    }

    const actor = obtenerActor(req);

    if (!actor) {
        responderNoAutorizado(res);
        return;
    }

    const { productos, codigoCupon, direccionEntrega, observaciones, minutosExpiracion } =
        req.body as {
            productos: { IDProductoVariante: number; cantidad: number }[];
            codigoCupon?: string | null;
            direccionEntrega: string;
            observaciones?: string | null;
            minutosExpiracion?: number | null;
        };

    try {
        const data = await crearPedidoService(actor, {
            productos,
            codigoCupon: codigoCupon ?? null,
            direccionEntrega,
            observaciones: observaciones ?? null,
            minutosExpiracion: minutosExpiracion ?? 15,
        });

        res.status(201).json({
            msg: "Pedido creado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorPedido(res, error, "crear pedido");
    }
};

export const getPedidos = async ( req: AuthRequest, res: Response ): Promise<void> => {
    if (responderDatosInvalidos(req, res)) {
        return;
    }

    const actor = obtenerActor(req);

    if (!actor) {
        responderNoAutorizado(res);
        return;
    }

    const { IDCliente, IDEstadoPedido, buscar, pagina, tamanoPagina } =
        req.query as {
            IDCliente?: number;
            IDEstadoPedido?: number;
            buscar?: string;
            pagina?: number;
            tamanoPagina?: number;
        };

    try {
        const data = await listarPedidosService(actor, {
            IDCliente: IDCliente ?? null,
            IDEstadoPedido: IDEstadoPedido ?? null,
            buscar: buscar ?? null,
            pagina: pagina ?? 1,
            tamanoPagina: tamanoPagina ?? 20,
        });

        const totalRegistros = data[0]?.totalRegistros ?? 0;

        res.status(200).json({
            msg: "Pedidos obtenidos con exito",
            data,
            paginacion: {
                pagina: pagina ?? 1,
                tamanoPagina: tamanoPagina ?? 20,
                totalRegistros,
                totalPaginas: Math.ceil(totalRegistros / (tamanoPagina ?? 20)),
            },
        });
    } catch (error: unknown) {
        responderErrorPedido(res, error, "obtener pedidos");
    }
};

export const getPedido = async ( req: AuthRequest, res: Response ): Promise<void> => {
    const actor = obtenerActor(req);

    if (!actor) {
        responderNoAutorizado(res);
        return;
    }

    const IDPedido = Number(req.params.IDPedido);

    if (!Number.isSafeInteger(IDPedido) || IDPedido <= 0) {
        res.status(400).json({ msg: "El ID del pedido es invalido" });
        return;
    }

    try {
        const data = await obtenerPedidoService(actor, IDPedido);

        res.status(200).json({
            msg: "Pedido obtenido con exito",
            data,
        });
    } catch (error: unknown) {
        responderErrorPedido(res, error, "obtener pedido");
    }
};

export const patchEstadoPedido = async ( req: AuthRequest, res: Response ): Promise<void> => {
    if (responderDatosInvalidos(req, res)) {
        return;
    }

    const actor = obtenerActor(req);

    if (!actor) {
        responderNoAutorizado(res);
        return;
    }

    const IDPedido = Number(req.params.IDPedido);
    const { IDEstadoPedido, observaciones } = req.body as {
        IDEstadoPedido: number;
        observaciones?: string | null;
    };

    try {
        const data = await cambiarEstadoPedidoService(
            actor,
            IDPedido,
            IDEstadoPedido,
            observaciones ?? null
        );

        res.status(200).json({
            msg: "Estado del pedido actualizado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorPedido(res, error, "actualizar estado del pedido");
    }
};

export const postCancelarPedido = async ( req: AuthRequest, res: Response ): Promise<void> => {
    if (responderDatosInvalidos(req, res)) {
        return;
    }

    const actor = obtenerActor(req);

    if (!actor) {
        responderNoAutorizado(res);
        return;
    }

    const IDPedido = Number(req.params.IDPedido);
    const motivo = (req.body as { motivo: string }).motivo;

    try {
        const data = await cancelarPedidoService(actor, IDPedido, motivo);

        res.status(200).json({
            msg: "Pedido cancelado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorPedido(res, error, "cancelar pedido");
    }
};

export const postDevolucion = async ( req: AuthRequest, res: Response ): Promise<void> => {
    if (responderDatosInvalidos(req, res)) {
        return;
    }

    const actor = obtenerActor(req);

    if (!actor) {
        responderNoAutorizado(res);
        return;
    }

    const IDPedido = Number(req.params.IDPedido);
    const { productos, motivo } = req.body as {
        productos: { IDPedidoDetalle: number; cantidad: number }[];
        motivo: string;
    };

    try {
        const data = await solicitarDevolucionService(actor, {
            IDPedido,
            productos,
            motivo,
        });

        res.status(201).json({
            msg: "Devolucion solicitada correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorPedido(res, error, "solicitar devolucion");
    }
};

export const getDevolucionesPorPedido = async ( req: AuthRequest, res: Response ): Promise<void> => {
    const actor = obtenerActor(req);

    if (!actor) {
        responderNoAutorizado(res);
        return;
    }

    const IDPedido = Number(req.params.IDPedido);

    if (!Number.isSafeInteger(IDPedido) || IDPedido <= 0) {
        res.status(400).json({ msg: "El ID del pedido es invalido" });
        return;
    }

    try {
        const data = await listarDevolucionesPorPedidoService(actor, IDPedido);

        res.status(200).json({
            msg: "Devoluciones obtenidas con exito",
            data,
        });
    } catch (error: unknown) {
        responderErrorPedido(res, error, "obtener devoluciones");
    }
};

export const patchEstadoDevolucion = async ( req: AuthRequest, res: Response ): Promise<void> => {
    if (responderDatosInvalidos(req, res)) {
        return;
    }

    const actor = obtenerActor(req);

    if (!actor) {
        responderNoAutorizado(res);
        return;
    }

    const IDDevolucion = Number(req.params.IDDevolucion);
    const { estado, observaciones } = req.body as {
        estado: string;
        observaciones?: string | null;
    };

    try {
        const data = await cambiarEstadoDevolucionService(
            actor,
            IDDevolucion,
            estado,
            observaciones ?? null
        );

        res.status(200).json({
            msg: "Estado de la devolucion actualizado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorPedido(res, error, "actualizar estado de la devolucion");
    }
};
