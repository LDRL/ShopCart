import type { NextFunction, Response } from "express";

import type { AuthRequest } from "../types/auth.types.js";

export const permitirRoles =
    (...roles: number[]) =>
    (req: AuthRequest, res: Response, next: NextFunction): void => {
        const rol = req.user?.IDRol;

        if (typeof rol !== "number" || !roles.includes(rol)) {
            res.status(403).json({
                error: "No autorizado: rol insuficiente",
            });
            return;
        }

        next();
    };

export const permitirRolesOInvitado =
    (...roles: number[]) =>
    (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            next();
            return;
        }

        if (!roles.includes(req.user.IDRol)) {
            res.status(403).json({
                error: "No autorizado: rol insuficiente",
            });
            return;
        }

        next();
    };
