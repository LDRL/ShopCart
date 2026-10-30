import {
    listarCategorias,
    obtenerCategoriaPorId,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
} from "../repositories/categoria.repository.js";

export const obtenerCategorias = async (pageStr: string, limiteStr: string, search: string) => {
    const paginated = pageStr !== "";
    const pageNumber = paginated ? Number(pageStr) : 0;
    const limitNumber = paginated ? Number(limiteStr) : 0;

    const result = await listarCategorias(pageNumber, limitNumber, search);
    const recordsets = result.recordsets;

    const rows: Array<{ Total?: number | string; [key: string]: unknown }> =
        Array.isArray(recordsets) ? (recordsets[0] ?? []) : [];

    const secondSet = Array.isArray(recordsets)
        ? (recordsets[1] as Array<{ Total?: number | string }> | undefined)
        : undefined;

    const lastRow = rows[rows.length - 1];
    const totalFromLastRow = lastRow?.Total !== undefined ? Number(lastRow.Total) : undefined;
    const totalFromSecondSet = secondSet?.[0]?.Total !== undefined ? Number(secondSet[0].Total) : undefined;

    const total = totalFromSecondSet ?? totalFromLastRow ?? rows.length;
    const data = totalFromLastRow !== undefined ? rows.slice(0, -1) : rows;
    const totalPages = paginated ? Math.ceil(total / limitNumber) : 1;

    return {
        data,
        total,
        limit: limitNumber,
        currentPage: pageNumber,
        totalPages,
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
