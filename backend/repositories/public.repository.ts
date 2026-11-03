import { dbConnect, sql } from "../config/db/connection.js";

export interface PaginacionParams {
    pagina?: number | null;
    registrosPorPagina?: number | null;
}

export interface ProductosPublicFiltros extends PaginacionParams {
    nombre?: string | null;
    idGenero?: number | null;
    idCategoria?: number | null;
    precioMinimo?: number | null;
    precioMaximo?: number | null;
}

export interface ShopFiltros extends PaginacionParams {
    buscar?: string | null;
    idGenero?: number | null;
    idCategoria?: number | null;
    atributos?: string | null; // JSON
}

export const listarProductosPublicRepo = async (filtros: ProductosPublicFiltros = {}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, filtros.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, filtros.registrosPorPagina ?? null)
        .input("Nombre", sql.NVarChar(150), filtros.nombre ?? null)
        .input("IDGenero", sql.Int, filtros.idGenero ?? null)
        .input("IDCategoria", sql.Int, filtros.idCategoria ?? null)
        .input("PrecioMinimo", sql.Decimal(18, 2), filtros.precioMinimo ?? null)
        .input("PrecioMaximo", sql.Decimal(18, 2), filtros.precioMaximo ?? null)
        .execute("dbo.SP_Producto_ListarProductos");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const total = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const productos = recordsets[1] ?? [];
    return { total: Number.isFinite(total) ? total : productos.length, productos };
};

export const obtenerProductoPublicRepo = async (id: number) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("IDProducto", sql.Int, id)
        .execute("dbo.SP_Producto_ObtenerProductoPorID");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    return {
        producto: (recordsets[0] ?? [])[0] ?? null,
        imagenes: recordsets[1] ?? [],
        variantes: recordsets[2] ?? [],
        atributos: recordsets[3] ?? [],
    };
};

export const listarVariantesPublicRepo = async (idProducto: number, paginacion: PaginacionParams = {}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, paginacion.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, paginacion.registrosPorPagina ?? null)
        .input("IDProducto", sql.Int, idProducto)
        .execute("dbo.SP_Producto_ObtenerVariantes");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];
    return { rows, totalRegistros };
};

export const consultarProductosShopRepo = async (filtros: ShopFiltros = {}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Buscar", sql.NVarChar(150), filtros.buscar ?? null)
        .input("IDGenero", sql.Int, filtros.idGenero ?? null)
        .input("IDCategoria", sql.Int, filtros.idCategoria ?? null)
        .input("Atributos", sql.NVarChar(sql.MAX), filtros.atributos ?? null)
        .input("Pagina", sql.Int, filtros.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, filtros.registrosPorPagina ?? null)
        .execute("dbo.SP_Producto_ConsultarProductoVariantesShop");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const meta = recordsets[0]?.[0] ?? {};
    const productos = recordsets[1] ?? [];
    const variantes = recordsets[2] ?? [];
    return { meta, productos, variantes };
};

export const listarCategoriasPublicRepo = async (params: PaginacionParams & { buscar?: string | null } = {}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("Buscar", sql.VarChar(100), params.buscar ?? null)
        .execute("dbo.SP_Categorias_ListarCategoria");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];
    return { rows, totalRegistros };
};

export const listarGenerosPublicRepo = async (params: PaginacionParams = {}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .execute("dbo.SP_Producto_ObtenerGeneros");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];
    return { rows, totalRegistros };
};

export const listarAtributosPublicRepo = async (params: PaginacionParams = {}) => {
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

export const listarValoresAtributoPublicRepo = async (idaAtributo: number | null, params: PaginacionParams = {}) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("IDAtributo", sql.Int, idaAtributo)
        .execute("dbo.SP_Producto_ObtenerValoresAtributo");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];
    return { rows, totalRegistros };
};