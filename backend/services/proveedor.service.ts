import {
    crearProveedorRepo,
    actualizarProveedorRepo,
    eliminarProveedorRepo,
    listarProveedoresRepo,
    obtenerProveedorPorIdRepo,
    type ProveedorActualizarInput,
    type ProveedorInput,
} from "../repositories/proveedor.repository.js";

export const crearProveedorService = async (input: ProveedorInput) => {
    return await crearProveedorRepo(input);
};

export const actualizarProveedorService = async (
    IDProveedor: number,
    input: ProveedorActualizarInput
) => {
    return await actualizarProveedorRepo(IDProveedor, input);
};

export const eliminarProveedorService = async (IDProveedor: number) => {
    return await eliminarProveedorRepo(IDProveedor);
};

export const listarProveedoresService = async () => {
    return await listarProveedoresRepo();
};

export const obtenerProveedorPorIdService = async (IDProveedor: number) => {
    const proveedor = await obtenerProveedorPorIdRepo(IDProveedor);

    if (!proveedor) {
        throw new Error("PROVEEDOR_NO_ENCONTRADO");
    }

    return proveedor;
};
