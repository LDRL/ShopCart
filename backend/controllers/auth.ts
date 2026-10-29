import { AuthRequest } from '../types/auth.types.js';
import type { Request, Response, NextFunction, } from "express";
import { iniciarSesion, cambiarPassword, } from "../services/auth.service.js";

export const login = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const { email, contraseña } = req.body;

        if ( typeof email !== "string" || !email.trim() || typeof contraseña !== "string" || !contraseña ) {
            res.status(400).json({ msg: "El correo y la contraseña son obligatorios", });
            return;
        }

        const resultado = await iniciarSesion( email, contraseña );

        res.status(200).json({
            msg: "Inicio de sesión correcto",
            data: resultado.token,
        });
    } catch (error: unknown) {
        if ( error instanceof Error && error.message === "CREDENCIALES_INVALIDAS" ) {
            res.status(401).json({ error: "Correo o contraseña incorrectos", });
            return;
        }

        next(error);
    }
};

export const resetPassword = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const { contraseña } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ msg: "El ID del usuario no es válido", });
            return;
        }

        if ( typeof contraseña !== "string" || contraseña.length === 0 ) {
            res.status(400).json({ msg: "La contraseña es obligatoria", });
            return;
        }

        await cambiarPassword(id, contraseña);

        res.status(200).json({ msg: "Contraseña actualizada correctamente", });
    } catch (error: unknown) {
        next(error);
    }
};

export const user = ( req: AuthRequest, res: Response ): void => {
    res.json(req.user);
};
