import { Router } from "express";
import * as clienteCtrl from "../controllers/cliente.controller.js";

const router = Router();

router.get("/", clienteCtrl.getClientes);
router.get("/:IDCliente", clienteCtrl.getCliente);
router.post( "/", clienteCtrl.validarCliente, clienteCtrl.postCliente );


export default router;
