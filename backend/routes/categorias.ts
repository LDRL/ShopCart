import { Router } from "express";

import {
    getCategorias,
    getCategoria,
    postCategoria,
    putCategoria,
    deleteCategoria,
    validarCategoriaProducto,
} from "../controllers/categoria.js";

import { authenticate } from "../middleware/auth.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get("/", getCategorias);
router.get("/:id", getCategoria);
router.post("/", validarCategoriaProducto, postCategoria);
router.put("/:id", putCategoria);
router.delete("/:id", deleteCategoria);

export default router;