import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import { esDuplicadoSql, obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import { obtenerPaginacion, responderPaginacionError } from "../utils/paginacion.js";
import { esTokenInvitadoValido, tokenInvitadoDesdeRequest } from "../utils/invitado.js";
import {
    actualizarCuponService,
    crearCuponService,
    eliminarCuponService,
    listarCuponesService,
    obtenerCuponPorIdService,
    validarCuponService,
} from "../services/cupon.service.js";
import type { TipoDescuento } from "../repositories/cupon.repository.js";
import type { AuthRequest } from "../types/auth.types.js";

const TIPOS_DESCUENTO = ["Porcentaje", "MontoFijo"];

const ERRORES_CONFLICTO = new Set([50308]);
const ERRORES_NO_ENCONTRADOS = new Set([50300, 50301]);

const responderErrorCupon = (
    res: Response,
    error: unknown,
    contexto: string
): void => {
    const numero = obtenerNumeroErrorSql(error);
    const mensaje = error instanceof Error ? error.message : "Error desconocido";

    if (numero !== undefined && ERRORES_NO_ENCONTRADOS.has(numero)) {
        res.status(404).json({ msg: mensaje });
        return;
    }

    if (
        (numero !== undefined && ERRORES_CONFLICTO.has(numero)) ||
        esDuplicadoSql(error)
    ) {
        res.status(409).json({ msg: "Ya existe un cupon con ese codigo" });
        return;
    }

    if (numero !== undefined && numero >= 50000 && numero < 60000) {
        res.status(400).json({ msg: mensaje });
        return;
    }

    if (numero === 547) {
        res.status(400).json({ msg: "Datos invalidos para el cupon" });
        return;
    }

    console.error(`Error al ${contexto}:`, mensaje);
    res.status(500).json({ msg: "Hubo un error al procesar el cupon" });
};

const esIdValido = (id: number): boolean => Number.isSafeInteger(id) && id > 0;

const reglaCodigo = () =>
    body("codigo")
        .isString()
        .withMessage("codigo debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("codigo es requerido")
        .isLength({ max: 50 })
        .withMessage("codigo no puede exceder 50 caracteres");

const reglaTipoDescuento = () =>
    body("tipoDescuento")
        .isIn(TIPOS_DESCUENTO)
        .withMessage("tipoDescuento debe ser Porcentaje o MontoFijo");

const reglaValorDescuento = () =>
    body("valorDescuento")
        .isFloat({ gt: 0 })
        .withMessage("valorDescuento debe ser mayor que cero")
        .toFloat()
        .custom((value: number, { req }) => {
            const tipo = (req.body as { tipoDescuento?: TipoDescuento })
                .tipoDescuento;

            if (tipo === "Porcentaje" && value > 100) {
                throw new Error(
                    "valorDescuento no puede superar 100 cuando el tipo es Porcentaje"
                );
            }

            return true;
        });

const reglaMontoMinimo = () =>
    body("montoMinimo")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("montoMinimo debe ser mayor o igual a cero")
        .toFloat();

const reglaLimiteUsosTotal = () =>
    body("limiteUsosTotal")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("limiteUsosTotal debe ser un entero mayor que cero")
        .toInt();

const reglaLimiteUsosCliente = () =>
    body("limiteUsosCliente")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("limiteUsosCliente debe ser un entero mayor que cero")
        .toInt();

const reglaFechaInicio = () =>
    body("fechaInicio")
        .isISO8601()
        .withMessage("fechaInicio debe ser una fecha valida")
        .bail()
        .toDate();

const reglaFechaFin = () =>
    body("fechaFin")
        .isISO8601()
        .withMessage("fechaFin debe ser una fecha valida")
        .bail()
        .toDate()
        .custom((value: Date, { req }) => {
            const inicio = (req.body as { fechaInicio?: Date }).fechaInicio;

            if (!(inicio instanceof Date) || Number.isNaN(inicio.getTime())) {
                return true;
            }

            if (value.getTime() <= inicio.getTime()) {
                throw new Error("fechaFin debe ser posterior a fechaInicio");
            }

            return true;
        });

const reglaEstado = () =>
    body("estado")
        .optional({ nullable: true })
        .isBoolean()
        .withMessage("estado debe ser booleano")
        .toBoolean();

const reglaCategorias = () => [
    body("categorias")
        .optional({ nullable: true })
        .isArray()
        .withMessage("categorias debe ser un arreglo de IDs"),
    body("categorias.*")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Cada categoria debe ser un entero positivo")
        .toInt(),
];

export const validarCupon = [
    reglaCodigo(),
    reglaTipoDescuento(),
    reglaValorDescuento(),
    reglaMontoMinimo(),
    reglaLimiteUsosTotal(),
    reglaLimiteUsosCliente(),
    reglaFechaInicio(),
    reglaFechaFin(),
    reglaEstado(),
    ...reglaCategorias(),
];

export const validarActualizarCupon = validarCupon;

export const validarAplicacionCupon = [
    reglaCodigo(),
    body("lineas")
        .isArray({ min: 1 })
        .withMessage("lineas debe ser un arreglo con al menos una linea"),
    body("lineas.*.IDProductoVariante")
        .isInt({ min: 1 })
        .withMessage("IDProductoVariante debe ser un entero positivo")
        .toInt(),
    body("lineas.*.cantidad")
        .isInt({ min: 1 })
        .withMessage("cantidad debe ser un entero mayor que cero")
        .toInt(),
];

export const getCupones = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const result = await listarCuponesService({
            pagina,
            registrosPorPagina,
            buscar: req.query.buscar?.toString() || req.query.q?.toString() || null,
        });
        res.status(200).json({
            msg: "Cupones obtenidos con exito",
            ...result,
        });
    } catch (error: unknown) {
        try {
            responderPaginacionError(res, error);
            return;
        } catch {
            // no es error de paginacion
        }
        responderErrorCupon(res, error, "obtener cupones");
    }
};

