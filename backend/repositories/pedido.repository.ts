import { dbConnect, sql } from "../config/db/connection.js";

export interface PedidoProductoInput {
    IDProductoVariante: number;
    cantidad: number;
}

export interface CrearPedidoInput {
    IDUsuario: number | null;
    tokenInvitado?: string | null;
    productos: PedidoProductoInput[];
    codigoCupon?: string | null;
    direccionEntrega: string;
    observaciones?: string | null;
    nombre?: string | null;
    apellido?: string | null;
    correo?: string | null;
    minutosExpiracion?: number;
}

export interface CambiarEstadoPedidoInput {
    IDPedido: number;
    IDEstadoNuevo: number;
    IDUsuario: number | null;
    tokenInvitado?: string | null;
    observaciones?: string | null;
}

export interface DevolucionProductoInput {
    IDPedidoDetalle: number;
    cantidad: number;
}

export interface CrearDevolucionInput {
    IDPedido: number;
    IDUsuario: number | null;
    tokenInvitado?: string | null;
    productos: DevolucionProductoInput[];
    motivo: string;
    IDCliente?: number | null;
}

export interface CambiarEstadoDevolucionInput {
    IDDevolucion: number;
    IDEstadoNuevo: string;
    IDUsuario: number;
    observaciones?: string | null;
}

export const obtenerIdClientePorUsuarioRepo = async ( IDUsuario: number ): Promise<number | null> => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDUsuario", sql.Int, IDUsuario)
        .query("SELECT IDCliente FROM dbo.Clientes WHERE IDUsuario = @IDUsuario");

    return result.recordset?.[0]?.IDCliente ?? null;
};

export const obtenerResumenPedidoRepo = async (IDPedido: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDPedido", sql.Int, IDPedido)
        .query(
            "SELECT IDPedido, IDUsuario, IDCliente, IDEstadoPedido, tokenInvitado FROM dbo.Pedidos WHERE IDPedido = @IDPedido"
        );

    return result.recordset?.[0] ?? null;
};

export const obtenerEstadoDevolucionRepo = async (IDDevolucion: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDDevolucion", sql.Int, IDDevolucion)
        .query(
            "SELECT IDDevolucion, IDPedido, estado, IDUsuario FROM dbo.PedidosDevoluciones WHERE IDDevolucion = @IDDevolucion"
        );

    return result.recordset?.[0] ?? null;
};

export const crearPedidoRepo = async (input: CrearPedidoInput) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDUsuario", sql.Int, input.IDUsuario)
        .input("Lineas", sql.NVarChar(sql.MAX), JSON.stringify(input.productos))
        .input("CodigoCupon", sql.VarChar(50), input.codigoCupon ?? null)
        .input("DireccionEntrega", sql.VarChar(500), input.direccionEntrega)
        .input("Observaciones", sql.VarChar(500), input.observaciones ?? null)
        .input("NombreContacto", sql.VarChar(100), input.nombre ?? null)
        .input("ApellidoContacto", sql.VarChar(100), input.apellido ?? null)
        .input("CorreoContacto", sql.VarChar(150), input.correo ?? null)
        .input("MinutosExpiracion", sql.Int, input.minutosExpiracion ?? 15)
        .input("TokenInvitado", sql.VarChar(64), input.tokenInvitado ?? null)
        .input("IvaPorcentaje", sql.Decimal(5, 2), Number(process.env.IVA_PORCENTAJE ?? 12))
        .execute("dbo.SP_Pedidos_CrearPedido");

    return result.recordset?.[0] ?? null;
};

export const cambiarEstadoPedidoRepo = async (
    input: CambiarEstadoPedidoInput
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDPedido", sql.Int, input.IDPedido)
        .input("IDEstadoNuevo", sql.Int, input.IDEstadoNuevo)
        .input("IDUsuario", sql.Int, input.IDUsuario)
        .input("Observaciones", sql.VarChar(500), input.observaciones ?? null)
        .input("TokenInvitado", sql.VarChar(64), input.tokenInvitado ?? null)
        .execute("dbo.SP_Pedidos_CambiarEstado");

    return result.recordset?.[0] ?? null;
};

