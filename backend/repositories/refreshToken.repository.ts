import { dbConnect, sql } from "../config/db/connection.js";

export interface RefreshTokenRotado {
    IDRefreshToken: number;
    IDUsuario: number;
}

export const crearRefreshTokenRepo = async (
    IDUsuario: number,
    tokenHash: string,
    expiraEn: Date
): Promise<void> => {
    const pool = await dbConnect();

    await pool
        .request()
        .input("IDUsuario", sql.Int, IDUsuario)
        .input("TokenHash", sql.VarChar(64), tokenHash)
        .input("ExpiraEn", sql.DateTime2, expiraEn)
        .execute("dbo.SP_Auth_CrearRefreshToken");
};

export const rotarRefreshTokenRepo = async (
    tokenHash: string,
    nuevoTokenHash: string,
    nuevaExpiracion: Date
): Promise<RefreshTokenRotado | null> => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("TokenHash", sql.VarChar(64), tokenHash)
        .input("NuevoTokenHash", sql.VarChar(64), nuevoTokenHash)
        .input("NuevaExpiracion", sql.DateTime2, nuevaExpiracion)
        .execute("dbo.SP_Auth_RotarRefreshToken");

    return (result.recordset?.[0] as RefreshTokenRotado | undefined) ?? null;
};

export const revocarRefreshTokenRepo = async (tokenHash: string): Promise<void> => {
    const pool = await dbConnect();

    await pool
        .request()
        .input("TokenHash", sql.VarChar(64), tokenHash)
        .execute("dbo.SP_Auth_RevocarRefreshToken");
};

export const revocarTodosRefreshTokensRepo = async (IDUsuario: number): Promise<void> => {
    const pool = await dbConnect();

    await pool
        .request()
        .input("IDUsuario", sql.Int, IDUsuario)
        .execute("dbo.SP_Auth_RevocarTodosRefreshTokens");
};
