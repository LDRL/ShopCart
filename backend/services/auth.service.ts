import {
    buscarUsuarioPorCorreo,
    actualizarPassword,
    type UsuarioLogin,
} from "../repositories/auth.repository.js";
import {
    crearRefreshTokenRepo,
    rotarRefreshTokenRepo,
    revocarRefreshTokenRepo,
    revocarTodosRefreshTokensRepo,
} from "../repositories/refreshToken.repository.js";
import { checkPassword, hashPassword } from "../utils/auth.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    REFRESH_TOKEN_TTL_SECONDS,
} from "../utils/jwt.js";
import { hashToken } from "../utils/tokenHash.js";
import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";

export interface SesionTokens {
    token: string;
    refreshToken: string;
}

const calcularExpiracionRefresh = (): Date =>
    new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

const crearSesion = async (
    usuario: Pick<UsuarioLogin, "IDUsuario" | "nombre" | "correo">
): Promise<SesionTokens> => {
    const token = generateAccessToken(
        usuario.IDUsuario,
        usuario.nombre,
        usuario.correo
    );

    const refreshToken = generateRefreshToken(
        usuario.IDUsuario,
        usuario.nombre,
        usuario.correo
    );

    await crearRefreshTokenRepo(
        usuario.IDUsuario,
        hashToken(refreshToken),
        calcularExpiracionRefresh()
    );

    return { token, refreshToken };
};

export const iniciarSesion = async (
    correo: string,
    contraseña: string
): Promise<SesionTokens> => {
    const usuario = await buscarUsuarioPorCorreo(correo.trim());

    if (!usuario) {
        throw new Error("CREDENCIALES_INVALIDAS");
    }

    const contraseñaCorrecta = await checkPassword(
        contraseña,
        usuario.contraseña
    );

    if (!contraseñaCorrecta) {
        throw new Error("CREDENCIALES_INVALIDAS");
    }

    if (!usuario.estado) {
        throw new Error("USUARIO_INACTIVO");
    }

    return await crearSesion(usuario);
};

export const refrescarSesion = async (
    refreshToken: string
): Promise<SesionTokens> => {
    const payload = verifyRefreshToken(refreshToken);

    const usuario = await buscarUsuarioPorCorreo(payload.mail);

    if (
        !usuario ||
        !usuario.estado ||
        usuario.IDUsuario !== payload.id
    ) {
        throw new Error("REFRESH_TOKEN_INVALIDO");
    }

    const nuevoRefreshToken = generateRefreshToken(
        usuario.IDUsuario,
        usuario.nombre,
        usuario.correo
    );

    const token = generateAccessToken(
        usuario.IDUsuario,
        usuario.nombre,
        usuario.correo
    );

    try {
        const rotado = await rotarRefreshTokenRepo(
            hashToken(refreshToken),
            hashToken(nuevoRefreshToken),
            calcularExpiracionRefresh()
        );

        if (!rotado) {
            throw new Error("REFRESH_TOKEN_INVALIDO");
        }
    } catch (error: unknown) {
        const numero = obtenerNumeroErrorSql(error);

        if (numero === 50501) {
            throw new Error("REFRESH_TOKEN_INVALIDO");
        }

        if (numero === 50502) {
            throw new Error("REFRESH_TOKEN_REUTILIZADO");
        }

        if (numero === 50503) {
            throw new Error("REFRESH_TOKEN_EXPIRADO");
        }

        if (numero === 50504) {
            throw new Error("USUARIO_INACTIVO");
        }

        throw error;
    }

    return { token, refreshToken: nuevoRefreshToken };
};

export const cerrarSesion = async (refreshToken: string): Promise<void> => {
    await revocarRefreshTokenRepo(hashToken(refreshToken));
};

export const cerrarTodasLasSesiones = async (IDUsuario: number): Promise<void> => {
    await revocarTodosRefreshTokensRepo(IDUsuario);
};

export const cambiarPassword = async (
    IDUsuario: number,
    contraseña: string
): Promise<void> => {
    const passwordHash = await hashPassword(contraseña);
    await actualizarPassword(IDUsuario, passwordHash);
};
