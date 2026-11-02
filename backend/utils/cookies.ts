export const leerCookie = (
    cookieHeader: string | undefined,
    nombre: string
): string | undefined => {
    if (!cookieHeader) {
        return undefined;
    }

    for (const parte of cookieHeader.split(";")) {
        const indice = parte.indexOf("=");

        if (indice === -1) {
            continue;
        }

        const clave = parte.slice(0, indice).trim();

        if (clave !== nombre) {
            continue;
        }

        const valor = parte.slice(indice + 1).trim();

        try {
            return decodeURIComponent(valor);
        } catch {
            return valor;
        }
    }

    return undefined;
};
