
import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { buscarUsuarioPorCorreo } from "../repositories/auth.repository.js";
import type {
    AuthRequest,
    AuthTokenPayload,
} from "../types/auth.types.js";

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        res.status(401).json({
            error: "No autorizado: token requerido",
        });
        return;
    }

    const [scheme, token, ...extra] = authorization.split(" ");

    if (scheme !== "Bearer" || !token || extra.length > 0) {
        res.status(401).json({
            error: "Formato de autorización inválido",
        });
        return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("JWT_SECRET no está configurado");
        res.status(500).json({
            error: "Error interno de autenticación",
        });
        return;
    }

    let decoded: AuthTokenPayload;

    try {
        const payload = jwt.verify(token, secret);

        if (
            typeof payload !== "object" ||
            payload === null ||
            typeof payload.mail !== "string" ||
            !payload.mail.trim()
        ) {
            res.status(401).json({
                error: "Token inválido o mal formado",
            });
            return;
        }

        decoded = payload as AuthTokenPayload;
    } catch (error: unknown) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                error: "Token no válido o expirado",
            });
            return;
        }

        next(error);
        return;
    }

    try {
        const usuario = await buscarUsuarioPorCorreo(
            decoded.mail
        );

        if (!usuario || !usuario.estado) {
            res.status(401).json({
                error: "Usuario inexistente o inactivo",
            });
            return;
        }

        req.user = usuario;
        next();
    } catch (error: unknown) {
        next(error);
    }
};

export const authenticateOptional = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.headers.authorization) {
        next();
        return;
    }

    await authenticate(req, res, next);
};
