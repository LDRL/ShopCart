import {
    listarCategoriasAtributosRepo,
    obtenerCategoriaAtributoPorIdRepo,
    crearCategoriaAtributoRepo,
    actualizarCategoriaAtributoRepo,
    eliminarCategoriaAtributoRepo,
} from "../repositories/categoriaAtributo.repository.js";

export const obtenerCategoriasAtributosService = async (IDCategoria?: number) => {
    return await listarCategoriasAtributosRepo(IDCategoria);
};

export const obtenerCategoriaAtributoPorIdService = async ( IDCategoriaAtributo: number ) => {
    const asociacion = await obtenerCategoriaAtributoPorIdRepo(IDCategoriaAtributo);

    if (!asociacion) {
        throw new Error("CATEGORIA_ATRIBUTO_NO_ENCONTRADO");
    }

    return asociacion;
};

export const crearCategoriaAtributoService = async ( IDCategoria: number, IDAtributo: number, obligatorio: boolean ) => {
    return await crearCategoriaAtributoRepo(IDCategoria, IDAtributo, obligatorio);
};

export const actualizarCategoriaAtributoService = async ( IDCategoriaAtributo: number, IDCategoria: number, IDAtributo: number, obligatorio: boolean ) => {
    return await actualizarCategoriaAtributoRepo(
        IDCategoriaAtributo,
        IDCategoria,
        IDAtributo,
        obligatorio
    );
};

export const eliminarCategoriaAtributoService = async (
    IDCategoriaAtributo: number
) => {
    return await eliminarCategoriaAtributoRepo(IDCategoriaAtributo);
};
