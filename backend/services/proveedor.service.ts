import { construirPaginacion } from "../utils/paginacion.js";
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

export const listarProveedoresService = async (
    params: { pagina?: number | null; registrosPorPagina?: number | null; buscar?: string | null } = {}
) => {
    const { rows, totalRegistros } = await listarProveedoresRepo(params);
    return {
        data: rows,
        paginacion: construirPaginacion(
            totalRegistros,
            params.pagina ?? null,
            params.registrosPorPagina ?? null
        ),
    };
};

export const obtenerProveedorPorIdService = async (IDProveedor: number) => {
    const proveedor = await obtenerProveedorPorIdRepo(IDProveedor);

    if (!proveedor) {
        throw new Error("PROVEEDOR_NO_ENCONTRADO");
    }

    return proveedor;
};


