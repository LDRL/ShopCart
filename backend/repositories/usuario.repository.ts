import type { IResult } from "mssql";

import { dbConnect, sql } from "../config/db/connection.js";
import { DomainError } from "../errors/domainError.js";
import { esDuplicadoSql, obtenerNumeroErrorSql } from "../utils/sqlErrors.js";

export interface ActualizarUsuarioInput {
    correo: string;
    nombre: string;
    apellido: string;
    IDRol: number;
}

export interface PaginacionParams {
    pagina?: number | null;
    registrosPorPagina?: number | null;
}

export const listarUsuarios = async (
    params: PaginacionParams & { buscar?: string | null } = {}
): Promise<{ rows: any[]; totalRegistros: number }> => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("Pagina", sql.Int, params.pagina ?? null)
        .input("RegistrosPorPagina", sql.Int, params.registrosPorPagina ?? null)
        .input("Buscar", sql.NVarChar(255), params.buscar ?? null)
        .execute("dbo.SP_Usuarios_ListarUsuario");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    const totalRegistros = Number(recordsets[0]?.[0]?.TotalRegistros ?? 0);
    const rows = recordsets[1] ?? [];

    return { rows, totalRegistros };
};

export const obtenerUsuarioPorId = async (
    id: number
): Promise<Record<string, unknown> | null> => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("id", sql.Int, id)
        .execute("dbo.SP_Usuarios_BuscarIdUsuario");

    return result.recordset?.[0] ?? null;
};

export const crearUsuario = async (
    nombre: string,
    apellido: string,
    correo: string,
    passwordHash: string,
    IDRol: number
): Promise<Record<string, unknown> | null> => {
    const pool = await dbConnect();

    try {
        const result = await pool
            .request()
            .input("P_NOMBRE", sql.VarChar(50), nombre.trim())
            .input("P_APELLIDO", sql.VarChar(50), apellido.trim())
            .input("P_CORREO", sql.VarChar(150), correo.trim())
            .input("P_PASSWORD", sql.VarChar(255), passwordHash)
            .input("P_ID_ROL", sql.Int, IDRol)
            .execute("dbo.SP_Usuarios_CrearUsuario");

        return result.recordset?.[0] ?? null;
    } catch (error: unknown) {
        const numeroError = obtenerNumeroErrorSql(error);

        // 50003: el SP detecta el correo duplicado.
        // 2627 / 2601: la base detecta una restricción UNIQUE duplicada.
        if (numeroError === 50003 || esDuplicadoSql(error)) {
            throw new DomainError(
                "USUARIO_CORREO_DUPLICADO",
                "El correo ya está registrado"
            );
        }

        // 50002: el SP rechaza roles distintos de Administrador u Operador.
        if (numeroError === 50002) {
            throw new DomainError(
                "USUARIO_ROL_INVALIDO",
                "El rol debe ser Administrador u Operador"
            );
        }

        throw error;
    }
};

export const actualizarUsuario = async (
    id: number,
    input: ActualizarUsuarioInput
): Promise<Record<string, unknown> | null> => {
    const pool = await dbConnect();

    try {
        await pool
            .request()
            .input("P_CORREO", sql.VarChar(150), input.correo.trim())
            .input("P_NOMBRE", sql.VarChar(80), input.nombre.trim())
            .input("P_APELLIDO", sql.VarChar(80), input.apellido.trim())
            .input("P_ID_ROL", sql.Int, input.IDRol)
            .input("P_ID_USUARIO", sql.Int, id)
            .execute("dbo.SP_Usuarios_ActualizarUsuario");

        return { IDUsuario: id };
    } catch (error: unknown) {
        const numeroError = obtenerNumeroErrorSql(error);

        if (numeroError === 50004) {
            throw new DomainError("USUARIO_NO_ENCONTRADO", "Usuario no encontrado");
        }

        if (numeroError === 50003 || esDuplicadoSql(error)) {
            throw new DomainError(
                "USUARIO_CORREO_DUPLICADO",
                "El correo ya está registrado"
            );
        }

        if (numeroError === 50002) {
            throw new DomainError(
                "USUARIO_ROL_INVALIDO",
                "El rol debe ser Administrador u Operador"
            );
        }

        throw error;
    }
};

export const eliminarUsuario = async (
    id: number
): Promise<Record<string, unknown> | null> => {
    const pool = await dbConnect();

    try {
        await pool
            .request()
            .input("P_ID_USUARIO", sql.Int, id)
            .execute("dbo.SP_Usuarios_EliminarUsuario");

        return { IDUsuario: id };
    } catch (error: unknown) {
        const numeroError = obtenerNumeroErrorSql(error);

        if (numeroError === 50004) {
            throw new DomainError("USUARIO_NO_ENCONTRADO", "Usuario no encontrado");
        }

        throw error;
    }
};


