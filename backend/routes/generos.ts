import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import * as generoCtrl from "../controllers/genero.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", generoCtrl.getGeneros);
router.get("/:id", generoCtrl.getGenero);
router.post("/", generoCtrl.validarGenero, generoCtrl.postGenero);
router.put("/:id", generoCtrl.validarActualizarGenero, generoCtrl.putGenero);
router.delete("/:id", generoCtrl.deleteGenero);

export default router;
