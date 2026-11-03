import { construirPaginacion } from "../utils/paginacion.js";
import crypto from "node:crypto";

import {
    listarProductosRepo,
    obtenerProductoPorIdRepo,
    crearProductoRepo,
    actualizarProductoRepo,
    eliminarProductoRepo,
    ProductList,
} from "../repositories/producto.repository.js";
import type {
    ImagenProductoPayload,
    VarianteProductoPayload,
} from "../types/producto.types.js";

const normalizarTexto = (valor: string): string =>
    valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const generarSku = (
    nombre: string,
    IDCategoria: number,
    IDGenero: number,
    atributos: number[]
): string => {
    const base = normalizarTexto(nombre).slice(0, 24) || "producto";
    const hash = crypto
        .createHash("sha1")
        .update(`${nombre.trim().toLowerCase()}|${IDCategoria}|${IDGenero}`)
        .digest("hex")
        .slice(0, 6)
        .toUpperCase();

    const atributosOrdenados = [...atributos]
        .sort((a, b) => a - b)
        .map((id) => `A${id}`)
        .join("");

    return `${base}-${hash}-C${IDCategoria}G${IDGenero}-V${atributosOrdenados}`;
};

const prepararVariantes = ( nombre: string, IDCategoria: number, IDGenero: number, precioBase: number, variantes: VarianteProductoPayload[] ): VarianteProductoPayload[] =>
    variantes.map((variante) => ({
        ...variante,
        SKU:
            variante.SKU?.trim() ||
            (variante.IDProductoVariante === undefined
                ? generarSku(
                      nombre,
                      IDCategoria,
                      IDGenero,
                      variante.Atributos
                  )
                : undefined),
        Precio: variante.Precio ?? precioBase,
    }));

export const obtenerProductosService = async (filtros: ProductList = {}) => {
    const resultado = await listarProductosRepo(filtros);

    const total = resultado.total;
    const limit = filtros.registrosPorPagina ?? total;
    const currentPage = filtros.pagina ?? 1;

    return {
        data: resultado.productos,
        message: "Lista de productos",
        paginacion: construirPaginacion(total, filtros.pagina ?? null, filtros.registrosPorPagina ?? null),
        meta: {
            total,
            totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
            currentPage,
            limit,
        },
    };
};

export const obtenerProductoPorIdService = async (id: number) => {
    const data = await obtenerProductoPorIdRepo(id);
    if (!data.producto) {
        throw new Error("PRODUCTO_NO_ENCONTRADO");
    }
    return data;
};

export const crearProductoService = async (
    IDGenero: number,
    IDCategoria: number,
    nombre: string,
    descripcion: string | null,
    precioBase: number,
    variantes: VarianteProductoPayload[],
    imagenes: ImagenProductoPayload[] = []
) => {
    const variantesNormalizadas = prepararVariantes(
        nombre,
        IDCategoria,
        IDGenero,
        precioBase,
        variantes
    );

    return await crearProductoRepo(
        IDGenero,
        IDCategoria,
        nombre,
        descripcion,
        precioBase,
        variantesNormalizadas,
        imagenes
    );
};

export const actualizarProductoService = async (
    IDProducto: number,
    IDGenero: number,
    IDCategoria: number,
    nombre: string,
    descripcion: string | null,
    precioBase: number,
    estado: boolean,
    variantes?: VarianteProductoPayload[],
    imagenes?: ImagenProductoPayload[]
) => {
    const variantesNormalizadas =
        variantes === undefined
            ? null
            : prepararVariantes(nombre, IDCategoria, IDGenero, precioBase, variantes);

    return await actualizarProductoRepo(
        IDProducto,
        IDGenero,
        IDCategoria,
        nombre,
        descripcion,
        precioBase,
        estado,
        variantesNormalizadas,
        imagenes ?? null
    );
};

export const eliminarProductoService = async (IDProducto: number) => {
    return await eliminarProductoRepo(IDProducto);
};



