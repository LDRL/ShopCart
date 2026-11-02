import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { permitirRoles } from "../middleware/roles.js";
import * as proveedorCtrl from "../controllers/proveedor.controller.js";

const router = Router();

router.use(authenticate);
router.use(permitirRoles(1, 2));

router.get("/", proveedorCtrl.getProveedores);
router.get("/:IDProveedor", proveedorCtrl.getProveedor);
router.post(
    "/",
    proveedorCtrl.validarProveedor,
    proveedorCtrl.postProveedor
);
router.put(
    "/:IDProveedor",
    proveedorCtrl.validarActualizarProveedor,
    proveedorCtrl.putProveedor
);
router.delete("/:IDProveedor", proveedorCtrl.deleteProveedor);

export default router;
