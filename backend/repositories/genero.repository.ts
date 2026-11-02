import { dbConnect, sql } from "../config/db/connection.js";

export const listarGenerosRepo = async () => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .execute("dbo.SP_Producto_ObtenerGeneros");

    return result.recordset ?? [];
};

export const obtenerGeneroPorIdRepo = async (IDGenero: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDGenero", sql.Int, IDGenero)
        .execute("dbo.SP_Producto_ObtenerGeneroPorID");

    return result.recordset?.[0] ?? null;
};

export const crearGeneroRepo = async (nombre: string) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("Nombre", sql.VarChar(50), nombre.trim())
        .execute("dbo.SP_Producto_CrearGenero");

    return result.recordset?.[0] ?? null;
};

export const actualizarGeneroRepo = async (
    IDGenero: number,
    nombre: string,
    estado: boolean
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDGenero", sql.Int, IDGenero)
        .input("Nombre", sql.VarChar(50), nombre.trim())
        .input("Estado", sql.Bit, estado ? 1 : 0)
        .execute("dbo.SP_Producto_ActualizarGenero");

    return result.recordset?.[0] ?? null;
};

export const eliminarGeneroRepo = async (IDGenero: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDGenero", sql.Int, IDGenero)
        .execute("dbo.SP_Producto_EliminarGenero");

    return result.recordset?.[0] ?? null;
};
