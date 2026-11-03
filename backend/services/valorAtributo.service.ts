import { construirPaginacion } from "../utils/paginacion.js";
import {
    listarValoresAtributoRepo,
    obtenerValorAtributoPorIdRepo,
    crearValorAtributoRepo,
    actualizarValorAtributoRepo,
    eliminarValorAtributoRepo,
} from "../repositories/valorAtributo.repository.js";

export const obtenerValoresAtributoService = async (
    IDAtributo: number | null = null,
    paginacion: { pagina?: number | null; registrosPorPagina?: number | null } = {}
) => {
    const { rows, totalRegistros } = await listarValoresAtributoRepo(IDAtributo, paginacion);
    return {
        data: rows,
        paginacion: construirPaginacion(
            totalRegistros,
            paginacion.pagina ?? null,
            paginacion.registrosPorPagina ?? null
        ),
    };
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


