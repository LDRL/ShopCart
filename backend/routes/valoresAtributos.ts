import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import * as valorAtributoCtrl from "../controllers/valorAtributo.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", valorAtributoCtrl.getValoresAtributo);
router.get("/:id", valorAtributoCtrl.getValorAtributo);
router.post("/", valorAtributoCtrl.validarValorAtributo, valorAtributoCtrl.postValorAtributo);
router.put("/:id", valorAtributoCtrl.validarValorAtributo, valorAtributoCtrl.putValorAtributo);
router.delete("/:id", valorAtributoCtrl.deleteValorAtributo);

export default router;
