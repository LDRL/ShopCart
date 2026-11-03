import {
    listarCategoriasRepo,
    obtenerCategoriaPorId,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    type PaginacionParams,
} from "../repositories/categoria.repository.js";
import { construirPaginacion } from "../utils/paginacion.js";

export const obtenerCategorias = async (
    params: PaginacionParams & { buscar?: string | null } = {}
) => {
    const { rows, totalRegistros } = await listarCategoriasRepo(params);
    return {
        data: rows,
        paginacion: construirPaginacion(
            totalRegistros,
            params.pagina ?? null,
            params.registrosPorPagina ?? null
        ),
    };
};

export const obtenerCategoria = async (id: number) => {
    const categoria = await obtenerCategoriaPorId(id);
    if (!categoria) {
        throw new Error("CATEGORIA_NO_ENCONTRADA");
    }
    return categoria;
};

export const crearCategoriaService = async (nombre: string) => {
    return crearCategoria(nombre);
};

export const actualizarCategoriaService = async (id: number, nombre: string) => {
    return actualizarCategoria(id, nombre);
};

export const eliminarCategoriaService = async (id: number) => {
    return eliminarCategoria(id);
};