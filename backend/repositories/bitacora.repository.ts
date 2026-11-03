import { dbConnect, sql } from "../config/db/connection.js";

export const listarBitacoraRepo = async (params: {
    modulo?: string | null;
    pagina?: number | null;
    registrosPorPagina?: number | null;
}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Modulo", sql.VarChar(50), params.modulo ?? null)
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .execute("dbo.SP_Bitacora_Listar");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];
    return { rows, totalRegistros };
};