import { dbConnect, sql } from "../config/db/connection.js";

export const listarCategorias = async (page: number, limit: number, search: string) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("Page", sql.Int, page)
        .input("Limit", sql.Int, limit)
        .input("Search", sql.NVarChar(255), search.trim())
        .execute("dbo.SP_Categorias_ListarCategoria");

    return result;
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
