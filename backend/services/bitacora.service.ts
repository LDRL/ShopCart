import { listarBitacoraRepo } from "../repositories/bitacora.repository.js";
import { construirPaginacion } from "../utils/paginacion.js";

export const listarBitacoraService = async (params: {
    modulo?: string | null;
    pagina?: number | null;
    registrosPorPagina?: number | null;
}) => {
    const { rows, totalRegistros } = await listarBitacoraRepo(params);
    return {
        data: rows,
        paginacion: construirPaginacion(
            totalRegistros,
            params.pagina ?? null,
            params.registrosPorPagina ?? null
        ),
    };
};