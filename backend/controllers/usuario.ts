import type { Request, Response } from "express";
import { validationResult } from "express-validator";

import {
    obtenerUsuarios,
    obtenerUsuario,
    crearUsuarioService,
    actualizarUsuarioService,
    eliminarUsuarioService,
} from "../services/usuario.service.js";
import { DomainError, statusHttpDeError } from "../errors/domainError.js";

const responderErrorDominio = (error: unknown, res: Response): boolean => {
    if (!(error instanceof DomainError)) {
        return false;
    }

    res.status(statusHttpDeError(error)).json({ msg: error.message });
    return true;
};

// ========================================
// GET: Listar usuarios con paginación
// ========================================
const getUsuarios = async (
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
        const resultado = await obtenerUsuarios(
            String(page),
            String(limite),
            String(search)
        );

        res.status(200).json({
            msg: "Usuarios obtenidos con éxito",
            ...resultado,
        });
    } catch (error: unknown) {
        console.error(
            "Error al listar usuarios:",
            error instanceof Error ? error.message : error
        );

        res.status(500).json({
            msg: "Hubo un error al obtener los usuarios",
        });
    }
};

// ========================================
// GET: Obtener usuario por ID
// ========================================
const getUsuario = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({
            msg: "El ID del usuario es inválido",
        });
        return;
    }

    try {
        const usuario = await obtenerUsuario(id);

        res.status(200).json({
            msg: "Usuario obtenido con éxito",
            data: usuario,
        });
    } catch (error: unknown) {
        if (responderErrorDominio(error, res)) {
            return;
        }

        console.error(
            "Error al obtener usuario:",
            error instanceof Error ? error.message : error
        );

        res.status(500).json({
            msg: "Hubo un error al obtener el usuario",
        });
    }
};

// ========================================
// POST: Crear usuario
// ========================================
const postUsuario = async (
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

    const { email, nombre, apellido, contraseña, IDRol } = req.body as {
        email: string;
        nombre: string;
        apellido: string;
        contraseña: string;
        IDRol: number;
    };

    try {
        const data = await crearUsuarioService({
            nombre,
            apellido,
            correo: email,
            contraseña,
            IDRol: Number(IDRol),
        });

        res.status(201).json({
            msg: "Usuario creado correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        if (responderErrorDominio(error, res)) {
            return;
        }

        console.error(
            "Error al insertar usuario:",
            error instanceof Error ? error.message : error
        );

        res.status(500).json({
            msg: "Hubo un error al insertar el usuario",
        });
    }
};

// ========================================
// PUT: Actualizar usuario
// ========================================
const putUsuario = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({
            msg: "El ID del usuario es inválido",
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

    const { email, nombre, apellido, IDRol } = req.body as {
        email: string;
        nombre: string;
        apellido: string;
        IDRol: number;
    };

    try {
        const data = await actualizarUsuarioService(id, {
            correo: email,
            nombre,
            apellido,
            IDRol: Number(IDRol),
        });

        res.status(200).json({
            msg: "Usuario actualizado correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        if (responderErrorDominio(error, res)) {
            return;
        }

        console.error(
            "Error al actualizar usuario:",
            error instanceof Error ? error.message : error
        );

        res.status(500).json({
            msg: "Hubo un error al actualizar el usuario",
        });
    }
};

// ========================================
// DELETE: Eliminar usuario
// ========================================
const deleteUsuario = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({
            msg: "El ID del usuario es inválido",
        });
        return;
    }

    try {
        const data = await eliminarUsuarioService(id);

        res.status(200).json({
            msg: "Usuario eliminado correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        if (responderErrorDominio(error, res)) {
            return;
        }

        console.error(
            "Error al eliminar usuario:",
            error instanceof Error ? error.message : error
        );

        res.status(500).json({
            msg: "Hubo un error al eliminar el usuario",
        });
    }
};

// ========================================
// Exportaciones
// ========================================
export {
    getUsuarios,
    getUsuario,
    postUsuario,
    putUsuario,
    deleteUsuario,
};
