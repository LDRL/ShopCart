import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import { obtenerGenerosService, obtenerGeneroPorIdService, crearGeneroService, actualizarGeneroService, eliminarGeneroService, } from "../services/genero.service.js";

const ERRORES_NO_ENCONTRADOS = new Set([50433, 50434]);
const ERRORES_CONFLICTO = new Set([50432]);

const responderErrorGenero = ( res: Response, error: unknown, contexto: string ): void => {
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

    if (numero !== undefined && numero >= 50000 && numero < 60000) {
        res.status(400).json({ msg: mensaje });
        return;
    }

    console.error(`Error al ${contexto}:`, mensaje);
    res.status(500).json({ msg: "Hubo un error al procesar el genero" });
};

const esIdValido = (id: number): boolean => Number.isSafeInteger(id) && id > 0;

export const validarGenero = [
    body("nombre")
        .isString()
        .withMessage("Nombre debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Nombre es requerido")
        .isLength({ max: 50 })
        .withMessage("Nombre no puede exceder 50 caracteres"),
];

export const validarActualizarGenero = [
    ...validarGenero,
    body("estado")
        .isBoolean()
        .withMessage("Estado debe ser booleano")
        .toBoolean(),
];

export const getGeneros = async (_req: Request, res: Response): Promise<void> => {
    try {
        const generos = await obtenerGenerosService();
        res.status(200).json({
            msg: "Generos obtenidos con exito",
            data: generos,
        });
    } catch (error: unknown) {
        console.error(
            "Error al listar generos:",
            error instanceof Error ? error.message : error
        );
        res.status(500).json({ msg: "Hubo un error al obtener los generos" });
    }
};

export const getGenero = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!esIdValido(id)) {
        res.status(400).json({ msg: "El ID del genero es invalido" });
        return;
    }

    try {
        const genero = await obtenerGeneroPorIdService(id);
        res.status(200).json({
            msg: "Genero obtenido con exito",
            data: genero,
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "GENERO_NO_ENCONTRADO") {
            res.status(404).json({ msg: "Genero no encontrado" });
            return;
        }

        console.error(
            "Error al obtener genero:",
            error instanceof Error ? error.message : error
        );
        res.status(500).json({ msg: "Hubo un error al obtener el genero" });
    }
};

export const postGenero = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const { nombre } = req.body as { nombre: string };

    try {
        const data = await crearGeneroService(nombre);
        res.status(201).json({
            msg: "Genero creado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorGenero(res, error, "crear genero");
    }
};

export const putGenero = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!esIdValido(id)) {
        res.status(400).json({ msg: "El ID del genero es invalido" });
        return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const { nombre, estado } = req.body as { nombre: string; estado: boolean };

    try {
        const data = await actualizarGeneroService(id, nombre, Boolean(estado));
        res.status(200).json({
            msg: "Genero actualizado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorGenero(res, error, "actualizar genero");
    }
};

export const deleteGenero = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!esIdValido(id)) {
        res.status(400).json({ msg: "El ID del genero es invalido" });
        return;
    }

    try {
        const data = await eliminarGeneroService(id);
        res.status(200).json({
            msg: "Genero eliminado correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        responderErrorGenero(res, error, "eliminar genero");
    }
};
