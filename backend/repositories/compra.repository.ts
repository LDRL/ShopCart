import { dbConnect, sql } from "../config/db/connection.js";

export interface CompraDetalleInput {
    IDProductoVariante: number;
    cantidad: number;
    costoUnitario: number;
    montoDescuento?: number | null;
}

export interface CompraInput {
    IDProveedor: number;
    IDUsuario: number;
    detalles: CompraDetalleInput[];
    montoDescuento?: number;
    costoEnvio?: number;
    observaciones?: string | null;
}

export const crearCompraRepo = async (input: CompraInput) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDProveedor", sql.Int, input.IDProveedor)
        .input("IDUsuario", sql.Int, input.IDUsuario)
        .input("Detalles", sql.NVarChar(sql.MAX), JSON.stringify(input.detalles))
        .input("MontoDescuento", sql.Decimal(12, 2), input.montoDescuento ?? 0)
        .input("CostoEnvio", sql.Decimal(12, 2), input.costoEnvio ?? 0)
        .input("Observaciones", sql.VarChar(500), input.observaciones ?? null)
        .execute("dbo.SP_Compras_CrearCompra");

    return result.recordset?.[0] ?? null;
};

export const listarComprasRepo = async () => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .execute("dbo.SP_Compras_ListarCompras");

    return result.recordset ?? [];
};

export const obtenerCompraPorIdRepo = async (IDCompra: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCompra", sql.Int, IDCompra)
        .execute("dbo.SP_Compras_ObtenerCompraPorID");

    const recordsets = Array.isArray(result.recordsets)
        ? result.recordsets
        : [];
    const compra = recordsets[0]?.[0] ?? null;

    if (!compra) {
        return null;
    }

    return {
        ...compra,
        detalles: recordsets[1] ?? [],
    };
};

export const anularCompraRepo = async (
    IDCompra: number,
    IDUsuario: number,
    motivo: string
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCompra", sql.Int, IDCompra)
        .input("IDUsuario", sql.Int, IDUsuario)
        .input("Motivo", sql.VarChar(500), motivo)
        .execute("dbo.SP_Compras_AnularCompra");

    return result.recordset?.[0] ?? null;
};
