import { construirPaginacion } from "../utils/paginacion.js";
import {
    listarVariantesRepo,
    obtenerAtributosCategoriaRepo,
} from "../repositories/variante.repository.js";

export const obtenerVariantesService = async (
    IDProducto: number,
    params: { pagina?: number | null; registrosPorPagina?: number | null } = {}
) => {
    const { rows, totalRegistros } = await listarVariantesRepo(IDProducto, params);
    return {
        data: rows,
        paginacion: construirPaginacion(
            totalRegistros,
            params.pagina ?? null,
            params.registrosPorPagina ?? null
        ),
    };
};

export const obtenerAtributosCategoriaService = async (
    IDCategoria: number,
    params: { pagina?: number | null; registrosPorPagina?: number | null } = {}
) => {
    const { rows, totalRegistros } = await obtenerAtributosCategoriaRepo(IDCategoria, params);
    return {
        data: rows,
        paginacion: construirPaginacion(
            totalRegistros,
            params.pagina ?? null,
            params.registrosPorPagina ?? null
        ),
    };
};
