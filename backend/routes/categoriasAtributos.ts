import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import * as categoriaAtributoCtrl from "../controllers/categoriaAtributo.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", categoriaAtributoCtrl.getCategoriasAtributos);
router.get("/:id", categoriaAtributoCtrl.getCategoriaAtributo);
router.post(
    "/",
    categoriaAtributoCtrl.validarCategoriaAtributo,
    categoriaAtributoCtrl.postCategoriaAtributo
);
router.put(
    "/:id",
    categoriaAtributoCtrl.validarActualizarCategoriaAtributo,
    categoriaAtributoCtrl.putCategoriaAtributo
);
router.delete("/:id", categoriaAtributoCtrl.deleteCategoriaAtributo);

export default router;
