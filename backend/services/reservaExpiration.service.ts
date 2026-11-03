import { liberarReservasVencidasService } from "./pedido.service.js";

const INTERVALO_POR_DEFECTO_MS = 60_000;

let temporizador: NodeJS.Timeout | null = null;
let ejecutando = false;

const obtenerIntervalo = (): number => {
    const configurado = Number(process.env.RESERVAS_EXPIRACION_INTERVALO_MS);

    if (
        !Number.isFinite(configurado) ||
        configurado < 5_000 ||
        configurado > 3_600_000
    ) {
        return INTERVALO_POR_DEFECTO_MS;
    }

    return configurado;
};

const liberarReservas = async (): Promise<void> => {
    if (ejecutando) {
        return;
    }

    ejecutando = true;

    try {
        const resultado = await liberarReservasVencidasService();
        const cancelados = resultado?.pedidosCancelados ?? 0;

        if (cancelados > 0) {
            console.log(
                `[reservas] ${cancelados} pedido(s) cancelado(s) por reservas vencidas`
            );
        }
    } catch (error: unknown) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        console.error("[reservas] Error al liberar reservas vencidas:", mensaje);
    } finally {
        ejecutando = false;
    }
};

export const iniciarLiberacionReservasVencidas = (): void => {
    if (temporizador) {
        return;
    }

    const intervalo = obtenerIntervalo();

    temporizador = setInterval(() => {
        void liberarReservas();
    }, intervalo);

    if (typeof temporizador.unref === "function") {
        temporizador.unref();
    }

    void liberarReservas();
    console.log(
        `[reservas] Liberacion automatica iniciada (cada ${intervalo} ms)`
    );
};

export const detenerLiberacionReservasVencidas = (): void => {
    if (!temporizador) {
        return;
    }

    clearInterval(temporizador);
    temporizador = null;
};
