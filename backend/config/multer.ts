import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import multer from "multer";

const carpetaDestino = path.resolve(process.cwd(), "uploads", "productos");

const extensionesPermitidas = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const tiposPermitidos = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        fs.mkdirSync(carpetaDestino, { recursive: true });
        cb(null, carpetaDestino);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${crypto.randomUUID()}${extension}`);
    },
});

export const subirArchivosProducto = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 30,
    },
    fileFilter: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (!tiposPermitidos.has(file.mimetype) || !extensionesPermitidas.has(extension)) {
            cb(new Error("TIPO_ARCHIVO_INVALIDO"));
            return;
        }

        cb(null, true);
    },
}).any();
