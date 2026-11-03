import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import { obtenerPaginacion, responderPaginacionError } from "../utils/paginacion.js";
import {
    obtenerAtributosService,
    obtenerAtributoPorIdService,
    crearAtributoService,
    actualizarAtributoService,
    eliminarAtributoService,
} from "../services/atributo.service.js";

const ROLES_VALIDOS = ["COLOR", "TALLA", "GENERICO"];

const ERRORES_NO_ENCONTRADOS = new Set([50403, 50404]);
const ERRORES_CONFLICTO = new Set([50402, 50406]);

const responderErrorAtributo = ( res: Response, error: unknown, contexto: string ): void => {
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
    res.status(500).json({ msg: "Hubo un error al procesar el atributo" });
};

const esIdValido = (id: number): boolean => Number.isSafeInteger(id) && id > 0;

const reglaNombre = () =>
    body("nombre")
        .isString()
        .withMessage("nombre debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("nombre es requerido")
        .isLength({ max: 100 })
        .withMessage("nombre no puede exceder 100 caracteres");

const reglaRol = (opcional: boolean) => {
    const validador = body("rol");

    return (opcional ? validador.optional() : validador)
        .isIn(ROLES_VALIDOS)
        .withMessage("rol debe ser COLOR, TALLA o GENERICO");
};

export const validarAtributo = [reglaNombre(), reglaRol(true)];

export const validarActualizarAtributo = [
    reglaNombre(),
    reglaRol(false),
    body("estado")
        .isBoolean()
        .withMessage("estado debe ser booleano")
        .toBoolean(),
];
export const getAtributos = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const { data, paginacion } = await obtenerAtributosService({ pagina, registrosPorPagina });
        res.status(200).json({
            msg: "Atributos obtenidos con exito",
            data,
            paginacion,
        });
    } catch (error: unknown) {
        try {
            responderPaginacionError(res, error);
            return;
        } catch {
            // no es error de paginacion
        }
        console.error(
            "Error al listar atributos:",
            error instanceof Error ? error.message : error
        );
        res.status(500).json({ msg: "Hubo un error al obtener los atributos" });
    }
};

export const getAtributo = async (req: Request, res: Response): Promise<void> => {
    const IDAtributo = Number(req.params.id);

    if (!esIdValido(IDAtributo)) {
        res.status(400).json({ msg: "El ID del atributo es invalido" });
        return;
    }

    try {
        const atributo = await obtenerAtributoPorIdService(IDAtributo);
        res.status(200).json({
            msg: "Atributo obtenido con exito",
            data: atributo,
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "ATRIBUTO_NO_ENCONTRADO") {
            res.status(404).json({ msg: "Atributo no encontrado" });
            return;
        }

        console.error(
            "Error al obtener atributo:",
            error instanceof Error ? error.message : error
        );
        res.status(500).json({ msg: "Hubo un error al obtener el atributo" });
    }
};

export const postAtributo = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const { nombre, rol = "GENERICO" } = req.body as {
        nombre: string;
        rol?: string;
    };

    try {
        const data = await crearAtributoService(nombre, rol);
        res.status(201).json({
            msg: "Atributo creado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorAtributo(res, error, "crear atributo");
    }
};

export const putAtributo = async (req: Request, res: Response): Promise<void> => {
    const IDAtributo = Number(req.params.id);

    if (!esIdValido(IDAtributo)) {
        res.status(400).json({ msg: "El ID del atributo es invalido" });
        return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const { nombre, rol, estado } = req.body as {
        nombre: string;
        rol: string;
        estado: boolean;
    };

    try {
        const data = await actualizarAtributoService(
            IDAtributo,
            nombre,
            Boolean(estado),
            rol
        );
        res.status(200).json({
            msg: "Atributo actualizado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorAtributo(res, error, "actualizar atributo");
    }
};

export const deleteAtributo = async (req: Request, res: Response): Promise<void> => {
    const IDAtributo = Number(req.params.id);

    if (!esIdValido(IDAtributo)) {
        res.status(400).json({ msg: "El ID del atributo es invalido" });
        return;
    }

    try {
        const data = await eliminarAtributoService(IDAtributo);
        res.status(200).json({
            msg: "Atributo eliminado correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        responderErrorAtributo(res, error, "eliminar atributo");
    }
};

