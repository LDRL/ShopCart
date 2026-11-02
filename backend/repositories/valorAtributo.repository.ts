import { dbConnect, sql } from "../config/db/connection.js";

export const listarValoresAtributoRepo = async (IDAtributo?: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDAtributo", sql.Int, IDAtributo ?? null)
        .execute("dbo.SP_Producto_ObtenerValoresAtributo");

    return result.recordset ?? [];
};

export const obtenerValorAtributoPorIdRepo = async (IDValorAtributo: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDValorAtributo", sql.Int, IDValorAtributo)
        .execute("dbo.SP_Producto_ObtenerValorAtributoPorID");

    return result.recordset?.[0] ?? null;
};

export const crearValorAtributoRepo = async (IDAtributo: number, valor: string) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDAtributo", sql.Int, IDAtributo)
        .input("Valor", sql.VarChar(100), valor.trim())
        .execute("dbo.SP_Producto_CrearValorAtributo");

    return result.recordset?.[0] ?? null;
};

export const actualizarValorAtributoRepo = async (
    IDValorAtributo: number,
    IDAtributo: number,
    valor: string
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDValorAtributo", sql.Int, IDValorAtributo)
        .input("IDAtributo", sql.Int, IDAtributo)
        .input("Valor", sql.VarChar(100), valor.trim())
        .execute("dbo.SP_Producto_ActualizarValorAtributo");

    return result.recordset?.[0] ?? null;
};

export const eliminarValorAtributoRepo = async (IDValorAtributo: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDValorAtributo", sql.Int, IDValorAtributo)
        .execute("dbo.SP_Producto_EliminarValorAtributo");

    return result.recordset?.[0] ?? null;
};
