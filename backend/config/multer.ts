
"use strict";

import multer from "multer";
import path from "node:path";
import fs from "node:fs";

import type { Request } from "express";

const uploadDir = path.resolve(process.cwd(), "uploads");

// Crear el directorio si todavía no existe.
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ): void => {
        cb(null, uploadDir);
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ): void => {
        const extension = path.extname(file.originalname).toLowerCase();
        const fileName = path.basename(file.originalname, extension);

        // Limitar caracteres especiales en el nombre del archivo.
        const safeFileName = fileName
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .slice(0, 100);

        cb(null, `${safeFileName}-${Date.now()}${extension}`);
    },
});

const upload = multer({
    storage,

    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
        files: 1,
    },

    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
    ): void => {
        const allowedExtensions = /\.(jpeg|jpg|png|webp)$/i;
        const allowedMimeTypes = /^image\/(jpeg|png|webp)$/i;

        const extension = path.extname(file.originalname).toLowerCase();

        if (
            allowedExtensions.test(extension) &&
            allowedMimeTypes.test(file.mimetype)
        ) {
            cb(null, true);
            return;
        }

        const error = new Error(
            "Solo se permiten imágenes JPEG, JPG, PNG o WEBP"
        );

        req.fileValidationError = error.message;

        cb(error);
    },
});

export { upload };
