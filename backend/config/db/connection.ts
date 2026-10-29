
"use strict";

import sql from "mssql";

const config: sql.config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_HOST || "localhost",
    database: process.env.SQL_DATABASE,
    port: Number(process.env.SQL_PORT || 1433),

    options: {
        encrypt: true,
        trustServerCertificate: true,
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },

    connectionTimeout: 15000,
    requestTimeout: 15000,
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export const dbConnect = (): Promise<sql.ConnectionPool> => {
    if (!poolPromise) {
        const pool = new sql.ConnectionPool(config);

        poolPromise = pool.connect().catch((error: unknown) => {
            poolPromise = null;
            throw error;
        });
    }

    return poolPromise;
};

export const dbConnection = async (): Promise<void> => {
    try {
        await dbConnect();
        console.log("Conexión a SQL Server correcta.");
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(
                "Error de conexión a SQL Server:",
                error.message
            );
        }

        throw error;
    }
};

export { sql };
