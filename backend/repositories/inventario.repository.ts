import { dbConnect, sql } from "../config/db/connection.js";

export interface MovimientoInventarioInput {
    IDProductoVariante: number;
    IDTipoMovimiento: number;
    IDUsuario: number;
    cantidad: number;
    motivo: string;
    IDPedido?: number | null;
}

export const registrarMovimientoRepo = async (
    input: MovimientoInventarioInput
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDProductoVariante", sql.Int, input.IDProductoVariante)
        .input("IDTipoMovimiento", sql.Int, input.IDTipoMovimiento)
        .input("IDUsuario", sql.Int, input.IDUsuario)
        .input("Cantidad", sql.Int, input.cantidad)
        .input("Motivo", sql.VarChar(500), input.motivo.trim())
        .input("IDPedido", sql.Int, input.IDPedido ?? null)
        .execute("dbo.SP_Inventario_RegistrarMovimiento");

    return result.recordset?.[0] ?? null;
};

export const obtenerDisponibilidadRepo = async (IDProductoVariante: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDProductoVariante", sql.Int, IDProductoVariante)
        .execute("dbo.SP_Inventario_ObtenerDisponibilidad");

    return result.recordset?.[0] ?? null;
};

export const obtenerKardexRepo = async (IDProductoVariante: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDProductoVariante", sql.Int, IDProductoVariante)
        .execute("dbo.SP_Inventario_ObtenerKardex");

    return result.recordset ?? [];
};
