import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import {
    crearProveedorService,
    actualizarProveedorService,
    eliminarProveedorService,
    listarProveedoresService,
    obtenerProveedorPorIdService,
} from "../services/proveedor.service.js";

const ERRORES_CONFLICTO = new Set([50721, 50722]);
const ERRORES_NO_ENCONTRADOS = new Set([50723]);

const responderErrorProveedor = (
    res: Response,
    error: unknown,
    contexto: string
): void => {
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
    res.status(500).json({ msg: "Hubo un error al procesar el proveedor" });
};

const esIdValido = (id: number): boolean => Number.isSafeInteger(id) && id > 0;

const reglaNombre = () =>
    body("nombre")
        .isString()
        .withMessage("nombre debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("nombre es requerido")
        .isLength({ max: 150 })
        .withMessage("nombre no puede exceder 150 caracteres");

const reglaNit = () =>
    body("nit")
        .optional({ nullable: true })
        .isString()
        .withMessage("nit debe ser una cadena de texto")
        .trim()
        .isLength({ max: 11 })
        .withMessage("nit no puede exceder 11 caracteres");

const reglaTelefono = () =>
    body("telefono")
        .optional({ nullable: true })
        .isString()
        .withMessage("telefono debe ser una cadena de texto")
        .trim()
        .isLength({ max: 11 })
        .withMessage("telefono no puede exceder 11 caracteres");

const reglaCorreo = () =>
    body("correo")
        .optional({ nullable: true })
        .isString()
        .withMessage("correo debe ser una cadena de texto")
        .bail()
        .trim()
        .isEmail()
        .withMessage("correo debe ser un correo valido")
        .isLength({ max: 150 })
        .withMessage("correo no puede exceder 150 caracteres");

const reglaDireccion = () =>
    body("direccion")
        .optional({ nullable: true })
        .isString()
        .withMessage("direccion debe ser una cadena de texto")
        .trim()
        .isLength({ max: 150 })
        .withMessage("direccion no puede exceder 150 caracteres");

export const validarProveedor = [
    reglaNombre(),
    reglaNit(),
    reglaTelefono(),
    reglaCorreo(),
    reglaDireccion(),
];

export const validarActualizarProveedor = [
    reglaNombre(),
    reglaNit(),
    reglaTelefono(),
    reglaCorreo(),
    reglaDireccion(),
    body("estado")
        .isBoolean()
        .withMessage("estado debe ser booleano")
        .toBoolean(),
];

export const getProveedores = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const data = await listarProveedoresService();

        res.status(200).json({
            msg: "Proveedores obtenidos con exito",
            data,
        });
    } catch (error: unknown) {
        responderErrorProveedor(res, error, "obtener proveedores");
    }
};

export const getProveedor = async (
    req: Request,
    res: Response
): Promise<void> => {
    const IDProveedor = Number(req.params.IDProveedor);

    if (!esIdValido(IDProveedor)) {
        res.status(400).json({ msg: "El ID del proveedor es invalido" });
        return;
    }

    try {
        const data = await obtenerProveedorPorIdService(IDProveedor);

        res.status(200).json({
            msg: "Proveedor obtenido con exito",
            data,
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "PROVEEDOR_NO_ENCONTRADO") {
            res.status(404).json({ msg: "El proveedor no existe" });
            return;
        }

        responderErrorProveedor(res, error, "obtener proveedor");
    }
};

export const postProveedor = async (
    req: Request,
    res: Response
): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const { nombre, nit, telefono, correo, direccion } = req.body as {
        nombre: string;
        nit?: string | null;
        telefono?: string | null;
        correo?: string | null;
        direccion?: string | null;
    };

    try {
        const data = await crearProveedorService({
            nombre,
            nit: nit ?? null,
            telefono: telefono ?? null,
            correo: correo ?? null,
            direccion: direccion ?? null,
        });

        res.status(201).json({
            msg: "Proveedor creado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorProveedor(res, error, "crear proveedor");
    }
};

export const putProveedor = async (
    req: Request,
    res: Response
): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const IDProveedor = Number(req.params.IDProveedor);

    if (!esIdValido(IDProveedor)) {
        res.status(400).json({ msg: "El ID del proveedor es invalido" });
        return;
    }

    const { nombre, nit, telefono, correo, direccion, estado } = req.body as {
        nombre: string;
        nit?: string | null;
        telefono?: string | null;
        correo?: string | null;
        direccion?: string | null;
        estado: boolean;
    };

    try {
        const data = await actualizarProveedorService(IDProveedor, {
            nombre,
            nit: nit ?? null,
            telefono: telefono ?? null,
            correo: correo ?? null,
            direccion: direccion ?? null,
            estado,
        });

        res.status(200).json({
            msg: "Proveedor actualizado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorProveedor(res, error, "actualizar proveedor");
    }
};

export const deleteProveedor = async (
    req: Request,
    res: Response
): Promise<void> => {
    const IDProveedor = Number(req.params.IDProveedor);

    if (!esIdValido(IDProveedor)) {
        res.status(400).json({ msg: "El ID del proveedor es invalido" });
        return;
    }

    try {
        const data = await eliminarProveedorService(IDProveedor);

        res.status(200).json({
            msg: "Proveedor desactivado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorProveedor(res, error, "desactivar proveedor");
    }
};
