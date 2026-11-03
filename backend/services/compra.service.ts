import { construirPaginacion } from "../utils/paginacion.js";
import {
    anularCompraRepo,
    crearCompraRepo,
    listarComprasRepo,
    obtenerCompraPorIdRepo,
    type CompraInput,
} from "../repositories/compra.repository.js";

export const crearCompraService = async (input: CompraInput) => {
    return await crearCompraRepo(input);
};

export const listarComprasService = async (
    params: { pagina?: number | null; registrosPorPagina?: number | null; estado?: boolean | null; buscar?: string | null } = {}
) => {
    const { rows, totalRegistros } = await listarComprasRepo(params);
    return {
        data: rows,
        paginacion: construirPaginacion(
            totalRegistros,
            params.pagina ?? null,
            params.registrosPorPagina ?? null
        ),
    };
};

export const obtenerCompraPorIdService = async (IDCompra: number) => {
    const compra = await obtenerCompraPorIdRepo(IDCompra);

    if (!compra) {
        throw new Error("COMPRA_NO_ENCONTRADA");
    }

    return compra;
};

export const anularCompraService = async (
    IDCompra: number,
    IDUsuario: number,
    motivo: string
) => {
    return await anularCompraRepo(IDCompra, IDUsuario, motivo);
};


