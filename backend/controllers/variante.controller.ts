import type { Request, Response } from "express";
import { obtenerPaginacion, responderPaginacionError } from "../utils/paginacion.js";
import {
    obtenerVariantesService,
    obtenerAtributosCategoriaService,
} from "../services/variante.service.js";

export const getVariantes = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ msg: "El ID del producto es inválido" });
        return;
    }
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const result = await obtenerVariantesService(id, { pagina, registrosPorPagina });
        res.status(200).json({
            msg: "Variantes obtenidas con éxito",
            ...result,
        });
    } catch (error: unknown) {
        try {
            responderPaginacionError(res, error);
            return;
        } catch {
            // no es error de paginacion
        }
        console.error("Error al obtener variantes:", error instanceof Error ? error.message : error);
        res.status(500).json({ msg: "Hubo un error al obtener las variantes" });
    }
};

export const getAtributosCategoria = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ msg: "El ID de la categoría es inválido" });
        return;
    }
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const result = await obtenerAtributosCategoriaService(id, { pagina, registrosPorPagina });
        res.status(200).json({
            msg: "Atributos de categoría obtenidos con éxito",
            ...result,
        });
    } catch (error: unknown) {
        try {
            responderPaginacionError(res, error);
            return;
        } catch {
            // no es error de paginacion
        }
        console.error("Error al obtener atributos de categoría:", error instanceof Error ? error.message : error);
        res.status(500).json({ msg: "Hubo un error al obtener los atributos" });
    }
};


