import { dbConnect, sql } from "../config/db/connection.js";

export const listarPedidosDashboardRepo = async (params: {
    IDEstadoPedido?: number | null;
    IDCliente?: number | null;
    FechaDesde?: Date | string | null;
    FechaHasta?: Date | string | null;
    Buscar?: string | null;
    pagina?: number | null;
    registrosPorPagina?: number | null;
}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("IDEstadoPedido", sql.Int, params.IDEstadoPedido ?? null)
        .input("IDCliente", sql.Int, params.IDCliente ?? null)
        .input("FechaDesde", sql.DateTime2, params.FechaDesde ?? null)
        .input("FechaHasta", sql.DateTime2, params.FechaHasta ?? null)
        .input("Buscar", sql.VarChar(100), params.Buscar ?? null)
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .execute("dbo.SP_Dashboard_ListarPedidos");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];
    return { rows, totalRegistros };
};

export const ventasPorPeriodoRepo = async (params: {
    Periodo?: string;
    FechaDesde?: Date | string | null;
    FechaHasta?: Date | string | null;
}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Periodo", sql.VarChar(10), params.Periodo ?? "dia")
        .input("FechaDesde", sql.DateTime2, params.FechaDesde ?? null)
        .input("FechaHasta", sql.DateTime2, params.FechaHasta ?? null)
        .execute("dbo.SP_Dashboard_VentasPorPeriodo");
    return result.recordset ?? [];
};

export const ventasPorCategoriaRepo = async (params: {
    FechaDesde?: Date | string | null;
    FechaHasta?: Date | string | null;
}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("FechaDesde", sql.DateTime2, params.FechaDesde ?? null)
        .input("FechaHasta", sql.DateTime2, params.FechaHasta ?? null)
        .execute("dbo.SP_Dashboard_VentasPorCategoria");
    return result.recordset ?? [];
};

export const topProductosRepo = async (params: {
    FechaDesde?: Date | string | null;
    FechaHasta?: Date | string | null;
    Top?: number;
}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("FechaDesde", sql.DateTime2, params.FechaDesde ?? null)
        .input("FechaHasta", sql.DateTime2, params.FechaHasta ?? null)
        .input("Top", sql.Int, params.Top ?? 10)
        .execute("dbo.SP_Dashboard_TopProductos");
    return result.recordset ?? [];
};