
import express, {
    type Application,
    type Request,
    type Response,
} from "express";

import cors from "cors";
import path from "node:path";
import type { Server as HttpServer } from "node:http";

import { dbConnection } from "./db/connection.js";

import authRouter from "../routes/auth.js";
import usuarioRouter from "../routes/usuarios.js";
import categorieRouter from "../routes/categorias.js";


class Server {
    private app: Application;
    private port: number;
    private httpServer?: HttpServer;

    private paths = {
        auth: "/api/auth",
        usuarios: '/api/usuarios',
        categorias: '/api/categorias',
        
    };

    constructor() {
        this.app = express();
        this.port = Number(process.env.PORT) || 3000;

        this.middlewares();
        this.routes();
    }

    async conectarDB(): Promise<void> {
        await dbConnection();
    }

    private middlewares(): void {
        this.app.use(cors({ origin: "*" }));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use(
            "/uploads",
            express.static(path.resolve(process.cwd(), "uploads"))
        );

        this.app.use(
            express.static(path.resolve(process.cwd(), "public"))
        );
    }

    private routes(): void {
        this.app.use(this.paths.auth, authRouter);
        this.app.use(this.paths.usuarios, usuarioRouter);
        this.app.use(this.paths.categorias, categorieRouter);
        

        // Middleware 404: debe ir después de todas las rutas.
        this.app.use(
            (_req: Request, res: Response): void => {
                res.status(404).json({
                    errors: {
                        msg: "URL_NOT_FOUND",
                    },
                });
            }
        );
    }

    listen(): void {
        this.httpServer = this.app.listen(this.port, () => {
            console.log(
                `Servidor ejecutándose en http://localhost:${this.port}`
            );
        });
    }

    async start(): Promise<void> {
        await this.conectarDB();
        this.listen();
    }
}

export default Server;
