import {
    listarValoresAtributoRepo,
    obtenerValorAtributoPorIdRepo,
    crearValorAtributoRepo,
    actualizarValorAtributoRepo,
    eliminarValorAtributoRepo,
} from "../repositories/valorAtributo.repository.js";

export const obtenerValoresAtributoService = async (IDAtributo?: number) => {
    return await listarValoresAtributoRepo(IDAtributo);
};

export const obtenerValorAtributoPorIdService = async (IDValorAtributo: number) => {
    const valor = await obtenerValorAtributoPorIdRepo(IDValorAtributo);

    if (!valor) {
        throw new Error("VALOR_ATRIBUTO_NO_ENCONTRADO");
    }

    return valor;
};

export const crearValorAtributoService = async (IDAtributo: number, valor: string) => {
    return await crearValorAtributoRepo(IDAtributo, valor);
};

export const actualizarValorAtributoService = async (
    IDValorAtributo: number,
    IDAtributo: number,
    valor: string
) => {
    return await actualizarValorAtributoRepo(IDValorAtributo, IDAtributo, valor);
};

export const eliminarValorAtributoService = async (IDValorAtributo: number) => {
    return await eliminarValorAtributoRepo(IDValorAtributo);
};
