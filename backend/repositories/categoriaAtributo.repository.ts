import { dbConnect, sql } from "../config/db/connection.js";

export const listarCategoriasAtributosRepo = async (IDCategoria?: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCategoria", sql.Int, IDCategoria ?? null)
        .execute("dbo.SP_Producto_ObtenerCategoriasAtributos");

    return result.recordset ?? [];
};

export const obtenerCategoriaAtributoPorIdRepo = async (
    IDCategoriaAtributo: number
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCategoriaAtributo", sql.Int, IDCategoriaAtributo)
        .execute("dbo.SP_Producto_ObtenerCategoriaAtributoPorID");

    return result.recordset?.[0] ?? null;
};

export const crearCategoriaAtributoRepo = async (
    IDCategoria: number,
    IDAtributo: number,
    obligatorio: boolean
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCategoria", sql.Int, IDCategoria)
        .input("IDAtributo", sql.Int, IDAtributo)
        .input("Obligatorio", sql.Bit, obligatorio)
        .execute("dbo.SP_Producto_CrearCategoriaAtributo");

    return result.recordset?.[0] ?? null;
};

export const actualizarCategoriaAtributoRepo = async (
    IDCategoriaAtributo: number,
    IDCategoria: number,
    IDAtributo: number,
    obligatorio: boolean
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCategoriaAtributo", sql.Int, IDCategoriaAtributo)
        .input("IDCategoria", sql.Int, IDCategoria)
        .input("IDAtributo", sql.Int, IDAtributo)
        .input("Obligatorio", sql.Bit, obligatorio)
        .execute("dbo.SP_Producto_ActualizarCategoriaAtributo");

    return result.recordset?.[0] ?? null;
};

export const eliminarCategoriaAtributoRepo = async (IDCategoriaAtributo: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCategoriaAtributo", sql.Int, IDCategoriaAtributo)
        .execute("dbo.SP_Producto_EliminarCategoriaAtributo");

    return result.recordset?.[0] ?? null;
};
