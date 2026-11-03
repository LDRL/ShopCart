import { Router } from "express";
import * as clienteCtrl from "../controllers/cliente.controller.js";

const router = Router();

router.post( "/token-invitado", clienteCtrl.postTokenInvitado );
router.get("/buscar", clienteCtrl.buscarCliente);
router.get("/", clienteCtrl.getClientes);
router.get("/:IDCliente", clienteCtrl.getCliente);
router.post( "/", clienteCtrl.validarCliente, clienteCtrl.postCliente );


export default router;


