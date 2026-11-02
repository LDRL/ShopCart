import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { permitirRoles } from "../middleware/roles.js";
import * as compraCtrl from "../controllers/compra.controller.js";

const router = Router();

router.use(authenticate);
router.use(permitirRoles(1, 2));

router.get("/", compraCtrl.getCompras);
router.get("/:IDCompra", compraCtrl.getCompra);
router.post("/", compraCtrl.validarCompra, compraCtrl.postCompra);
router.post(
    "/:IDCompra/anular",
    compraCtrl.validarAnulacion,
    compraCtrl.anularCompra
);

export default router;
