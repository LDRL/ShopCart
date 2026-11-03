import { Router } from "express";

import { authenticateOptional } from "../middleware/auth.js";
import { permitirRolesOInvitado } from "../middleware/roles.js";
import * as pedidoCtrl from "../controllers/pedido.controller.js";

const router = Router();

router.get( "/", authenticateOptional, permitirRolesOInvitado(1, 2, 3), pedidoCtrl.validarFiltrosPedidos, pedidoCtrl.getPedidos );
router.get( "/:IDPedido", authenticateOptional, permitirRolesOInvitado(1, 2, 3), pedidoCtrl.getPedido );
router.get( "/:IDPedido/devoluciones", authenticateOptional, permitirRolesOInvitado(1, 2, 3), pedidoCtrl.validarPaginacion, pedidoCtrl.getDevolucionesPorPedido );
router.post( "/", authenticateOptional, permitirRolesOInvitado(1, 3), pedidoCtrl.validarCrearPedido, pedidoCtrl.postPedido );
router.patch( "/:IDPedido/estado", authenticateOptional, permitirRolesOInvitado(1, 2, 3), pedidoCtrl.validarCambiarEstadoPedido, pedidoCtrl.patchEstadoPedido );
router.post( "/:IDPedido/cancelar", authenticateOptional, permitirRolesOInvitado(1, 2, 3), pedidoCtrl.validarCancelarPedido, pedidoCtrl.postCancelarPedido );
router.post( "/:IDPedido/devoluciones", authenticateOptional, permitirRolesOInvitado(1, 2, 3), pedidoCtrl.validarSolicitarDevolucion, pedidoCtrl.postDevolucion );

export default router;
