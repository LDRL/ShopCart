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

export const listarProductosRepo = async () => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .execute("dbo.SP_Producto_ListarProductos");
    return result.recordset ?? [];
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
    }[]>();

    for (const atributo of atributosRows) {
        const IDProductoVariante = Number(atributo.IDProductoVariante);
        const valores = atributosPorVariante.get(IDProductoVariante) ?? [];

        valores.push({
            IDAtributo: Number(atributo.IDAtributo),
            IDValorAtributo: Number(atributo.IDValorAtributo),
            rol: String(atributo.rol)
        });

        atributosPorVariante.set(IDProductoVariante, valores);
    }

    const variantes = variantesRows.map((variante) => ({
        IDProductoVariante: Number(variante.IDProductoVariante),
        sku: String(variante.SKU),
        precio: Number(variante.precio),
        estado: Boolean(variante.estado),
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
    imagenes: ImagenProductoPayload[]
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
    imagenes: ImagenProductoPayload[] | null
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
        .execute("dbo.SP_Producto_ActualizarProducto");

    return extraerResultado(result);
};

export const eliminarProductoRepo = async (IDProducto: number) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("IDProducto", sql.Int, IDProducto)
        .execute("dbo.SP_Producto_EliminarProducto");
    return result.recordset?.[0] ?? null;
};
