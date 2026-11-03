import {
    crearClienteRepo,
    actualizarClienteRepo,
    eliminarClienteRepo,
    listarClientesRepo,
    obtenerClientePorIdRepo,
    type ClienteActualizarInput,
    type ClienteCrearInput,
} from "../repositories/cliente.repository.js";
import { hashPassword } from "../utils/auth.js";

export const crearClienteService = async (input: ClienteCrearInput) => {

    const contraseña = await hashPassword(input.contraseña);

    return await crearClienteRepo({
        ...input,
        contraseña
    });
   
};

export const actualizarClienteService = async (
    IDCliente: number,
    input: ClienteActualizarInput
) => {
    return await actualizarClienteRepo(IDCliente, input);
};

export const eliminarClienteService = async (IDCliente: number) => {
    return await eliminarClienteRepo(IDCliente);
};

export const listarClientesService = async () => {
    return await listarClientesRepo();
};

export const obtenerClientePorIdService = async (IDCliente: number) => {
    const cliente = await obtenerClientePorIdRepo(IDCliente);

    if (!cliente) {
        throw new Error("CLIENTE_NO_ENCONTRADO");
    }

    return cliente;
};
