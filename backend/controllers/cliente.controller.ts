import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import { crearClienteService, actualizarClienteService, eliminarClienteService, listarClientesService,
    obtenerClientePorIdService, generarTokenInvitadoService, buscarClientePorNitOCorreoService } from "../services/cliente.service.js";

const ERRORES_CONFLICTO = new Set([50721, 50722]);
const ERRORES_NO_ENCONTRADOS = new Set([50723]);

const responderErrorCliente = ( res: Response, error: unknown, contexto: string ): void => {
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
    res.status(500).json({ msg: "Hubo un error al procesar el cliente" });
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
        .isLength({ max: 50 })
        .withMessage("nombre no puede exceder 150 caracteres");

const reglaApellido = () =>
    body("apellido")
        .isString()
        .withMessage("apellido debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("apellido es requerido")
        .isLength({ max: 50 })
        .withMessage("apellido no puede exceder 50 caracteres");

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
        .isLength({ max: 8 })
        .withMessage("telefono no puede exceder 8 caracteres");

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

const reglaContrasena = () =>
    body("contraseña")
        .isString()
        .withMessage("La contraseña debe ser una cadena de texto")
        .bail()
        .isLength({ min: 8 })
        .withMessage(
            "La contraseña es muy corta, debe contener 8 caracteres minimo"
        );

export const validarCliente = [
    reglaNombre(),
    reglaApellido(),
    reglaNit(),
    reglaTelefono(),
    reglaCorreo(),
    reglaDireccion(),
    reglaContrasena()
];

export const validarActualizarCliente = [
    reglaNombre(),
    reglaApellido(),
    reglaNit(),
    reglaTelefono(),
    reglaCorreo(),
    reglaDireccion(),
    body("estado")
        .isBoolean()
        .withMessage("estado debe ser booleano")
        .toBoolean(),
];

export const getClientes = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const data = await listarClientesService();

        res.status(200).json({
            msg: "Clientes obtenidos con exito",
            data,
        });
    } catch (error: unknown) {
        responderErrorCliente(res, error, "obtener clientes");
    }
};

export const getCliente = async ( req: Request, res: Response ): Promise<void> => {
    const IDCliente = Number(req.params.IDCliente);

    if (!esIdValido(IDCliente)) {
        res.status(400).json({ msg: "El ID del cliente es invalido" });
        return;
    }

    try {
        const data = await obtenerClientePorIdService(IDCliente);

        res.status(200).json({
            msg: "Cliente obtenido con exito",
            data,
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "CLIENTE_NO_ENCONTRADO") {
            res.status(404).json({ msg: "El cliente no existe" });
            return;
        }

        responderErrorCliente(res, error, "obtener cliente");
    }
};

export const postCliente = async ( req: Request, res: Response ): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const { nombre, apellido, nit, telefono, correo, direccion, contraseña } = req.body as {
        nombre: string;
        apellido: string;
        nit: string ;
        telefono: string ;
        correo: string ;
        direccion: string;
        contraseña: string;
    };

    try {
        const data = await crearClienteService({
            nombre,
            apellido,
            correo,
            telefono,
            direccion,
            nit,
            contraseña            
        });

        res.status(201).json({
            msg: "Cliente creado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorCliente(res, error, "crear cliente");
    }
};

export const postTokenInvitado = (_req: Request, res: Response): void => {
    const data = generarTokenInvitadoService();

    res.status(201).json({
        msg: "Token de invitado generado correctamente",
        data,
    });
};


export const buscarCliente = async (req: Request, res: Response): Promise<void> => {
    const nit = req.query.nit?.toString() || req.query.Nit?.toString() || null;
    const correo = req.query.correo?.toString() || req.query.email?.toString() || null;

    try {
        const data = await buscarClientePorNitOCorreoService(nit, correo);
        if (!data || (Array.isArray(data) && data.length === 0)) {
            res.status(404).json({ msg: "Cliente no encontrado" });
            return;
        }
        res.status(200).json({ msg: "Cliente obtenido con exito", data });
    } catch (error: unknown) {
        console.error("Error al buscar cliente:", error);
        res.status(500).json({ msg: "Hubo un error al buscar el cliente" });
    }
};

