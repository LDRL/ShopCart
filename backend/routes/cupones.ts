import { Router } from "express";

import { authenticate, authenticateOptional } from "../middleware/auth.js";
import { permitirRoles } from "../middleware/roles.js";
import * as cuponCtrl from "../controllers/cupon.controller.js";

const router = Router();

router.post(
    "/validar",
    authenticateOptional,
    cuponCtrl.validarAplicacionCupon,
    cuponCtrl.postValidarCupon
);

router.use(authenticate);
router.use(permitirRoles(1, 2));

router.get("/", cuponCtrl.getCupones);
router.get("/:IDCupon", cuponCtrl.getCupon);
router.post("/", cuponCtrl.validarCupon, cuponCtrl.postCupon);
router.put(
    "/:IDCupon",
    cuponCtrl.validarActualizarCupon,
    cuponCtrl.putCupon
);
router.delete("/:IDCupon", cuponCtrl.deleteCupon);

export default router;
