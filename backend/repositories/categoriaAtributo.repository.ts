import { dbConnect, sql } from "../config/db/connection.js";

export const listarCategoriasAtributosRepo = async (
    IDCategoria: number | null = null,
    params: { pagina?: number | null; registrosPorPagina?: number | null } = {}
) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("IDCategoria", sql.Int, IDCategoria)
        .execute("dbo.SP_Producto_ObtenerCategoriasAtributos");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];

    return { rows, totalRegistros };
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


