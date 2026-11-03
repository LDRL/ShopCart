import {
    listarProductosPublicRepo,
    listarVariantesPublicRepo,
    consultarProductosShopRepo,
    listarCategoriasPublicRepo,
    listarGenerosPublicRepo,
    listarAtributosPublicRepo,
    listarValoresAtributoPublicRepo,
    type PaginacionParams,
} from "../repositories/public.repository.js";
import { obtenerProductoPorIdRepo } from "../repositories/producto.repository.js";
import { construirPaginacion } from "../utils/paginacion.js";

export const listarProductosPublicService = async (filtros: any) => {
    const { total, productos } = await listarProductosPublicRepo(filtros);
    return {
        data: productos,
        paginacion: construirPaginacion(total, filtros.pagina ?? null, filtros.registrosPorPagina ?? null),
    };
};

export const obtenerProductoPublicService = async (id: number) => {
    const data = await obtenerProductoPorIdRepo(id);
    if (!data?.producto) throw new Error("PRODUCTO_NO_ENCONTRADO");
    if (data.producto.estado === false || data.producto.estado === 0) {
        throw new Error("PRODUCTO_NO_ENCONTRADO");
    }
    return data;
};

export const listarVariantesPublicService = async (idProducto: number, paginacion: PaginacionParams) => {
    const { rows, totalRegistros } = await listarVariantesPublicRepo(idProducto, paginacion);
    return {
        data: rows,
        paginacion: construirPaginacion(totalRegistros, paginacion.pagina ?? null, paginacion.registrosPorPagina ?? null),
    };
};

export const consultarProductosShopService = async (filtros: any) => {
    const { meta, productos, variantes } = await consultarProductosShopRepo(filtros);
    const totalRegistros = Number(meta?.TotalRegistros ?? 0);
    const pagina = meta?.PaginaActual ?? filtros.pagina ?? null;
    const registrosPorPagina = meta?.RegistrosPorPagina ?? filtros.registrosPorPagina ?? null;
    const totalPaginas = meta?.TotalPaginas ?? (registrosPorPagina ? Math.ceil(totalRegistros / registrosPorPagina) : null);
    return {
        data: productos,
        variantes,
        paginacion: {
            pagina,
            registrosPorPagina,
            totalRegistros,
            totalPaginas,
        },
    };
};

export const listarCategoriasPublicService = async (params: PaginacionParams & { buscar?: string | null }) => {
    const { rows, totalRegistros } = await listarCategoriasPublicRepo(params);
    return {
        data: rows,
        paginacion: construirPaginacion(totalRegistros, params.pagina ?? null, params.registrosPorPagina ?? null),
    };
};

export const listarGenerosPublicService = async (params: PaginacionParams) => {
    const { rows, totalRegistros } = await listarGenerosPublicRepo(params);
    return {
        data: rows,
        paginacion: construirPaginacion(totalRegistros, params.pagina ?? null, params.registrosPorPagina ?? null),
    };
};

export const listarAtributosPublicService = async (params: PaginacionParams) => {
    const { rows, totalRegistros } = await listarAtributosPublicRepo(params);
    return {
        data: rows,
        paginacion: construirPaginacion(totalRegistros, params.pagina ?? null, params.registrosPorPagina ?? null),
    };
};

export const listarValoresAtributoPublicService = async (idaAtributo: number | null, params: PaginacionParams) => {
    const { rows, totalRegistros } = await listarValoresAtributoPublicRepo(idaAtributo, params);
    return {
        data: rows,
        paginacion: construirPaginacion(totalRegistros, params.pagina ?? null, params.registrosPorPagina ?? null),
    };
};