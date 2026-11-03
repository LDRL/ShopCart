import {
    listarPedidosDashboardRepo,
    ventasPorPeriodoRepo,
    ventasPorCategoriaRepo,
    topProductosRepo,
} from "../repositories/dashboard.repository.js";
import { construirPaginacion } from "../utils/paginacion.js";

export const listarPedidosDashboardService = async (params: any) => {
    const { rows, totalRegistros } = await listarPedidosDashboardRepo(params);
    return {
        data: rows,
        paginacion: construirPaginacion(
            totalRegistros,
            params.pagina ?? null,
            params.registrosPorPagina ?? null
        ),
    };
};

export const ventasPorPeriodoService = async (params: any) => {
    return await ventasPorPeriodoRepo(params);
};

export const ventasPorCategoriaService = async (params: any) => {
    return await ventasPorCategoriaRepo(params);
};

export const topProductosService = async (params: any) => {
    return await topProductosRepo(params);
};