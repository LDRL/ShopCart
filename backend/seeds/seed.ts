import 'dotenv/config';
import sql from 'mssql';
import bcrypt from "bcrypt";

async function seed() {
    let pool: sql.ConnectionPool | undefined;

    try {
        pool = await sql.connect({
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            server: process.env.SQL_HOST || "localhost",
            database: process.env.SQL_DATABASE,
            port: Number(process.env.SQL_PORT || 1433),
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        });

        const correo = 'admin@sistema.com';
        const password ='Pass1234';

        if (!correo || !password) {
            throw new Error(
                'Faltan las variables del administrador inicial.'
            );
        }

        // Evitar crear nuevamente el administrador
        const existente = await pool
            .request()
            .input('correo', sql.VarChar(100), correo)
            .query(`
                SELECT TOP 1 IDUsuario
                FROM dbo.Usuarios
                WHERE correo = @correo;
            `);

        if (existente.recordset.length > 0) {
            console.log('El administrador ya existe.');
            return;
        }

        // Hash generado en Node.js, nunca en SQL Server
        const passwordHash = await bcrypt.hash(password, 12);

        // Registrar mediante el procedimiento almacenado
        const resultado = await pool
            .request()
            .input(
                'P_NOMBRE',
                sql.VarChar(80),
                'Administrador'
            )
            .input(
                'P_APELLIDO',
                sql.VarChar(80),
                'del sistema'
            )
            .input(
                'P_CORREO',
                sql.VarChar(100),
                correo
            )
            .input(
                'P_PASSWORD',
                sql.VarChar(255),
                passwordHash
            )
            .input(
                'P_ID_ROL',
                sql.Int,
                1
            )
            .execute('dbo.SP_Usuarios_CrearUsuario');

        console.log(
            'Seed ejecutado:',
            resultado.recordset[0]
        );

    } catch (error) {
        console.error('Error ejecutando seed:', error);
        process.exitCode = 1;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

seed();