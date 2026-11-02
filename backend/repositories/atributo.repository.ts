import { dbConnect, sql } from "../config/db/connection.js";

export const listarAtributosRepo = async () => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .execute("dbo.SP_Producto_ObtenerAtributos");

    return result.recordset ?? [];
};

export const obtenerAtributoPorIdRepo = async (IDAtributo: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDAtributo", sql.Int, IDAtributo)
        .execute("dbo.SP_Producto_ObtenerAtributoPorID");

    return result.recordset?.[0] ?? null;
};

export const crearAtributoRepo = async (nombre: string, rol: string) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("Nombre", sql.VarChar(100), nombre.trim())
        .input("Rol", sql.VarChar(20), rol)
        .execute("dbo.SP_Producto_CrearAtributo");

    return result.recordset?.[0] ?? null;
};

export const actualizarAtributoRepo = async (
    IDAtributo: number,
    nombre: string,
    estado: boolean,
    rol: string
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDAtributo", sql.Int, IDAtributo)
        .input("Nombre", sql.VarChar(100), nombre.trim())
        .input("Estado", sql.Bit, estado ? 1 : 0)
        .input("Rol", sql.VarChar(20), rol)
        .execute("dbo.SP_Producto_ActualizarAtributo");

    return result.recordset?.[0] ?? null;
};

export const eliminarAtributoRepo = async (IDAtributo: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDAtributo", sql.Int, IDAtributo)
        .execute("dbo.SP_Producto_EliminarAtributo");

    return result.recordset?.[0] ?? null;
};
