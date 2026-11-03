import { dbConnect, sql } from "../config/db/connection.js";

export interface ClienteInput {
    nombre: string;
    apellido: string;
    correo: string ;
    telefono: string 
    direccion: string;
    nit: string;
}

export interface ClienteCrearInput extends ClienteInput{
    contraseña: string;
}

export interface ClienteActualizarInput extends ClienteInput {
    estado: boolean;
}

export const crearClienteRepo = async (input: ClienteCrearInput) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("P_NOMBRE", sql.VarChar(50), input.nombre.trim())
        .input("P_APELLIDO", sql.VarChar(50), input.apellido.trim())
        .input("P_CORREO", sql.VarChar(100), input.correo.trim())
        .input("P_PASSWORD", sql.VarChar(255), input.contraseña)
        .input("P_TELEFONO", sql.VarChar(8), input.telefono.trim())
        .input("P_DIRECCION", sql.VarChar(255), input.direccion.trim())
        .input("P_NIT", sql.VarChar(13), input.nit.trim())
        .execute("dbo.[SP_Clientes_CrearCliente]");

    return result.recordset?.[0] ?? null;

};

export const actualizarClienteRepo = async ( IDCliente: number, input: ClienteActualizarInput ) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDProveedor", sql.Int, IDCliente)
        .input("Nombre", sql.VarChar(150), input.nombre)
        .input("NIT", sql.VarChar(11), input.nit ?? null)
        .input("Telefono", sql.VarChar(11), input.telefono ?? null)
        .input("Correo", sql.VarChar(150), input.correo ?? null)
        .input("Direccion", sql.VarChar(150), input.direccion ?? null)
        .input("Estado", sql.Bit, input.estado)
        .execute("dbo.SP_Proveedores_ActualizarProveedor");

    return result.recordset?.[0] ?? null;
};

export const eliminarClienteRepo = async (IDCliente: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDProveedor", sql.Int, IDCliente)
        .execute("dbo.SP_Proveedores_EliminarProveedor");

    return result.recordset?.[0] ?? null;
};

export const listarClientesRepo = async () => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .execute("dbo.SP_Proveedores_ListarProveedores");

    return result.recordset ?? [];
};

export const obtenerClientePorIdRepo = async (IDCliente: number) => {
    const pool = await dbConnect();

    const result = await pool
        .request()
        .input("IDProveedor", sql.Int, IDCliente)
        .execute("dbo.SP_Proveedores_ObtenerProveedorPorID");

    return result.recordset?.[0] ?? null;
};
