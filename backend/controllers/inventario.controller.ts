import type { Response } from "express";
import { body, validationResult } from "express-validator";

import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import { obtenerPaginacion, responderPaginacionError } from "../utils/paginacion.js";
import type { AuthRequest } from "../types/auth.types.js";
import {
    registrarMovimientoService,
    obtenerDisponibilidadService,
    obtenerKardexService,
} from "../services/inventario.service.js";

const ERRORES_STOCK = new Set([50103, 50104]);

const responderErrorMovimiento = (
    res: Response,
    error: unknown,
    contexto: string
): void => {
    const numero = obtenerNumeroErrorSql(error);
    const mensaje = error instanceof Error ? error.message : "Error desconocido";

    if (numero === 50102) {
        res.status(404).json({ msg: mensaje });
        return;
    }

    if (numero !== undefined && ERRORES_STOCK.has(numero)) {
        res.status(409).json({ msg: mensaje });
        return;
    }

    if (numero !== undefined && numero >= 50000 && numero < 60000) {
        res.status(400).json({ msg: mensaje });
        return;
    }

    console.error(`Error al ${contexto}:`, mensaje);
    res.status(500).json({ msg: "Hubo un error al procesar el movimiento de inventario" });
};

const esIdValido = (id: number): boolean => Number.isSafeInteger(id) && id > 0;

export const validarMovimiento = [
    body("IDProductoVariante")
        .isInt({ min: 1 })
        .withMessage("IDProductoVariante debe ser un entero positivo")
        .toInt(),
    body("IDTipoMovimiento")
        .isInt({ min: 1 })
        .withMessage("IDTipoMovimiento debe ser un entero positivo")
        .toInt(),
    body("cantidad")
        .isInt({ min: 1 })
        .withMessage("cantidad debe ser un entero mayor que cero")
        .toInt(),
    body("motivo")
        .isString()
        .withMessage("motivo debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("motivo es requerido")
        .isLength({ max: 500 })
        .withMessage("motivo no puede exceder 500 caracteres"),
    body("IDPedido")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("IDPedido debe ser un entero positivo")
        .toInt(),
];

export const postMovimiento = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
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
        IDProductoVariante,
        IDTipoMovimiento,
        cantidad,
        motivo,
        IDPedido,
    } = req.body as {
        IDProductoVariante: number;
        IDTipoMovimiento: number;
        cantidad: number;
        motivo: string;
        IDPedido?: number | null;
    };

    try {
        const data = await registrarMovimientoService({
            IDProductoVariante: Number(IDProductoVariante),
            IDTipoMovimiento: Number(IDTipoMovimiento),
            IDUsuario,
            cantidad: Number(cantidad),
            motivo,
            IDPedido: IDPedido ?? null,
        });

        res.status(201).json({
            msg: "Movimiento de inventario registrado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorMovimiento(res, error, "registrar movimiento de inventario");
    }
};

export const getDisponibilidad = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    const IDProductoVariante = Number(req.params.IDProductoVariante);

    if (!esIdValido(IDProductoVariante)) {
        res.status(400).json({ msg: "El ID de la variante es invalido" });
        return;
    }

    try {
        const data = await obtenerDisponibilidadService(IDProductoVariante);

        res.status(200).json({
            msg: "Disponibilidad obtenida con exito",
            data,
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "INVENTARIO_NO_ENCONTRADO") {
            res.status(404).json({ msg: "No existe inventario para esta variante" });
            return;
        }

        console.error(
            "Error al obtener disponibilidad:",
            error instanceof Error ? error.message : error
        );
        res.status(500).json({ msg: "Hubo un error al obtener la disponibilidad" });
    }
};

export const getKardex = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    const IDProductoVariante = Number(req.params.IDProductoVariante);

    if (!esIdValido(IDProductoVariante)) {
        res.status(400).json({ msg: "El ID de la variante es invalido" });
        return;
    }

    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req as any);
        const result = await obtenerKardexService(IDProductoVariante, {
            pagina,
            registrosPorPagina,
        });
        res.status(200).json({
            msg: "Kardex obtenido con exito",
            ...result,
        });
    } catch (error: unknown) {
        try {
            responderPaginacionError(res, error);
            return;
        } catch {
            // no es error de paginacion
        }
        console.error(
            "Error al obtener kardex:",
            error instanceof Error ? error.message : error
        );
        res.status(500).json({ msg: "Hubo un error al obtener el kardex" });
    }
};


