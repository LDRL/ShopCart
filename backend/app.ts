"use strict";

import "dotenv/config";
import Server from "./config/server.js";
import { iniciarLiberacionReservasVencidas } from "./services/reservaExpiration.service.js";

const server = new Server();

const main = async (): Promise<void> => {
    try {
        await server.conectarDB();
        server.listen();
        iniciarLiberacionReservasVencidas();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(
                "Error al iniciar la aplicación:",
                error.message
            );
        } else {
            console.error("Error desconocido al iniciar la aplicación");
        }

        process.exitCode = 1;
    }
};

void main();