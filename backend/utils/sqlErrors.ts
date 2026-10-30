export const obtenerNumeroErrorSql = (error: unknown): number | undefined => {
    if (typeof error === "object" && error !== null && "number" in error) {
        const { number } = error as { number?: unknown };
        return typeof number === "number" ? number : undefined;
    }

    return undefined;
};

export const esDuplicadoSql = (error: unknown): boolean => {
    const numero = obtenerNumeroErrorSql(error);
    return numero === 2627 || numero === 2601;
};
