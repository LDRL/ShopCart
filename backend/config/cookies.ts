import type { CookieOptions } from "express";

import { REFRESH_TOKEN_TTL_SECONDS } from "../utils/jwt.js";

export const REFRESH_COOKIE_NAME = "refreshToken";
export const REFRESH_COOKIE_PATH = "/api/auth";

const parseBoolean = (valor: string | undefined, porDefecto: boolean): boolean => {
    if (valor === undefined || valor.trim() === "") {
        return porDefecto;
    }

    return ["1", "true", "yes", "si", "sí"].includes(valor.trim().toLowerCase());
};

const normalizarSameSite = (
    valor: string | undefined
): CookieOptions["sameSite"] => {
    const normalizado = (valor ?? "lax").trim().toLowerCase();

    if (normalizado === "strict") {
        return "strict";
    }

    if (normalizado === "none") {
        return "none";
    }

    return "lax";
};

export const opcionesCookieRefresh = (): CookieOptions => {
    const esProduccion = process.env.NODE_ENV === "production";
    const sameSite = normalizarSameSite(process.env.COOKIE_SAME_SITE);
    const secure =
        parseBoolean(process.env.COOKIE_SECURE, esProduccion) ||
        sameSite === "none";

    const domain = process.env.COOKIE_DOMAIN?.trim();

    return {
        httpOnly: true,
        secure,
        sameSite,
        domain: domain ? domain : undefined,
        path: REFRESH_COOKIE_PATH,
        maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    };
};

export const opcionesCookieRefreshEliminar = (): CookieOptions => {
    return {
        ...opcionesCookieRefresh(),
        maxAge: 0,
        expires: new Date(0),
    };
};
