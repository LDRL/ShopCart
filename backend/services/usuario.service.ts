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
    pageStr: string,
    limiteStr: string,
    search: string
) => {
    const paginated = pageStr !== "";
    const pageNumber = paginated ? Number(pageStr) : 0;
    const limitNumber = paginated ? Number(limiteStr) : 0;

    const result = await listarUsuarios(pageNumber, limitNumber, search);
    const recordsets = result.recordsets;

    const rows: Array<{ Total?: number | string; [key: string]: unknown }> =
        Array.isArray(recordsets) ? (recordsets[0] ?? []) : [];

    const secondSet = Array.isArray(recordsets)
        ? (recordsets[1] as Array<{ Total?: number | string }> | undefined)
        : undefined;

    const lastRow = rows[rows.length - 1];
    const totalFromLastRow = lastRow?.Total !== undefined ? Number(lastRow.Total) : undefined;
    const totalFromSecondSet = secondSet?.[0]?.Total !== undefined ? Number(secondSet[0].Total) : undefined;

    const total = totalFromSecondSet ?? totalFromLastRow ?? rows.length;
    const data = totalFromLastRow !== undefined ? rows.slice(0, -1) : rows;
    const totalPages = paginated ? Math.ceil(total / limitNumber) : 1;

    return {
        data,
        total,
        limit: limitNumber,
        currentPage: pageNumber,
        totalPages,
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
