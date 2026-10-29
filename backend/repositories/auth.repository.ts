
import { dbConnect, sql } from "../config/db/connection.js";

export interface UsuarioLogin {
    IDUsuario: number;
    nombre: string;
    correo: string;
    contraseña: string;
    IDRol: number;
    estado: boolean;
}

export interface UsuarioAutenticado {
    IDUsuario: number;
    nombre: string;
    correo: string;
    IDRol: number;
    estado: boolean;
}

export const buscarUsuarioPorCorreo = async (
    correo: string
): Promise<UsuarioLogin | null> => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("email", sql.NVarChar(254), correo)
        .execute("dbo.SP_Usuarios_BuscarUsuario");

    const usuario = result.recordset?.[0] as
        | UsuarioLogin
        | undefined;

    return usuario ?? null;
};


export const actualizarPassword = async (
    idUsuario: number,
    passwordHash: string
): Promise<void> => {
    const pool = await dbConnect();

    await pool
        .request()
        .input(
            "P_PASSWORD",
            sql.VarChar(255),
            passwordHash
        )
        .input(
            "P_ID_USUARIO",
            sql.Int,
            idUsuario
        )
        .execute("dbo.SP_Usuarios_ActualizarContraseña");
};