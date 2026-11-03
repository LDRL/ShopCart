import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import { eliminarArchivosSubidos } from "../middleware/normalizarProducto.js";
import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import { obtenerPaginacion, responderPaginacionError } from "../utils/paginacion.js";
import { obtenerProductosService, obtenerProductoPorIdService, crearProductoService, actualizarProductoService, 
    eliminarProductoService, } from "../services/producto.service.js";

import type { ActualizarProductoPayload, CrearProductoPayload, } from "../types/producto.types.js";
import { ProductList } from "../repositories/producto.repository.js";

const ERRORES_NO_ENCONTRADOS = new Set([50301]);
const ERRORES_CONFLICTO = new Set([50205, 50213, 50306, 50313]);

const responderErrorProducto = ( req: Request, res: Response, error: unknown, contexto: string ): void => {
    eliminarArchivosSubidos(req);

    const numero = obtenerNumeroErrorSql(error);
    const mensaje = error instanceof Error ? error.message : "Error desconocido";

    if (numero !== undefined && ERRORES_NO_ENCONTRADOS.has(numero)) {
        res.status(404).json({ msg: mensaje });
        return;
    }

    if (numero !== undefined && ERRORES_CONFLICTO.has(numero)) {
        res.status(409).json({ msg: mensaje });
        return;
    }

    if (numero !== undefined && numero >= 50000 && numero < 60000) {
        res.status(400).json({ msg: mensaje });
        return;
    }

    console.error(`Error al ${contexto}:`, mensaje);
    res.status(500).json({ msg: "Hubo un error al procesar el producto" });
};

export const getProductos = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const filtros: ProductList = {
            pagina,
            registrosPorPagina,
            nombre: req.query.nombre?.toString() || null,
            idGenero: req.query.idGenero ? Number(req.query.idGenero) : null,
            idCategoria: req.query.idCategoria ? Number(req.query.idCategoria) : null,
            precioMinimo: req.query.precioMinimo ? Number(req.query.precioMinimo) : null,
            precioMaximo: req.query.precioMaximo ? Number(req.query.precioMaximo) : null,
        };

        const productos = await obtenerProductosService(filtros);

        res.status(200).json(productos);
    } catch (error: unknown) {
        try {
            responderPaginacionError(res, error);
            return;
        } catch {
            // no es error de paginacion
        }
        console.error("Error al listar productos:", error);
        res.status(500).json({
            message: "Hubo un error al obtener los productos",
        });
    }
};

/*
export const getProducto = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ msg: "El ID del producto es inválido" });
        return;
    }
    try {
        const data = await obtenerProductoPorIdService(id);
        res.status(200).json({
            msg: "Producto obtenido con éxito",
            data: {
                producto: data.producto,  
                imagenes: data.imagenes
            }
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "PRODUCTO_NO_ENCONTRADO") {
            res.status(404).json({ msg: "Producto no encontrado" });
            return;
        }
        console.error("Error al obtener producto:", error instanceof Error ? error.message : error);
        res.status(500).json({ msg: "Hubo un error al obtener el producto" });
    }
};
*/

export const getProducto = async ( req: Request, res: Response ): Promise<void> => {

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({
            msg: "El ID del producto es inválido"
        });
        return;
    }

    try {

        const data = await obtenerProductoPorIdService(id);

        const productoTransformado = transformarProducto(data);

        res.status(200).json({
            msg: "Producto obtenido con éxito",
            data: productoTransformado
        });

    } catch (error: unknown) {

        if (
            error instanceof Error &&
            error.message === "PRODUCTO_NO_ENCONTRADO"
        ) {
            res.status(404).json({
                msg: "Producto no encontrado"
            });
            return;
        }

        console.error("Error al obtener producto:", error);

        res.status(500).json({
            msg: "Hubo un error al obtener el producto"
        });
    }
};

export const postProducto = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        eliminarArchivosSubidos(req);
        res.status(400).json({ msg: "Datos inválidos", errors: errors.array() });
        return;
    }

    const { IDGenero, IDCategoria, nombre, descripcion, precioBase, variantes, imagenes } =
        req.body as CrearProductoPayload;

    try {
        const data = await crearProductoService(
            Number(IDGenero),
            Number(IDCategoria),
            nombre,
            descripcion ?? null,
            Number(precioBase),
            variantes,
            imagenes
        );
        res.status(201).json({
            msg: "Producto creado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorProducto(req, res, error, "crear producto");
    }
};

export const putProducto = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
        eliminarArchivosSubidos(req);
        res.status(400).json({ msg: "El ID del producto es inválido" });
        return;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        eliminarArchivosSubidos(req);
        res.status(400).json({ msg: "Datos inválidos", errors: errors.array() });
        return;
    }

    const { IDGenero, IDCategoria, nombre, descripcion, precioBase, estado, variantes, imagenes } =
        req.body as ActualizarProductoPayload;

    try {
        const data = await actualizarProductoService(
            id,
            Number(IDGenero),
            Number(IDCategoria),
            nombre,
            descripcion ?? null,
            Number(precioBase),
            Boolean(estado),
            variantes,
            imagenes
        );
        res.status(200).json({
            msg: "Producto actualizado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorProducto(req, res, error, "actualizar producto");
    }
};

export const deleteProducto = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ msg: "El ID del producto es inválido" });
        return;
    }
    try {
        const data = await eliminarProductoService(id);
        res.status(200).json({
            msg: "Producto eliminado correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        console.error("Error al eliminar producto:", error instanceof Error ? error.message : error);
        res.status(500).json({ msg: "Hubo un error al eliminar el producto" });
    }
};



//// esto lo vamos a tener que mover de aqui
interface AtributoRaw {
    IDAtributo: number;
    IDValorAtributo: number;
    rol: string;
}

interface VarianteRaw {
    IDProductoVariante: number;
    sku: string;
    precio: number;
    estado: boolean;
    tieneImagen: boolean;
    atributos: AtributoRaw[];
}

interface ProductoRawResponse {
    producto: Record<string, unknown>;
    imagenes: Record<string, unknown>[];
    variantes: VarianteRaw[];
}

interface ProductoTransformado {
    IDGenero: number;
    IDCategoria: number;
    nombre: string;
    descripcion: string;
    precioBase: number;
    estado: boolean;

    variantes: {
        IDProductoVariante: number;
        sku: string;
        precio: number;
        atributos: AtributoRaw[];
    }[];

    imagenes: {
        campo: string;
        urlImagen: string;
        esPrincipal: boolean;
        IDValorColor: number;
    }[];
}


export const transformarProducto = (
    data: ProductoRawResponse
): ProductoTransformado => {

    if (!data.producto) {
        throw new Error("PRODUCTO_NO_ENCONTRADO");
    }

    const producto = data.producto;

    const variantes = data.variantes.map(variante => ({
        IDProductoVariante: variante.IDProductoVariante,
        sku: variante.sku,
        precio: variante.precio,
        atributos: variante.atributos
    }));

    const imagenes = data.imagenes.map((imagen, index) => ({
        campo: `imgCamisa${index + 1}`,
        urlImagen: String(imagen.urlImagen),
        esPrincipal: Boolean(imagen.esPrincipal),
        IDValorColor: Number(imagen.IDValorColor)
    }));

    return {
        IDGenero: Number(producto.IDGenero),
        IDCategoria: Number(producto.IDCategoria),
        nombre: String(producto.nombre),
        descripcion: String(producto.descripcion ?? ""),
        precioBase: Number(producto.precioBase),
        estado: Boolean(producto.estado),
        variantes,
        imagenes
    };
};

