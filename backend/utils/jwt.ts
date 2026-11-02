import { randomUUID } from "node:crypto";

import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface RefreshTokenPayload extends jwt.JwtPayload {
    id: number;
    mail: string;
    nombre: string;
    type: "refresh";
}

const obtenerSecreto = (nombre: "JWT_SECRET" | "JWT_REFRESH_SECRET"): string => {
    const secreto = process.env[nombre];

    if (!secreto) {
        throw new Error(`${nombre} no está configurado`);
    }

    return secreto;
};

export const generateAccessToken = (
    id: number,
    nombre: string,
    mail: string
): string => {
    return jwt.sign(
        { id, nombre, mail, type: "access" },
        obtenerSecreto("JWT_SECRET"),
        { expiresIn: ACCESS_TOKEN_TTL_SECONDS }
    );
};

export const generateRefreshToken = (
    id: number,
    nombre: string,
    mail: string
): string => {
    return jwt.sign(
        { id, nombre, mail, type: "refresh" },
        obtenerSecreto("JWT_REFRESH_SECRET"),
        {
            expiresIn: REFRESH_TOKEN_TTL_SECONDS,
            jwtid: randomUUID(),
        }
    );
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    let payload: string | jwt.JwtPayload;

    try {
        payload = jwt.verify(token, obtenerSecreto("JWT_REFRESH_SECRET"));
    } catch {
        throw new Error("REFRESH_TOKEN_INVALIDO");
    }

    if (typeof payload !== "object" || payload === null) {
        throw new Error("REFRESH_TOKEN_INVALIDO");
    }

    const { id, mail, nombre, type } = payload as Record<string, unknown>;

    if (
        typeof id !== "number" ||
        typeof mail !== "string" ||
        typeof nombre !== "string" ||
        type !== "refresh"
    ) {
        throw new Error("REFRESH_TOKEN_INVALIDO");
    }

    return payload as RefreshTokenPayload;
};
