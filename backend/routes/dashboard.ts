import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { permitirRoles } from "../middleware/roles.js";
import * as dashboardCtrl from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);
router.use(permitirRoles(1, 2));

router.get("/pedidos", dashboardCtrl.getPedidosDashboard);
router.get("/ventas", dashboardCtrl.getVentasPorPeriodo);
router.get("/ventas-por-categoria", dashboardCtrl.getVentasPorCategoria);
router.get("/top-productos", dashboardCtrl.getTopProductos);

export default router;