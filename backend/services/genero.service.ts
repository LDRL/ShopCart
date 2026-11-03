import { listarGenerosRepo, obtenerGeneroPorIdRepo, crearGeneroRepo, actualizarGeneroRepo, eliminarGeneroRepo, type PaginacionParams, } from "../repositories/genero.repository.js";
import { construirPaginacion } from "../utils/paginacion.js";

export const obtenerGenerosService = async (paginacion: PaginacionParams) => {
    const { rows, totalRegistros } = await listarGenerosRepo(paginacion);
    return {
        data: rows,
        paginacion: construirPaginacion(totalRegistros, paginacion.pagina ?? null, paginacion.registrosPorPagina ?? null),
    };
};

export const obtenerGeneroPorIdService = async (IDGenero: number) => {
    const genero = await obtenerGeneroPorIdRepo(IDGenero);

    if (!genero) {
        throw new Error("GENERO_NO_ENCONTRADO");
    }

    return genero;
};

export const crearGeneroService = async (nombre: string) => {
    return await crearGeneroRepo(nombre);
};

export const actualizarGeneroService = async (
    IDGenero: number,
    nombre: string,
    estado: boolean
) => {
    return await actualizarGeneroRepo(IDGenero, nombre, estado);
};

export const eliminarGeneroService = async (IDGenero: number) => {
    return await eliminarGeneroRepo(IDGenero);
};
