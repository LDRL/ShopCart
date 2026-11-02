import type { Request, Response } from "express";
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
        const variantes = await obtenerVariantesService(id);
        res.status(200).json({
            msg: "Variantes obtenidas con éxito",
            data: variantes,
        });
    } catch (error: unknown) {
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
        const atributos = await obtenerAtributosCategoriaService(id);
        res.status(200).json({
            msg: "Atributos de categoría obtenidos con éxito",
            data: atributos,
        });
    } catch (error: unknown) {
        console.error("Error al obtener atributos de categoría:", error instanceof Error ? error.message : error);
        res.status(500).json({ msg: "Hubo un error al obtener los atributos" });
    }
};
