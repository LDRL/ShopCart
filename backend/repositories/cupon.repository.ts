import { dbConnect, sql } from "../config/db/connection.js";

export type TipoDescuento = "Porcentaje" | "MontoFijo";

export interface CuponInput {
    codigo: string;
    tipoDescuento: TipoDescuento;
    valorDescuento: number;
    montoMinimo?: number;
    limiteUsosTotal?: number | null;
    limiteUsosCliente?: number | null;
    fechaInicio: Date;
    fechaFin: Date;
    estado?: boolean;
    categorias?: number[] | null;
}

export interface LineaCarritoValidacion {
    IDProductoVariante: number;
    cantidad: number;
}

export interface ValidarCuponInput {
    codigo: string;
    IDUsuario: number | null;
    tokenInvitado?: string | null;
    lineas: LineaCarritoValidacion[];
}

export interface CuponValidacionResultado {
    valido: boolean;
    motivo: string | null;
    mensaje: string;
    IDCupon: number | null;
    codigo: string | null;
    tipoDescuento: TipoDescuento | null;
    valorDescuento: number | null;
    montoMinimo: number | null;
    subtotalCarrito: number;
    subtotalElegible: number;
    montoDescuento: number;
    totalConDescuento: number;
}

const serializarCategorias = (categorias?: number[] | null): string =>
    JSON.stringify(categorias ?? []);

const parsearCategorias = (valor: unknown): number[] => {
    if (typeof valor !== "string" || valor.length === 0) {
        return [];
    }

    return valor
        .split(",")
        .map((id) => Number(id))
        .filter((id) => Number.isSafeInteger(id) && id > 0);
};

export const crearCuponRepo = async (input: CuponInput) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("Codigo", sql.VarChar(50), input.codigo)
        .input("TipoDescuento", sql.VarChar(20), input.tipoDescuento)
        .input("ValorDescuento", sql.Decimal(10, 2), input.valorDescuento)
        .input("MontoMinimo", sql.Decimal(10, 2), input.montoMinimo ?? 0)
        .input("LimiteUsosTotal", sql.Int, input.limiteUsosTotal ?? null)
        .input("LimiteUsosCliente", sql.Int, input.limiteUsosCliente ?? null)
        .input("FechaInicio", sql.DateTime2, input.fechaInicio)
        .input("FechaFin", sql.DateTime2, input.fechaFin)
        .input("Estado", sql.Bit, input.estado ?? true)
        .input("Categorias", sql.NVarChar(sql.MAX), serializarCategorias(input.categorias))
        .execute("dbo.SP_Cupones_CrearCupon");

    return result.recordset?.[0] ?? null;
};

export const actualizarCuponRepo = async (
    IDCupon: number,
    input: CuponInput
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCupon", sql.Int, IDCupon)
        .input("Codigo", sql.VarChar(50), input.codigo)
        .input("TipoDescuento", sql.VarChar(20), input.tipoDescuento)
        .input("ValorDescuento", sql.Decimal(10, 2), input.valorDescuento)
        .input("MontoMinimo", sql.Decimal(10, 2), input.montoMinimo ?? 0)
        .input("LimiteUsosTotal", sql.Int, input.limiteUsosTotal ?? null)
        .input("LimiteUsosCliente", sql.Int, input.limiteUsosCliente ?? null)
        .input("FechaInicio", sql.DateTime2, input.fechaInicio)
        .input("FechaFin", sql.DateTime2, input.fechaFin)
        .input("Estado", sql.Bit, input.estado ?? null)
        .input("Categorias", sql.NVarChar(sql.MAX), serializarCategorias(input.categorias))
        .execute("dbo.SP_Cupones_ActualizarCupon");

    return result.recordset?.[0] ?? null;
};

export const eliminarCuponRepo = async (IDCupon: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCupon", sql.Int, IDCupon)
        .execute("dbo.SP_Cupones_EliminarCupon");

    return result.recordset?.[0] ?? null;
};

export interface PaginacionParams {
    pagina?: number | null;
    registrosPorPagina?: number | null;
}

export const listarCuponesRepo = async (
    params: PaginacionParams & { buscar?: string | null } = {}
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("Buscar", sql.VarChar(50), params.buscar ?? null)
        .execute("dbo.SP_Cupones_ObtenerCupones");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];

    return {
        rows: rows.map((row: any) => ({
            ...row,
            categorias: parsearCategorias(row.categorias),
        })),
        totalRegistros,
    };
};

export const obtenerCuponPorIdRepo = async (IDCupon: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCupon", sql.Int, IDCupon)
        .execute("dbo.SP_Cupones_ObtenerCuponPorID");

    const row = result.recordset?.[0];

    if (!row) {
        return null;
    }

    return {
        ...row,
        categorias: parsearCategorias(row.categorias),
    };
};

export const validarCuponRepo = async (
    input: ValidarCuponInput
): Promise<CuponValidacionResultado | null> => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("Codigo", sql.VarChar(50), input.codigo)
        .input("IDUsuario", sql.Int, input.IDUsuario)
        .input("Lineas", sql.NVarChar(sql.MAX), JSON.stringify(input.lineas))
        .input("TokenInvitado", sql.VarChar(64), input.tokenInvitado ?? null)
        .execute("dbo.SP_Cupones_ValidarCupon");

    return (
        (result.recordset?.[0] as CuponValidacionResultado | undefined) ?? null
    );
};

