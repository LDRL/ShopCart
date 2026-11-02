import fs from "node:fs";

import type { NextFunction, Request, Response } from "express";

const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
    typeof valor === "object" && valor !== null && !Array.isArray(valor);

const parsearDatos = (datos: unknown): Record<string, unknown> => {
    if (esObjeto(datos)) {
        return datos;
    }

    if (typeof datos !== "string") {
        throw new Error("PAYLOAD_INVALIDO");
    }

    const parsed: unknown = JSON.parse(datos);

    if (!esObjeto(parsed)) {
        throw new Error("PAYLOAD_INVALIDO");
    }

    return parsed;
};

const resolverImagenes = (
    imagenes: unknown,
    urlsPorCampo: Map<string, string>
): void => {
    if (!Array.isArray(imagenes)) {
        return;
    }

    for (const imagen of imagenes) {
        if (!esObjeto(imagen)) {
            throw new Error("IMAGEN_INVALIDA");
        }

        const campo = typeof imagen.campo === "string" ? imagen.campo : undefined;

        if (campo) {
            const url = urlsPorCampo.get(campo);

            if (!url) {
                throw new Error(`ARCHIVO_NO_ENCONTRADO:${campo}`);
            }

            imagen.URLImagen = url;
            delete imagen.campo;
        }

        if (typeof imagen.URLImagen !== "string" || imagen.URLImagen.trim() === "") {
            throw new Error("IMAGEN_SIN_URL");
        }
    }
};

export const eliminarArchivosSubidos = (req: Request): void => {
    const archivos = Array.isArray(req.files) ? req.files : [];

    for (const archivo of archivos) {
        fs.unlink(archivo.path, () => undefined);
    }
};

export const normalizarProducto = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        if (typeof req.body?.datos === "string") {
            req.body = parsearDatos(req.body.datos);
        }

        const archivos = Array.isArray(req.files) ? req.files : [];
        const urlsPorCampo = new Map(
            archivos.map((archivo) => [
                archivo.fieldname,
                `/uploads/productos/${archivo.filename}`,
            ])
        );

        resolverImagenes(req.body?.imagenes, urlsPorCampo);

        next();
    } catch (error: unknown) {
        eliminarArchivosSubidos(req);

        const mensaje = error instanceof Error ? error.message : "PAYLOAD_INVALIDO";

        res.status(400).json({
            msg: "Datos invalidos",
            errors: [{ msg: mensaje }],
        });
    }
};
