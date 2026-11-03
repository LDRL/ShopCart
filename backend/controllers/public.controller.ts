import type { Request, Response } from "express";
import { obtenerPaginacion, responderPaginacionError } from "../utils/paginacion.js";
import { transformarProducto } from "./producto.controller.js";
import {
    listarProductosPublicService,
    obtenerProductoPublicService,
    listarVariantesPublicService,
    consultarProductosShopService,
    listarCategoriasPublicService,
    listarGenerosPublicService,
    listarAtributosPublicService,
    listarValoresAtributoPublicService,
} from "../services/public.service.js";

const esIdValido = (id: number): boolean => Number.isSafeInteger(id) && id > 0;

export const getShopProductos = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const filtros = {
            buscar: req.query.buscar?.toString() || req.query.q?.toString() || null,
            idGenero: req.query.idGenero ? Number(req.query.idGenero) : null,
            idCategoria: req.query.idCategoria ? Number(req.query.idCategoria) : null,
            atributos: req.query.atributos ? String(req.query.atributos) : null,
            pagina,
            registrosPorPagina,
        };
        const result = await consultarProductosShopService(filtros);
        res.status(200).json({ msg: "Productos obtenidos con exito", ...result });
    } catch (error: unknown) {
        if (error instanceof Error && error.message) {
            // paginacion errors are thrown as PaginacionError; handle via responderPaginacionError
        }
        try { responderPaginacionError(res, error); return; } catch { /* not pagination */ }
        console.error("Error al listar productos shop:", error);
        res.status(500).json({ msg: "Hubo un error al obtener los productos" });
    }
};

export const getProductosPublic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const filtros = {
            pagina,
            registrosPorPagina,
            nombre: req.query.nombre?.toString() || null,
            idGenero: req.query.idGenero ? Number(req.query.idGenero) : null,
            idCategoria: req.query.idCategoria ? Number(req.query.idCategoria) : null,
            precioMinimo: req.query.precioMinimo ? Number(req.query.precioMinimo) : null,
            precioMaximo: req.query.precioMaximo ? Number(req.query.precioMaximo) : null,
        };
        const result = await listarProductosPublicService(filtros);
        res.status(200).json({ msg: "Productos obtenidos con exito", ...result });
    } catch (error: unknown) {
        try { responderPaginacionError(res, error); return; } catch { /* noop */ }
        console.error("Error al listar productos:", error);
        res.status(500).json({ msg: "Hubo un error al obtener los productos" });
    }
};

export const getProductoPublic = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!esIdValido(id)) {
        res.status(400).json({ msg: "El ID del producto es invalido" });
        return;
    }
    try {
        const data = await obtenerProductoPublicService(id) as any;
        const transformado = transformarProducto(data);
        res.status(200).json({ msg: "Producto obtenido con exito", data: transformado });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "PRODUCTO_NO_ENCONTRADO") {
            res.status(404).json({ msg: "Producto no encontrado" });
            return;
        }
        console.error("Error al obtener producto:", error);
        res.status(500).json({ msg: "Hubo un error al obtener el producto" });
    }
};

export const getVariantesPublic = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!esIdValido(id)) {
        res.status(400).json({ msg: "El ID del producto es invalido" });
        return;
    }
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const result = await listarVariantesPublicService(id, { pagina, registrosPorPagina });
        res.status(200).json({ msg: "Variantes obtenidas con exito", ...result });
    } catch (error: unknown) {
        try { responderPaginacionError(res, error); return; } catch { /* noop */ }
        console.error("Error al obtener variantes:", error);
        res.status(500).json({ msg: "Hubo un error al obtener las variantes" });
    }
};

export const getCategoriasPublic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const result = await listarCategoriasPublicService({
            pagina,
            registrosPorPagina,
            buscar: req.query.buscar?.toString() || req.query.q?.toString() || null,
        });
        res.status(200).json({ msg: "Categorias obtenidas con exito", ...result });
    } catch (error: unknown) {
        try { responderPaginacionError(res, error); return; } catch { /* noop */ }
        console.error("Error al listar categorias:", error);
        res.status(500).json({ msg: "Hubo un error al obtener las categorias" });
    }
};

export const getGenerosPublic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const result = await listarGenerosPublicService({ pagina, registrosPorPagina });
        res.status(200).json({ msg: "Generos obtenidos con exito", ...result });
    } catch (error: unknown) {
        try { responderPaginacionError(res, error); return; } catch { /* noop */ }
        console.error("Error al listar generos:", error);
        res.status(500).json({ msg: "Hubo un error al obtener los generos" });
    }
};

export const getAtributosPublic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const result = await listarAtributosPublicService({ pagina, registrosPorPagina });
        res.status(200).json({ msg: "Atributos obtenidos con exito", ...result });
    } catch (error: unknown) {
        try { responderPaginacionError(res, error); return; } catch { /* noop */ }
        console.error("Error al listar atributos:", error);
        res.status(500).json({ msg: "Hubo un error al obtener los atributos" });
    }
};

export const getConfigPublic = async (_req: Request, res: Response): Promise<void> => {
    const iva = Number(process.env.IVA_PORCENTAJE ?? 12);
    res.status(200).json({
        msg: "Configuracion obtenida con exito",
        data: {
            moneda: "GTQ",
            ivaPorcentaje: Number.isFinite(iva) ? iva : 12,
            ivaIncluido: true,
        },
    });
};

export const getValoresAtributoPublic = async (req: Request, res: Response): Promise<void> => {
    const idaAtributoRaw = req.query.IDAtributo ?? req.query.idAtributo;
    const idaAtributo = idaAtributoRaw === undefined ? null : Number(idaAtributoRaw);
    if (idaAtributo !== null && !esIdValido(idaAtributo)) {
        res.status(400).json({ msg: "El ID del atributo es invalido" });
        return;
    }
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const result = await listarValoresAtributoPublicService(idaAtributo, { pagina, registrosPorPagina });
        res.status(200).json({ msg: "Valores de atributo obtenidos con exito", ...result });
    } catch (error: unknown) {
        try { responderPaginacionError(res, error); return; } catch { /* noop */ }
        console.error("Error al listar valores de atributo:", error);
        res.status(500).json({ msg: "Hubo un error al obtener los valores de atributo" });
    }
};