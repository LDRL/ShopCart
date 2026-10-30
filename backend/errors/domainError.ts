export class DomainError extends Error {
    constructor(
        public readonly code: string,
        message: string
    ) {
        super(message);
        this.name = "DomainError";
    }
}

const HTTP_STATUS_BY_CODE: Record<string, number> = {
    USUARIO_CORREO_DUPLICADO: 409,
    USUARIO_ROL_INVALIDO: 400,
    USUARIO_NO_ENCONTRADO: 404,
};

export const statusHttpDeError = (error: DomainError): number =>
    HTTP_STATUS_BY_CODE[error.code] ?? 400;
