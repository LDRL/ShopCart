
import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { UsuarioAutenticado } from "../repositories/auth.repository.js";

export interface AuthTokenPayload extends JwtPayload {
    mail: string;
}

export interface AuthRequest extends Request {
    user?: UsuarioAutenticado;
}
