import { AuthRequest } from '../types/auth.types.js';
import type { Request, Response, NextFunction, } from "express";
import { iniciarSesion, refrescarSesion, cerrarSesion, cerrarTodasLasSesiones, cambiarPassword, } from "../services/auth.service.js";
import {
    REFRESH_COOKIE_NAME,
    opcionesCookieRefresh,
    opcionesCookieRefreshEliminar,
} from "../config/cookies.js";
import { leerCookie } from "../utils/cookies.js";

const ERRORES_REFRESH: Record<string, string> = {
    REFRESH_TOKEN_INVALIDO: "Refresh token inválido o expirado",
    REFRESH_TOKEN_EXPIRADO: "Refresh token expirado, volvé a iniciar sesión",
    REFRESH_TOKEN_REUTILIZADO: "Refresh token reutilizado: sesiones revocadas por seguridad",
    USUARIO_INACTIVO: "Usuario inexistente o inactivo",
};

const obtenerRefreshToken = ( req: Request ): string | undefined => {
    const desdeCookie = leerCookie( req.headers.cookie, REFRESH_COOKIE_NAME );

    if ( desdeCookie ) {
        return desdeCookie;
    }

    const desdeBody = req.body?.refreshToken;

    return typeof desdeBody === "string" && desdeBody.trim() ? desdeBody : undefined;
};

const limpiarCookieRefresh = ( res: Response ): void => {
    res.clearCookie( REFRESH_COOKIE_NAME, opcionesCookieRefreshEliminar() );
};

export const login = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const { email, contraseña } = req.body;

        if ( typeof email !== "string" || !email.trim() || typeof contraseña !== "string" || !contraseña ) {
            res.status(400).json({ msg: "El correo y la contraseña son obligatorios", });
            return;
        }

        const resultado = await iniciarSesion( email, contraseña );

        res.cookie( REFRESH_COOKIE_NAME, resultado.refreshToken, opcionesCookieRefresh() );

        res.status(200).json({
            msg: "Inicio de sesión correcto",
            data: resultado.token,
        });
    } catch (error: unknown) {
        if ( error instanceof Error && error.message === "CREDENCIALES_INVALIDAS" ) {
            res.status(401).json({ error: "Correo o contraseña incorrectos", });
            return;
        }

        if ( error instanceof Error && error.message === "USUARIO_INACTIVO" ) {
            res.status(403).json({ error: "Usuario inexistente o inactivo", });
            return;
        }

        next(error);
    }
};

export const refresh = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    const refreshToken = obtenerRefreshToken( req );

    if ( !refreshToken ) {
        res.status(400).json({ msg: "El refresh token es obligatorio", });
        return;
    }

    try {
        const resultado = await refrescarSesion( refreshToken );

        res.cookie( REFRESH_COOKIE_NAME, resultado.refreshToken, opcionesCookieRefresh() );

        res.status(200).json({
            msg: "Token renovado correctamente",
            data: resultado.token,
        });
    } catch (error: unknown) {
        if ( error instanceof Error && error.message in ERRORES_REFRESH ) {
            limpiarCookieRefresh( res );
            res.status(401).json({ error: ERRORES_REFRESH[error.message] });
            return;
        }

        next(error);
    }
};

export const logout = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    const refreshToken = obtenerRefreshToken( req );

    try {
        if ( refreshToken ) {
            await cerrarSesion( refreshToken );
        }

        limpiarCookieRefresh( res );

        res.status(200).json({ msg: "Sesión cerrada correctamente", });
    } catch (error: unknown) {
        next(error);
    }
};

export const logoutAll = async ( req: AuthRequest, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const IDUsuario = req.user?.IDUsuario;

        if ( typeof IDUsuario !== "number" ) {
            res.status(401).json({ error: "No autorizado", });
            return;
        }

        await cerrarTodasLasSesiones( IDUsuario );

        limpiarCookieRefresh( res );

        res.status(200).json({ msg: "Todas las sesiones fueron cerradas", });
    } catch (error: unknown) {
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
