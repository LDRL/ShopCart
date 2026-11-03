import type { Request, Response } from "express";
import { obtenerPaginacion, responderPaginacionError } from "../utils/paginacion.js";
import { listarBitacoraService } from "../services/bitacora.service.js";

export const getBitacora = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const result = await listarBitacoraService({
            modulo: req.query.modulo?.toString() || req.query.module?.toString() || null,
            pagina,
            registrosPorPagina,
        });
        res.status(200).json({ msg: "Bitacora obtenida con exito", ...result });
    } catch (error: unknown) {
        try {
            responderPaginacionError(res, error);
            return;
        } catch {
            // no es error de paginacion
        }
        console.error("Error al listar bitacora:", error);
        res.status(500).json({ msg: "Hubo un error al obtener la bitacora" });
    }
};