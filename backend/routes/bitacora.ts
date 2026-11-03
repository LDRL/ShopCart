import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { permitirRoles } from "../middleware/roles.js";
import * as bitacoraCtrl from "../controllers/bitacora.controller.js";

const router = Router();

router.use(authenticate);
router.use(permitirRoles(1));

router.get("/", bitacoraCtrl.getBitacora);

export default router;