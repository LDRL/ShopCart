import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import * as atributoCtrl from "../controllers/atributo.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", atributoCtrl.getAtributos);
router.get("/:id", atributoCtrl.getAtributo);
router.post("/", atributoCtrl.validarAtributo, atributoCtrl.postAtributo);
router.put("/:id", atributoCtrl.validarActualizarAtributo, atributoCtrl.putAtributo);
router.delete("/:id", atributoCtrl.deleteAtributo);

export default router;
