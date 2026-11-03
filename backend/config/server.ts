
import express, {
    type Application,
    type Request,
    type Response,
} from "express";

import cors from "cors";
import path from "node:path";
import type { Server as HttpServer } from "node:http";

import { dbConnection } from "./db/connection.js";
import { validarEntorno } from "./validateEnv.js";

import authRouter from "../routes/auth.js";
import usuarioRouter from "../routes/usuarios.js";
import categorieRouter from "../routes/categorias.js";
import productosRouter from "../routes/productos.js";
import generosRouter from "../routes/generos.js";
import atributosRouter from "../routes/atributos.js";
import valoresAtributosRouter from "../routes/valoresAtributos.js";
import categoriasAtributosRouter from "../routes/categoriasAtributos.js";
import inventarioRouter from "../routes/inventario.js";
import proveedoresRouter from "../routes/proveedores.js";
import comprasRouter from "../routes/compras.js";
import cuponesRouter from "../routes/cupones.js";
import pedidosRouter from "../routes/pedidos.js";
import devolucionesRouter from "../routes/devoluciones.js";
import clientesRouter from "../routes/cliente.js";
import publicRouter from "../routes/public.js";
import dashboardRouter from "../routes/dashboard.js";
import bitacoraRouter from "../routes/bitacora.js";

class Server {
    private app: Application;
    private port: number;
    private httpServer?: HttpServer;

    private paths = {
        auth: "/api/auth",
        usuarios: '/api/usuarios',
        categorias: '/api/categorias',
        productos: '/api/productos',
        generos: '/api/generos',
        atributos: '/api/atributos',
        valoresAtributos: '/api/valores-atributos',
        categoriasAtributos: '/api/categorias-atributos',
        inventario: '/api/inventario',
        proveedores: '/api/proveedores',
        compras: '/api/compras',
        cupones: '/api/cupones',
        pedidos: '/api/pedidos',
        devoluciones: '/api/devoluciones',
        clientes: '/api/clientes',
        public: '/api/public',
        dashboard: '/api/dashboard',
        bitacora: '/api/bitacora',
    };

    constructor() {
        this.app = express();
        this.port = Number(process.env.PORT) || 3000;

        validarEntorno();

        if (process.env.NODE_ENV === "production") {
            this.app.set("trust proxy", 1);
        }

        this.middlewares();
        this.routes();
    }

    async conectarDB(): Promise<void> {
        await dbConnection();
    }

    private middlewares(): void {
        const origenes = (process.env.FRONTEND_URL ?? "")
            .split(",")
            .map((origen) => origen.trim())
            .filter(Boolean);

        this.app.use(
            cors({
                origin: origenes.length > 0 ? origenes : true,
                credentials: true,
            })
        );

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
        this.app.use(this.paths.productos, productosRouter);
        this.app.use(this.paths.generos, generosRouter);
        this.app.use(this.paths.atributos, atributosRouter);
        this.app.use(this.paths.valoresAtributos, valoresAtributosRouter);
        this.app.use(this.paths.categoriasAtributos, categoriasAtributosRouter);
        this.app.use(this.paths.inventario, inventarioRouter);
        this.app.use(this.paths.proveedores, proveedoresRouter);
        this.app.use(this.paths.compras, comprasRouter);
        this.app.use(this.paths.cupones, cuponesRouter);
        this.app.use(this.paths.pedidos, pedidosRouter);
        this.app.use(this.paths.devoluciones, devolucionesRouter);
        this.app.use(this.paths.clientes, clientesRouter);
        this.app.use(this.paths.public, publicRouter);
        this.app.use(this.paths.dashboard, dashboardRouter);
        this.app.use(this.paths.bitacora, bitacoraRouter);

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
