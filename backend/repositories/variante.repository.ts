import { dbConnect, sql } from "../config/db/connection.js";

export const listarVariantesRepo = async (
    IDProducto: number,
    params: { pagina?: number | null; registrosPorPagina?: number | null } = {}
) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("IDProducto", sql.Int, IDProducto)
        .execute("dbo.SP_Producto_ObtenerVariantes");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];

    return { rows, totalRegistros };
};

export const obtenerAtributosCategoriaRepo = async (
    IDCategoria: number,
    params: { pagina?: number | null; registrosPorPagina?: number | null } = {}
) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("IDCategoria", sql.Int, IDCategoria)
        .execute("dbo.SP_Producto_ObtenerAtributosCategoria");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];

    return { rows, totalRegistros };
};

