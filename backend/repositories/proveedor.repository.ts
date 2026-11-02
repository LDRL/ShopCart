import { dbConnect, sql } from "../config/db/connection.js";

export interface ProveedorInput {
    nombre: string;
    nit?: string | null;
    telefono?: string | null;
    correo?: string | null;
    direccion?: string | null;
}

export interface ProveedorActualizarInput extends ProveedorInput {
    estado: boolean;
}

export const crearProveedorRepo = async (input: ProveedorInput) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("Nombre", sql.VarChar(150), input.nombre)
        .input("NIT", sql.VarChar(11), input.nit ?? null)
        .input("Telefono", sql.VarChar(11), input.telefono ?? null)
        .input("Correo", sql.VarChar(150), input.correo ?? null)
        .input("Direccion", sql.VarChar(150), input.direccion ?? null)
        .execute("dbo.SP_Proveedores_CrearProveedor");

    return result.recordset?.[0] ?? null;
};

export const actualizarProveedorRepo = async (
    IDProveedor: number,
    input: ProveedorActualizarInput
) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDProveedor", sql.Int, IDProveedor)
        .input("Nombre", sql.VarChar(150), input.nombre)
        .input("NIT", sql.VarChar(11), input.nit ?? null)
        .input("Telefono", sql.VarChar(11), input.telefono ?? null)
        .input("Correo", sql.VarChar(150), input.correo ?? null)
        .input("Direccion", sql.VarChar(150), input.direccion ?? null)
        .input("Estado", sql.Bit, input.estado)
        .execute("dbo.SP_Proveedores_ActualizarProveedor");

    return result.recordset?.[0] ?? null;
};

export const eliminarProveedorRepo = async (IDProveedor: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDProveedor", sql.Int, IDProveedor)
        .execute("dbo.SP_Proveedores_EliminarProveedor");

    return result.recordset?.[0] ?? null;
};

export const listarProveedoresRepo = async () => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .execute("dbo.SP_Proveedores_ListarProveedores");

    return result.recordset ?? [];
};

export const obtenerProveedorPorIdRepo = async (IDProveedor: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDProveedor", sql.Int, IDProveedor)
        .execute("dbo.SP_Proveedores_ObtenerProveedorPorID");

    return result.recordset?.[0] ?? null;
};
