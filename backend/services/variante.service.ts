import {
    listarVariantesRepo,
    obtenerAtributosCategoriaRepo,
} from "../repositories/variante.repository.js";

export const obtenerVariantesService = async (IDProducto: number) => {
    return await listarVariantesRepo(IDProducto);
};

export const obtenerAtributosCategoriaService = async (IDCategoria: number) => {
    return await obtenerAtributosCategoriaRepo(IDCategoria);
};
