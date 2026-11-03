import type { Response } from "express";
import { body, validationResult } from "express-validator";

import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import { obtenerPaginacion, responderPaginacionError } from "../utils/paginacion.js";
import type { AuthRequest } from "../types/auth.types.js";
import {
    anularCompraService,
    crearCompraService,
    listarComprasService,
    obtenerCompraPorIdService,
} from "../services/compra.service.js";

const ERRORES_CONFLICTO = new Set([50103, 50104, 50741, 50742, 50743, 50744, 50746, 50747]);
const ERRORES_NO_ENCONTRADOS = new Set([50102, 50740]);
const ERRORES_INTERNOS = new Set([50745]);

const responderErrorCompra = ( res: Response, error: unknown, contexto: string ): void => {
    const numero = obtenerNumeroErrorSql(error);
    const mensaje = error instanceof Error ? error.message : "Error desconocido";

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
        res.status(500).json({ msg: "Hubo un error al procesar la compra" });
        return;
    }

    if (numero !== undefined && numero >= 50000 && numero < 60000) {
        res.status(400).json({ msg: mensaje });
        return;
    }

    console.error(`Error al ${contexto}:`, mensaje);
    res.status(500).json({ msg: "Hubo un error al procesar la compra" });
};

const esIdValido = (id: number): boolean => Number.isSafeInteger(id) && id > 0;

export const validarCompra = [
    body("IDProveedor")
        .isInt({ min: 1 })
        .withMessage("IDProveedor debe ser un entero positivo")
        .toInt(),
    body("detalles")
        .isArray({ min: 1 })
        .withMessage("detalles debe ser un arreglo con al menos una linea"),
    body("detalles.*.IDProductoVariante")
        .isInt({ min: 1 })
        .withMessage("IDProductoVariante debe ser un entero positivo")
        .toInt(),
    body("detalles.*.cantidad")
        .isInt({ min: 1 })
        .withMessage("cantidad debe ser un entero mayor que cero")
        .toInt(),
    body("detalles.*.costoUnitario")
        .isFloat({ min: 0 })
        .withMessage("costoUnitario debe ser un numero mayor o igual a cero")
        .toFloat(),
    body("detalles.*.montoDescuento")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("montoDescuento de linea debe ser un numero mayor o igual a cero")
        .toFloat(),
    body("montoDescuento")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("montoDescuento debe ser un numero mayor o igual a cero")
        .toFloat(),
    body("costoEnvio")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("costoEnvio debe ser un numero mayor o igual a cero")
        .toFloat(),
    body("observaciones")
        .optional({ nullable: true })
        .isString()
        .withMessage("observaciones debe ser una cadena de texto")
        .trim()
        .isLength({ max: 500 })
        .withMessage("observaciones no puede exceder 500 caracteres"),
];

export const validarAnulacion = [
    body("motivo")
        .isString()
        .withMessage("motivo debe ser una cadena de texto")
        .trim()
        .notEmpty()
        .withMessage("motivo es obligatorio")
        .isLength({ max: 500 })
        .withMessage("motivo no puede exceder 500 caracteres"),
];

export const postCompra = async ( req: AuthRequest, res: Response ): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const IDUsuario = req.user?.IDUsuario;

    if (typeof IDUsuario !== "number") {
        res.status(401).json({ error: "No autorizado" });
        return;
    }

    const {
        IDProveedor,
        detalles,
        montoDescuento,
        costoEnvio,
        observaciones,
    } = req.body as {
        IDProveedor: number;
        detalles: {
            IDProductoVariante: number;
            cantidad: number;
            costoUnitario: number;
            montoDescuento?: number | null;
        }[];
        montoDescuento?: number | null;
        costoEnvio?: number | null;
        observaciones?: string | null;
    };

    try {
        const data = await crearCompraService({
            IDProveedor,
            IDUsuario,
            detalles,
            montoDescuento: montoDescuento ?? 0,
            costoEnvio: costoEnvio ?? 0,
            observaciones: observaciones ?? null,
        });

        res.status(201).json({
            msg: "Compra registrada correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorCompra(res, error, "registrar compra");
    }
};

export const getCompras = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req as any);
        const estadoRaw = req.query.estado;
        const estado = estadoRaw === undefined ? null : estadoRaw === "true" || estadoRaw === "1";
        const result = await listarComprasService({
            pagina,
            registrosPorPagina,
            estado,
            buscar: req.query.buscar?.toString() || req.query.q?.toString() || null,
        });
        res.status(200).json({
            msg: "Compras obtenidas con exito",
            ...result,
        });
    } catch (error: unknown) {
        try {
            responderPaginacionError(res, error);
            return;
        } catch {
            // no es error de paginacion
        }
        responderErrorCompra(res, error, "obtener compras");
    }
};

export const getCompra = async ( req: AuthRequest, res: Response ): Promise<void> => {
    const IDCompra = Number(req.params.IDCompra);

    if (!esIdValido(IDCompra)) {
        res.status(400).json({ msg: "El ID de la compra es invalido" });
        return;
    }

    try {
        const data = await obtenerCompraPorIdService(IDCompra);

        res.status(200).json({
            msg: "Compra obtenida con exito",
            data,
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "COMPRA_NO_ENCONTRADA") {
            res.status(404).json({ msg: "La compra no existe" });
            return;
        }

        responderErrorCompra(res, error, "obtener compra");
    }
};

export const anularCompra = async ( req: AuthRequest, res: Response ): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const IDCompra = Number(req.params.IDCompra);

    if (!esIdValido(IDCompra)) {
        res.status(400).json({ msg: "El ID de la compra es invalido" });
        return;
    }

    const IDUsuario = req.user?.IDUsuario;

    if (typeof IDUsuario !== "number") {
        res.status(401).json({ error: "No autorizado" });
        return;
    }

    const motivo = (req.body as { motivo: string }).motivo;

    try {
        const data = await anularCompraService(IDCompra, IDUsuario, motivo);

        res.status(200).json({
            msg: "Compra anulada correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorCompra(res, error, "anular compra");
    }
};


