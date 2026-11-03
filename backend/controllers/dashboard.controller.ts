import type { Request, Response } from "express";
import { obtenerPaginacion, responderPaginacionError } from "../utils/paginacion.js";
import {
    listarPedidosDashboardService,
    ventasPorPeriodoService,
    ventasPorCategoriaService,
    topProductosService,
} from "../services/dashboard.service.js";

const parseFecha = (valor: unknown): Date | null => {
    if (typeof valor !== "string" || !valor.trim()) return null;
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? null : d;
};

export const getPedidosDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const IDEstadoPedido = req.query.IDEstadoPedido
            ? Number(req.query.IDEstadoPedido)
            : req.query.estado
            ? Number(req.query.estado)
            : null;
        const IDCliente = req.query.IDCliente ? Number(req.query.IDCliente) : null;

        const result = await listarPedidosDashboardService({
            IDEstadoPedido,
            IDCliente,
            FechaDesde: parseFecha(req.query.fechaDesde ?? req.query.desde),
            FechaHasta: parseFecha(req.query.fechaHasta ?? req.query.hasta),
            Buscar: req.query.buscar?.toString() || req.query.q?.toString() || null,
            pagina,
            registrosPorPagina,
        });
        res.status(200).json({ msg: "Pedidos obtenidos con exito", ...result });
    } catch (error: unknown) {
        try {
            responderPaginacionError(res, error);
            return;
        } catch {
            // no es error de paginacion
        }
        console.error("Error al listar pedidos dashboard:", error);
        res.status(500).json({ msg: "Hubo un error al obtener los pedidos" });
    }
};

export const getVentasPorPeriodo = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await ventasPorPeriodoService({
            Periodo: (req.query.periodo ?? req.query.Periodo ?? "dia").toString(),
            FechaDesde: parseFecha(req.query.fechaDesde ?? req.query.desde),
            FechaHasta: parseFecha(req.query.fechaHasta ?? req.query.hasta),
        });
        res.status(200).json({ msg: "Ventas por periodo obtenidas con exito", data });
    } catch (error: unknown) {
        console.error("Error al obtener ventas por periodo:", error);
        res.status(500).json({ msg: "Hubo un error al obtener las ventas" });
    }
};

export const getVentasPorCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await ventasPorCategoriaService({
            FechaDesde: parseFecha(req.query.fechaDesde ?? req.query.desde),
            FechaHasta: parseFecha(req.query.fechaHasta ?? req.query.hasta),
        });
        res.status(200).json({ msg: "Ventas por categoria obtenidas con exito", data });
    } catch (error: unknown) {
        console.error("Error al obtener ventas por categoria:", error);
        res.status(500).json({ msg: "Hubo un error al obtener las ventas" });
    }
};

export const getTopProductos = async (req: Request, res: Response): Promise<void> => {
    try {
        const top = req.query.top ? Number(req.query.top) : req.query.limit ? Number(req.query.limit) : 10;
        const data = await topProductosService({
            FechaDesde: parseFecha(req.query.fechaDesde ?? req.query.desde),
            FechaHasta: parseFecha(req.query.fechaHasta ?? req.query.hasta),
            Top: top,
        });
        res.status(200).json({ msg: "Top productos obtenidos con exito", data });
    } catch (error: unknown) {
        console.error("Error al obtener top productos:", error);
        res.status(500).json({ msg: "Hubo un error al obtener el top de productos" });
    }
};