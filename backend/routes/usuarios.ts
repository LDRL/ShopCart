import { Router } from "express";

import {
    getUsuarios,
    getUsuario,
    postUsuario,
    putUsuario,
    deleteUsuario,
} from "../controllers/usuario.js";
import {
    validarUsuario,
    validarUsuarioActualizacion,
} from "../validators/usuario.js";

import { authenticate } from "../middleware/auth.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get("/", getUsuarios);
router.get("/:id", getUsuario);
router.post("/", validarUsuario, postUsuario);
router.put("/:id", validarUsuarioActualizacion, putUsuario);
router.delete("/:id", deleteUsuario);

export default router;