export const getCupon = async (
    req: Request,
    res: Response
): Promise<void> => {
    const IDCupon = Number(req.params.IDCupon);

    if (!esIdValido(IDCupon)) {
        res.status(400).json({ msg: "El ID del cupon es invalido" });
        return;
    }

    try {
        const data = await obtenerCuponPorIdService(IDCupon);

        res.status(200).json({
            msg: "Cupon obtenido con exito",
            data,
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "CUPON_NO_ENCONTRADO") {
            res.status(404).json({ msg: "El cupon no existe" });
            return;
        }

        responderErrorCupon(res, error, "obtener cupon");
    }
};

export const postCupon = async (
    req: Request,
    res: Response
): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const {
        codigo, tipoDescuento, valorDescuento, montoMinimo, limiteUsosTotal, limiteUsosCliente, fechaInicio, fechaFin, estado, categorias,
    } = req.body as {
        codigo: string;
        tipoDescuento: TipoDescuento;
        valorDescuento: number;
        montoMinimo?: number | null;
        limiteUsosTotal?: number | null;
        limiteUsosCliente?: number | null;
        fechaInicio: Date;
        fechaFin: Date;
        estado?: boolean | null;
        categorias?: number[] | null;
    };

    try {
        const data = await crearCuponService({
            codigo,
            tipoDescuento,
            valorDescuento,
            montoMinimo: montoMinimo ?? 0,
            limiteUsosTotal: limiteUsosTotal ?? null,
            limiteUsosCliente: limiteUsosCliente ?? null,
            fechaInicio,
            fechaFin,
            estado: estado ?? true,
            categorias: categorias ?? null,
        });

        res.status(201).json({
            msg: "Cupon creado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorCupon(res, error, "crear cupon");
    }
};

export const putCupon = async (
    req: Request,
    res: Response
): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const IDCupon = Number(req.params.IDCupon);

    if (!esIdValido(IDCupon)) {
        res.status(400).json({ msg: "El ID del cupon es invalido" });
        return;
    }

    const {
        codigo,
        tipoDescuento,
        valorDescuento,
        montoMinimo,
        limiteUsosTotal,
        limiteUsosCliente,
        fechaInicio,
        fechaFin,
        estado,
        categorias,
    } = req.body as {
        codigo: string;
        tipoDescuento: TipoDescuento;
        valorDescuento: number;
        montoMinimo?: number | null;
        limiteUsosTotal?: number | null;
        limiteUsosCliente?: number | null;
        fechaInicio: Date;
        fechaFin: Date;
        estado?: boolean | null;
        categorias?: number[] | null;
    };

    try {
        const data = await actualizarCuponService(IDCupon, {
            codigo,
            tipoDescuento,
            valorDescuento,
            montoMinimo: montoMinimo ?? 0,
            limiteUsosTotal: limiteUsosTotal ?? null,
            limiteUsosCliente: limiteUsosCliente ?? null,
            fechaInicio,
            fechaFin,
            estado: estado ?? undefined,
            categorias: categorias ?? null,
        });

        res.status(200).json({
            msg: "Cupon actualizado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorCupon(res, error, "actualizar cupon");
    }
};

export const deleteCupon = async (
    req: Request,
    res: Response
): Promise<void> => {
    const IDCupon = Number(req.params.IDCupon);

    if (!esIdValido(IDCupon)) {
        res.status(400).json({ msg: "El ID del cupon es invalido" });
        return;
    }

    try {
        const data = await eliminarCuponService(IDCupon);

        res.status(200).json({
            msg: "Cupon desactivado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorCupon(res, error, "desactivar cupon");
    }
};

export const postValidarCupon = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const IDUsuario = req.user?.IDUsuario ?? null;
    const tokenInvitado = IDUsuario === null
        ? tokenInvitadoDesdeRequest(req)
        : null;

    if (IDUsuario === null && !tokenInvitado) {
        res.status(401).json({
            error: "No autorizado: sesion o token de invitado requerido",
        });
        return;
    }

    if (tokenInvitado && !esTokenInvitadoValido(tokenInvitado)) {
        res.status(400).json({
            msg: "tokenInvitado invalido: use entre 16 y 64 caracteres alfanumericos, guion o guion bajo",
        });
        return;
    }

    const { codigo, lineas } = req.body as {
        codigo: string;
        lineas: {
            IDProductoVariante: number;
            cantidad: number;
        }[];
    };

    try {
        const data = await validarCuponService({
            codigo,
            IDUsuario,
            tokenInvitado,
            lineas,
        });

        res.status(200).json({
            msg: data?.mensaje ?? "Cupon no aplicable",
            data,
        });
    } catch (error: unknown) {
        responderErrorCupon(res, error, "validar cupon");
    }
};


