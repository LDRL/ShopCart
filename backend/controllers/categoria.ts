import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import {
    obtenerCategorias,
    obtenerCategoria,
    crearCategoriaService,
    actualizarCategoriaService,
    eliminarCategoriaService,
} from "../services/categoria.service.js";

// ========================================
// GET: Listar categorías con paginación
// ========================================
const getCategorias = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { page = "", limite = "10", search = "" } = req.query;

    const paginated = page !== "";
    const pageNumber = paginated ? Number(page) : 0;
    const limitNumber = paginated ? Number(limite) : 0;

    if (
        (paginated &&
            (!Number.isSafeInteger(pageNumber) ||
                pageNumber < 1 ||
                !Number.isSafeInteger(limitNumber) ||
                limitNumber < 1 ||
                limitNumber > 100)) ||
        typeof search !== "string"
    ) {
        res.status(400).json({
            msg: "Parámetros de búsqueda o paginación inválidos",
        });
        return;
    }

    try {
        const resultado = await obtenerCategorias(String(page), String(limite), String(search));

        res.status(200).json({
            msg: "Categorías obtenidas con éxito",
            ...resultado,
        });
    } catch (error: unknown) {
        console.error(
            "Error al listar categorías:",
            error instanceof Error ? error.message : error
        );

        res.status(500).json({
            msg: "Hubo un error al obtener las categorías",
        });
    }
};

// ========================================
// GET: Obtener categoría por ID
// ========================================
const getCategoria = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({
            msg: "El ID de la categoría es inválido",
        });
        return;
    }

    try {
        const categoria = await obtenerCategoria(id);

        res.status(200).json({
            msg: "Categoría obtenida con éxito",
            data: categoria,
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "CATEGORIA_NO_ENCONTRADA") {
            res.status(404).json({
                msg: "Categoría no encontrada",
            });
            return;
        }

        console.error(
            "Error al obtener categoría:",
            error instanceof Error ? error.message : error
        );

        res.status(500).json({
            msg: "Hubo un error al obtener la categoría",
        });
    }
};

// ========================================
// Validaciones de categoría
// ========================================
const validarCategoriaProducto = [
    body("nombre")
        .isString()
        .withMessage("El nombre debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("El nombre no puede estar vacío")
        .isLength({ max: 45 })
        .withMessage("El nombre no puede exceder los 45 caracteres"),
];

// ========================================
// POST: Crear categoría
// ========================================
const postCategoria = async (
    req: Request,
    res: Response
): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            msg: "Datos inválidos",
            errors: errors.array(),
        });
        return;
    }

    const { nombre } = req.body as { nombre: string };

    try {
        const data = await crearCategoriaService(nombre);

        res.status(201).json({
            msg: "Categoría creada correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        console.error(
            "Error al insertar categoría:",
            error instanceof Error ? error.message : error
        );

        res.status(500).json({
            msg: "Hubo un error al insertar la categoría",
        });
    }
};

// ========================================
// PUT: Actualizar categoría
// ========================================
const putCategoria = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({
            msg: "El ID de la categoría es inválido",
        });
        return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            msg: "Datos inválidos",
            errors: errors.array(),
        });
        return;
    }

    const { nombre } = req.body as { nombre: string };

    try {
        const data = await actualizarCategoriaService(id, nombre);

        res.status(200).json({
            msg: "Categoría actualizada correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        console.error(
            "Error al actualizar categoría:",
            error instanceof Error ? error.message : error
        );

        res.status(500).json({
            msg: "Hubo un error al actualizar la categoría",
        });
    }
};

// ========================================
// DELETE: Eliminar categoría
// ========================================
const deleteCategoria = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({
            msg: "El ID de la categoría es inválido",
        });
        return;
    }

    try {
        const data = await eliminarCategoriaService(id);

        res.status(200).json({
            msg: "Categoría eliminada correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        console.error(
            "Error al eliminar categoría:",
            error instanceof Error ? error.message : error
        );

        res.status(500).json({
            msg: "Hubo un error al eliminar la categoría",
        });
    }
};

// ========================================
// Exportaciones
// ========================================
export {
    getCategorias,
    getCategoria,
    postCategoria,
    putCategoria,
    deleteCategoria,
    validarCategoriaProducto,
};
