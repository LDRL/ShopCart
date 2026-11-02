import {
    listarGenerosRepo,
    obtenerGeneroPorIdRepo,
    crearGeneroRepo,
    actualizarGeneroRepo,
    eliminarGeneroRepo,
} from "../repositories/genero.repository.js";

export const obtenerGenerosService = async () => {
    return await listarGenerosRepo();
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
