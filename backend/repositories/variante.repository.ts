import { dbConnect, sql } from "../config/db/connection.js";

export const listarVariantesRepo = async (IDProducto: number) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("IDProducto", sql.Int, IDProducto)
        .execute("dbo.SP_Producto_ObtenerVariantes");
    return result.recordset ?? [];
};

export const obtenerAtributosCategoriaRepo = async (IDCategoria: number) => {
    const pool = await dbConnect();
    const result = await pool
        .request()
        .input("IDCategoria", sql.Int, IDCategoria)
        .execute("dbo.SP_Producto_ObtenerAtributosCategoria");
    return result.recordset ?? [];
};
