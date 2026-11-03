import {
    listarUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
} from "../repositories/usuario.repository.js";
import type { ActualizarUsuarioInput } from "../repositories/usuario.repository.js";
import { DomainError } from "../errors/domainError.js";
import { hashPassword } from "../utils/auth.js";

import { construirPaginacion } from "../utils/paginacion.js";

const ROLES_PERMITIDOS = [1, 2];

const validarRolPermitido = (IDRol: number): void => {
    if (!ROLES_PERMITIDOS.includes(IDRol)) {
        throw new DomainError(
            "USUARIO_ROL_INVALIDO",
            "El rol debe ser Administrador u Operador"
        );
    }
};

export interface CrearUsuarioInput {
    nombre: string;
    apellido: string;
    correo: string;
    contraseña: string;
    IDRol: number;
}


export const obtenerUsuarios = async (
    params: { pagina?: number | null; registrosPorPagina?: number | null; buscar?: string | null } = {}
) => {
    const { rows, totalRegistros } = await listarUsuarios(params);
    return {
        data: rows,
        paginacion: construirPaginacion(
            totalRegistros,
            params.pagina ?? null,
            params.registrosPorPagina ?? null
        ),
    };
};

export const obtenerUsuario = async (id: number) => {
    const usuario = await obtenerUsuarioPorId(id);
    if (!usuario) {
        throw new DomainError("USUARIO_NO_ENCONTRADO", "Usuario no encontrado");
    }
    return usuario;
};

export const crearUsuarioService = async (input: CrearUsuarioInput) => {
    validarRolPermitido(input.IDRol);

    const passwordHash = await hashPassword(input.contraseña);
    return crearUsuario(
        input.nombre,
        input.apellido,
        input.correo,
        passwordHash,
        input.IDRol
    );
};

export const actualizarUsuarioService = async (
    id: number,
    input: ActualizarUsuarioInput
) => {
    validarRolPermitido(input.IDRol);
    return actualizarUsuario(id, input);
};

export const eliminarUsuarioService = async (id: number) => {
    await obtenerUsuario(id);
    return eliminarUsuario(id);
};


