import { dbConnect, sql } from "../config/db/connection.js";
import type {
    ImagenProductoPayload,
    VarianteProductoPayload,
} from "../types/producto.types.js";


interface VarianteDB {
    IDProductoVariante: number;
    tieneImagen?: boolean | number;
    atributos?: number[];
    [key: string]: unknown;
}

/// parametros para filtro de obtener productos
export interface ProductList {
    pagina?: number | null;
    registrosPorPagina?: number | null;
    nombre?: string | null;
    idGenero?: number | null;
    idCategoria?: number | null;
    precioMinimo?: number | null;
    precioMaximo?: number | null;
}

const extraerResultado = (result: { recordsets?: unknown }) => {
    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const productoRows = (recordsets[0] ?? []) as Array<Record<string, unknown>>;
    const variantesRows = (recordsets[1] ?? []) as Array<Record<string, unknown>>;

    return {
        producto: productoRows[0] ?? null,
        variantes: variantesRows,
    };
};

const serializarVariantes = (variantes: VarianteProductoPayload[] | null) =>
    variantes === null ? null : JSON.stringify(variantes);

const serializarImagenes = (imagenes: ImagenProductoPayload[] | null) =>
    imagenes === null ? null : JSON.stringify(imagenes);

export const listarProductosRepo = async (filtros: ProductList = {}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, filtros.pagina)
        .input("RegistrosPorPagina", sql.Int, filtros.registrosPorPagina)
        .input("Nombre", sql.NVarChar(150), filtros.nombre)
        .input("IDGenero", sql.Int, filtros.idGenero)
        .input("IDCategoria", sql.Int, filtros.idCategoria)
        .input("PrecioMinimo", sql.Decimal(18, 2), filtros.precioMinimo)
        .input("PrecioMaximo", sql.Decimal(18, 2), filtros.precioMaximo)
        .execute("dbo.SP_Producto_ListarProductos");
    

    const recordsets = Array.isArray(result.recordsets)
        ? result.recordsets
        : [];

    const total = Number( recordsets[0]?.[0]?.TotalRegistros ?? 0 );
    const productos = recordsets[1] ?? [];
    return {
        total,
        productos
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

export const obtenerProductoPorIdRepo = async (id: number) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("IDProducto", sql.Int, id)
        .execute("dbo.SP_Producto_ObtenerProductoPorID");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const productoRows = (recordsets[0] ?? []) as Array<Record<string, unknown>>;
    const imagenesRows  = (recordsets[1] ?? []) as Array<Record<string, unknown>>;
    const variantesRows = (recordsets[2] ?? []) as VarianteDB[];
    const atributosRows = (recordsets[3] ?? []) as Array<Record<string, unknown>>;

    // Agrupar atributos por variante
    const atributosPorVariante = new Map<number, {
        IDAtributo: number;
        IDValorAtributo: number;
        rol: string;
        Atributo: string;
        valor: string;
    }[]>();

    for (const atributo of atributosRows) {
        const IDProductoVariante = Number(atributo.IDProductoVariante);
        const valores = atributosPorVariante.get(IDProductoVariante) ?? [];

        valores.push({
            IDAtributo: Number(atributo.IDAtributo),
            IDValorAtributo: Number(atributo.IDValorAtributo),
            rol: String(atributo.rol),
            Atributo: String(atributo.Atributo ?? ""),
            valor: String(atributo.valor ?? "")
        });

        atributosPorVariante.set(IDProductoVariante, valores);
    }

    const variantes = variantesRows.map((variante) => ({
        IDProductoVariante: Number(variante.IDProductoVariante),
        sku: String(variante.SKU),
        precio: Number(variante.precio),
        estado: Boolean(variante.estado),
        stock: Number(variante.stock ?? 0),
        tieneImagen: Boolean(variante.tieneImagen),
        atributos: atributosPorVariante.get(Number(variante.IDProductoVariante)) ?? []
    }));

    return {
        producto: productoRows[0] ?? null,
        imagenes: imagenesRows,
        variantes,
    };
};

export const crearProductoRepo = async (
    IDGenero: number,
    IDCategoria: number,
    nombre: string,
    descripcion: string | null,
    precioBase: number,
    variantes: VarianteProductoPayload[],
    imagenes: ImagenProductoPayload[],
    idUsuario?: number | null
) => {
    const pool = await dbConnect();
    const result = await pool.request()
        .input("IDGenero", sql.Int, IDGenero)
        .input("IDCategoria", sql.Int, IDCategoria)
        .input("Nombre", sql.VarChar(150), nombre.trim())
        .input("Descripcion", sql.VarChar(500), descripcion?.trim() || null)
        .input("PrecioBase", sql.Decimal(10, 2), precioBase)
        .input("Variantes", sql.NVarChar(sql.MAX), JSON.stringify(variantes))
        .input("Imagenes", sql.NVarChar(sql.MAX), JSON.stringify(imagenes))
        .input("IDUsuario", sql.Int, idUsuario ?? null)
        .execute("dbo.SP_Producto_CrearProducto");

    return extraerResultado(result);
};

export const actualizarProductoRepo = async (
    IDProducto: number,
    IDGenero: number,
    IDCategoria: number,
    nombre: string,
    descripcion: string | null,
    precioBase: number,
    estado: boolean,
    variantes: VarianteProductoPayload[] | null,
    imagenes: ImagenProductoPayload[] | null,
    idUsuario?: number | null
) => {
    const pool = await dbConnect();
    const result = await pool.request()
        .input("IDProducto", sql.Int, IDProducto)
        .input("IDGenero", sql.Int, IDGenero)
        .input("IDCategoria", sql.Int, IDCategoria)
        .input("Nombre", sql.VarChar(150), nombre.trim())
        .input("Descripcion", sql.VarChar(500), descripcion?.trim() || null)
        .input("PrecioBase", sql.Decimal(10, 2), precioBase)
        .input("Estado", sql.Bit, estado ? 1 : 0)
        .input("Variantes", sql.NVarChar(sql.MAX), serializarVariantes(variantes))
        .input("Imagenes", sql.NVarChar(sql.MAX), serializarImagenes(imagenes))
        .input("IDUsuario", sql.Int, idUsuario ?? null)
        .execute("dbo.SP_Producto_ActualizarProducto");

    return extraerResultado(result);
};

export const eliminarProductoRepo = async (IDProducto: number, idUsuario?: number | null) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("IDProducto", sql.Int, IDProducto)
        .input("IDUsuario", sql.Int, idUsuario ?? null)
        .execute("dbo.SP_Producto_EliminarProducto");
    return result.recordset?.[0] ?? null;
};


