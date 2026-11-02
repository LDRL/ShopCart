import {
    registrarMovimientoRepo,
    obtenerDisponibilidadRepo,
    obtenerKardexRepo,
    type MovimientoInventarioInput,
} from "../repositories/inventario.repository.js";

export const registrarMovimientoService = async (
    input: MovimientoInventarioInput
) => {
    return await registrarMovimientoRepo(input);
};

export const obtenerDisponibilidadService = async (
    IDProductoVariante: number
) => {
    const disponibilidad = await obtenerDisponibilidadRepo(IDProductoVariante);

    if (!disponibilidad) {
        throw new Error("INVENTARIO_NO_ENCONTRADO");
    }

    return disponibilidad;
};

export const obtenerKardexService = async (IDProductoVariante: number) => {
    return await obtenerKardexRepo(IDProductoVariante);
};
