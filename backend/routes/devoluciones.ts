import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { permitirRoles } from "../middleware/roles.js";
import * as pedidoCtrl from "../controllers/pedido.controller.js";

const router = Router();

router.use(authenticate);
router.use(permitirRoles(1, 2));

router.patch(
    "/:IDDevolucion/estado",
    pedidoCtrl.validarCambiarEstadoDevolucion,
    pedidoCtrl.patchEstadoDevolucion
);

export default router;
