export interface PaginacionParams {
    pagina?: number | null;
    registrosPorPagina?: number | null;
}

import { dbConnect, sql } from "../config/db/connection.js";

export const listarAtributosRepo = async (params: PaginacionParams = {}) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .execute("dbo.SP_Producto_ObtenerAtributos");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];

    return { rows, totalRegistros };
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
