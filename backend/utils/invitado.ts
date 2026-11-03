import { randomBytes } from "node:crypto";

import type { AuthRequest } from "../types/auth.types.js";

const TOKEN_INVITADO_REGEX = /^[A-Za-z0-9_-]{16,64}$/;

export const generarTokenInvitado = (): string =>
    randomBytes(32).toString("base64url");

export const tokenInvitadoDesdeRequest = (req: AuthRequest): string | null => {
    const header = req.header("X-Invitado-Token");
    const body = (req.body as { tokenInvitado?: unknown } | undefined)
        ?.tokenInvitado;
    const query = (req.query as { tokenInvitado?: unknown } | undefined)
        ?.tokenInvitado;

    const raw = header ?? body ?? query;

    return typeof raw === "string" ? raw.trim() : null;
};

export const esTokenInvitadoValido = (token: string): boolean =>
    TOKEN_INVITADO_REGEX.test(token);
