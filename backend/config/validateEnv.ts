const esProduccion = (): boolean => process.env.NODE_ENV === "production";

export const validarEntorno = (): void => {
    const errores: string[] = [];

    if (!process.env.JWT_SECRET?.trim()) {
        errores.push("JWT_SECRET es obligatorio");
    }

    if (!process.env.JWT_REFRESH_SECRET?.trim()) {
        errores.push("JWT_REFRESH_SECRET es obligatorio");
    }

    if (esProduccion()) {
        if (!process.env.FRONTEND_URL?.trim()) {
            errores.push("FRONTEND_URL es obligatorio en produccion");
        }

        if (process.env.COOKIE_SECURE?.trim().toLowerCase() === "false") {
            errores.push("COOKIE_SECURE no puede ser false en produccion");
        }
    }

    if (errores.length > 0) {
        for (const error of errores) {
            console.error("Configuracion invalida:", error);
        }

        throw new Error(`CONFIGURACION_INVALIDA: ${errores.join("; ")}`);
    }
};
