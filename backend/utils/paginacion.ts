import type { Request } from "express";

export interface PaginacionParams {
    pagina: number | null;
    registrosPorPagina: number | null;
}

export class PaginacionError extends Error {
    readonly code: "PAGINACION_INVALIDA" | "PAGINACION_INCOMPLETA";

    constructor(code: PaginacionError["code"], message: string) {
        super(message);
        this.code = code;
    }
}

const leerEnteroPositivo = (valor: unknown, nombre: string): number | null => {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }

    const n = Number(valor);

    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
        throw new PaginacionError(
            "PAGINACION_INVALIDA",
            `${nombre} debe ser un entero mayor o igual a 1`
        );
    }

    return Math.trunc(n);
};

export const obtenerPaginacion = (req: Request): PaginacionParams => {
    const pagina = leerEnteroPositivo(req.query.pagina, "pagina");
    const registrosPorPagina = leerEnteroPositivo(
        req.query.registrosPorPagina,
        "registrosPorPagina"
    );

    if ((pagina === null) !== (registrosPorPagina === null)) {
        throw new PaginacionError(
            "PAGINACION_INCOMPLETA",
            "Debe enviar ambos parametros de paginacion."
        );
    }

    return { pagina, registrosPorPagina };
};

export interface Paginacion {
    pagina: number | null;
    registrosPorPagina: number | null;
    totalRegistros: number;
    totalPaginas: number | null;
}

export const construirPaginacion = (
    totalRegistros: number,
    pagina: number | null,
    registrosPorPagina: number | null
): Paginacion => {
    if (pagina !== null && registrosPorPagina !== null) {
        return {
            pagina,
            registrosPorPagina,
            totalRegistros,
            totalPaginas: Math.ceil(totalRegistros / registrosPorPagina),
        };
    }

    return {
        pagina: null,
        registrosPorPagina: null,
        totalRegistros,
        totalPaginas: null,
    };
};

export const responderPaginacionError = (
    res: { status: (code: number) => { json: (body: unknown) => void } },
    error: unknown
): void => {
    if (error instanceof PaginacionError) {
        res.status(400).json({ msg: error.message });
        return;
    }

    throw error;
};
