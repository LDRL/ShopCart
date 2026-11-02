import {
    listarAtributosRepo,
    obtenerAtributoPorIdRepo,
    crearAtributoRepo,
    actualizarAtributoRepo,
    eliminarAtributoRepo,
} from "../repositories/atributo.repository.js";

export const obtenerAtributosService = async () => {
    return await listarAtributosRepo();
};

export const obtenerAtributoPorIdService = async (IDAtributo: number) => {
    const atributo = await obtenerAtributoPorIdRepo(IDAtributo);

    if (!atributo) {
        throw new Error("ATRIBUTO_NO_ENCONTRADO");
    }

    return atributo;
};

export const crearAtributoService = async (nombre: string, rol: string) => {
    return await crearAtributoRepo(nombre, rol);
};

export const actualizarAtributoService = async (
    IDAtributo: number,
    nombre: string,
    estado: boolean,
    rol: string
) => {
    return await actualizarAtributoRepo(IDAtributo, nombre, estado, rol);
};

export const eliminarAtributoService = async (IDAtributo: number) => {
    return await eliminarAtributoRepo(IDAtributo);
};
