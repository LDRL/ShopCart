import { construirPaginacion } from "../utils/paginacion.js";
import {
    actualizarCuponRepo,
    crearCuponRepo,
    eliminarCuponRepo,
    listarCuponesRepo,
    obtenerCuponPorIdRepo,
    validarCuponRepo,
    type CuponInput,
    type ValidarCuponInput,
} from "../repositories/cupon.repository.js";

export const crearCuponService = async (input: CuponInput) => {
    return await crearCuponRepo(input);
};

export const actualizarCuponService = async (
    IDCupon: number,
    input: CuponInput
) => {
    return await actualizarCuponRepo(IDCupon, input);
};

export const eliminarCuponService = async (IDCupon: number) => {
    return await eliminarCuponRepo(IDCupon);
};

export const listarCuponesService = async (
    params: { pagina?: number | null; registrosPorPagina?: number | null; buscar?: string | null } = {}
) => {
    const { rows, totalRegistros } = await listarCuponesRepo(params);
    return {
        data: rows,
        paginacion: construirPaginacion(
            totalRegistros,
            params.pagina ?? null,
            params.registrosPorPagina ?? null
        ),
    };
};

export const obtenerCuponPorIdService = async (IDCupon: number) => {
    const cupon = await obtenerCuponPorIdRepo(IDCupon);

    if (!cupon) {
        throw new Error("CUPON_NO_ENCONTRADO");
    }

    return cupon;
};

export const validarCuponService = async (input: ValidarCuponInput) => {
    return await validarCuponRepo(input);
};



