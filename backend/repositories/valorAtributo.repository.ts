import { dbConnect, sql } from "../config/db/connection.js";

export const listarValoresAtributoRepo = async (
    IDAtributo: number | null = null,
    params: { pagina?: number | null; registrosPorPagina?: number | null } = {}
) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("IDAtributo", sql.Int, IDAtributo)
        .execute("dbo.SP_Producto_ObtenerValoresAtributo");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];

    return { rows, totalRegistros };
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