export const listarPedidosRepo = async (params: {
    IDCliente?: number | null;
    IDEstadoPedido?: number | null;
    buscar?: string | null;
    pagina?: number | null;
    registrosPorPagina?: number | null;
    tokenInvitado?: string | null;
}) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDCliente", sql.Int, params.IDCliente ?? null)
        .input("IDEstadoPedido", sql.Int, params.IDEstadoPedido ?? null)
        .input("Buscar", sql.VarChar(100), params.buscar ?? null)
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("TokenInvitado", sql.VarChar(64), params.tokenInvitado ?? null)
        .execute("dbo.SP_Pedidos_ListarPedidos");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const pedidos = recordsets[1] ?? [];

    return {
        pedidos,
        totalRegistros,
    };
};

export const obtenerPedidoRepo = async (
    IDPedido: number,
    IDCliente?: number | null,
    tokenInvitado?: string | null
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDPedido", sql.Int, IDPedido)
        .input("IDCliente", sql.Int, IDCliente ?? null)
        .input("TokenInvitado", sql.VarChar(64), tokenInvitado ?? null)
        .execute("dbo.SP_Pedidos_ObtenerPedido");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const pedido = recordsets[0]?.[0] ?? null;

    if (!pedido) {
        return null;
    }

    return {
        pedido,
        detalles: recordsets[1] ?? [],
        historial: recordsets[2] ?? [],
    };
};

export const crearDevolucionRepo = async (input: CrearDevolucionInput) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDPedido", sql.Int, input.IDPedido)
        .input("IDUsuario", sql.Int, input.IDUsuario)
        .input("TokenInvitado", sql.VarChar(64), input.tokenInvitado ?? null)
        .input("Lineas", sql.NVarChar(sql.MAX), JSON.stringify(input.productos))
        .input("Motivo", sql.VarChar(500), input.motivo)
        .input("IDCliente", sql.Int, input.IDCliente ?? null)
        .execute("dbo.SP_Devoluciones_SolicitarDevolucion");

    return result.recordset?.[0] ?? null;
};

export const cambiarEstadoDevolucionRepo = async (
    input: CambiarEstadoDevolucionInput
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDDevolucion", sql.Int, input.IDDevolucion)
        .input("IDEstadoNuevo", sql.VarChar(20), input.IDEstadoNuevo)
        .input("IDUsuario", sql.Int, input.IDUsuario)
        .input("Observaciones", sql.VarChar(500), input.observaciones ?? null)
        .execute("dbo.SP_Devoluciones_CambiarEstado");

    return result.recordset?.[0] ?? null;
};

export const listarDevolucionesPorPedidoRepo = async (
    IDPedido: number,
    IDCliente?: number | null,
    tokenInvitado?: string | null,
    pagina?: number | null,
    registrosPorPagina?: number | null
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDPedido", sql.Int, IDPedido)
        .input("IDCliente", sql.Int, IDCliente ?? null)
        .input("TokenInvitado", sql.VarChar(64), tokenInvitado ?? null)
        .input("Pagina", sql.Int, pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, registrosPorPagina ?? null)
        .execute("dbo.SP_Devoluciones_ListarPorPedido");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];

    /* Si el pedido no coincide con el cliente/token, el SP no devuelve filas */
    if (recordsets.length === 0) {
        return {
            devoluciones: [],
            detalles: [],
            totalRegistros: 0,
        };
    }

    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const devoluciones = recordsets[1] ?? [];
    const detalles = recordsets[2] ?? [];

    return {
        devoluciones,
        detalles,
        totalRegistros,
    };
};

export const listarDevolucionesRepo = async (params: {
    pagina?: number | null;
    registrosPorPagina?: number | null;
    estado?: string | null;
    buscar?: string | null;
}) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("Estado", sql.VarChar(20), params.estado ?? null)
        .input("Buscar", sql.VarChar(100), params.buscar ?? null)
        .execute("dbo.SP_Devoluciones_ListarDevoluciones");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const devoluciones = recordsets[1] ?? [];

    return {
        devoluciones,
        totalRegistros,
    };
};

export const liberarReservasVencidasRepo = async (
    IDUsuarioSistema?: number | null
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDUsuarioSistema", sql.Int, IDUsuarioSistema ?? null)
        .execute("dbo.SP_Pedidos_LiberarReservasVencidas");

    return result.recordset?.[0] ?? null;
};
