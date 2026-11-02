import { Router } from "express";
import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.js";
import {
    eliminarArchivosSubidos,
    normalizarProducto,
} from "../middleware/normalizarProducto.js";
import { subirArchivosProducto } from "../config/multer.js";

import * as productoCtrl from "../controllers/producto.controller.js";
import * as varianteCtrl from "../controllers/variante.controller.js";

import {
    validarCrearProducto,
    validarActualizarProducto,
} from "../validators/producto.js";

const router = Router();

router.use(authenticate);

// Productos padre
router.get("/", productoCtrl.getProductos);
router.get("/:id", productoCtrl.getProducto);
router.post(
    "/",
    subirArchivosProducto,
    normalizarProducto,
    validarCrearProducto,
    productoCtrl.postProducto
);
router.put(
    "/:id",
    subirArchivosProducto,
    normalizarProducto,
    validarActualizarProducto,
    productoCtrl.putProducto
);
router.delete("/:id", productoCtrl.deleteProducto);

// Variantes (solo lectura)
router.get("/:id/variantes", varianteCtrl.getVariantes);

// Atributos por categoría
router.get("/categoria/:id/atributos", varianteCtrl.getAtributosCategoria);

const manejarErrorMulter: ErrorRequestHandler = (error, req, res, _next) => {
    eliminarArchivosSubidos(req);

    if (error instanceof multer.MulterError) {
        res.status(400).json({ msg: "Archivo inválido", code: error.code });
        return;
    }

    if (error instanceof Error && error.message === "TIPO_ARCHIVO_INVALIDO") {
        res.status(400).json({ msg: "Solo se permiten imágenes JPG, PNG o WEBP" });
        return;
    }

    console.error("Error en rutas de productos:", error);
    res.status(500).json({ msg: "Hubo un error al procesar la solicitud" });
};

router.use(manejarErrorMulter);

export default router;
