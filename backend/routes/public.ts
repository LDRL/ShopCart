import { Router } from "express";

import * as publicCtrl from "../controllers/public.controller.js";

const router = Router();

// Tienda publica (sin autenticacion)
router.get("/productos/shop", publicCtrl.getShopProductos);
router.get("/productos", publicCtrl.getProductosPublic);
router.get("/productos/:id", publicCtrl.getProductoPublic);
router.get("/productos/:id/variantes", publicCtrl.getVariantesPublic);

router.get("/categorias", publicCtrl.getCategoriasPublic);
router.get("/generos", publicCtrl.getGenerosPublic);
router.get("/atributos", publicCtrl.getAtributosPublic);
router.get("/valores-atributos", publicCtrl.getValoresAtributoPublic);

export default router;