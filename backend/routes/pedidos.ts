import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { permitirRoles } from "../middleware/roles.js";
import * as pedidoCtrl from "../controllers/pedido.controller.js";

const router = Router();

router.use(authenticate);

router.get( "/", permitirRoles(1, 2, 3), pedidoCtrl.validarFiltrosPedidos, pedidoCtrl.getPedidos );
router.get( "/:IDPedido", permitirRoles(1, 2, 3), pedidoCtrl.getPedido );
router.get( "/:IDPedido/devoluciones", permitirRoles(1, 2, 3), pedidoCtrl.getDevolucionesPorPedido );
router.post( "/", permitirRoles(1, 3), pedidoCtrl.validarCrearPedido, pedidoCtrl.postPedido );
router.patch( "/:IDPedido/estado", permitirRoles(1, 2), pedidoCtrl.validarCambiarEstadoPedido, pedidoCtrl.patchEstadoPedido );
router.post( "/:IDPedido/cancelar", permitirRoles(1, 2, 3), pedidoCtrl.validarCancelarPedido, pedidoCtrl.postCancelarPedido );
router.post( "/:IDPedido/devoluciones", permitirRoles(1, 2, 3), pedidoCtrl.validarSolicitarDevolucion, pedidoCtrl.postDevolucion );

export default router;
