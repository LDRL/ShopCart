import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import * as inventarioCtrl from "../controllers/inventario.controller.js";

const router = Router();

router.use(authenticate);

router.post(
    "/movimientos",
    inventarioCtrl.validarMovimiento,
    inventarioCtrl.postMovimiento
);
router.get(
    "/disponibilidad/:IDProductoVariante",
    inventarioCtrl.getDisponibilidad
);
router.get("/kardex/:IDProductoVariante", inventarioCtrl.getKardex);

export default router;
