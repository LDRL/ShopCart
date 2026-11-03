import { dbConnect, sql } from "../config/db/connection.js";

export interface PaginacionParams {
    pagina?: number | null;
    registrosPorPagina?: number | null;
}

export const listarCategoriasRepo = async (
    params: PaginacionParams & { buscar?: string | null } = {}
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("Buscar", sql.VarChar(100), params.buscar ?? null)
        .execute("dbo.SP_Categorias_ListarCategoria");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];

    return { rows, totalRegistros };
};

export const obtenerCategoriaPorId = async (id: number) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("id", sql.Int, id)
        .execute("dbo.SP_Categorias_BuscarIdCategoria");

    return result.recordset?.[0] ?? null;
};

export const crearCategoria = async (nombre: string) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("P_NOMBRE", sql.VarChar(45), nombre.trim())
        .execute("dbo.SP_Categorias_CrearCategoria");

    return result.recordset?.[0] ?? null;
};

export const actualizarCategoria = async (id: number, nombre: string) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("P_NOMBRE", sql.VarChar(45), nombre.trim())
        .input("P_ID_CATEGORIA", sql.Int, id)
        .execute("dbo.SP_Categorias_ActualizarCategoria");

    return result.recordset?.[0] ?? null;
};

export const eliminarCategoria = async (id: number) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("P_ID_CATEGORIA", sql.Int, id)
        .execute("dbo.SP_Categorias_EliminarCategoria");

    return result.recordset?.[0] ?? null;
};