import { cambiarEstadoDevolucionRepo, cambiarEstadoPedidoRepo, crearDevolucionRepo, crearPedidoRepo, liberarReservasVencidasRepo,
    listarDevolucionesRepo, listarDevolucionesPorPedidoRepo, listarPedidosRepo, obtenerIdClientePorUsuarioRepo, obtenerPedidoRepo, obtenerResumenPedidoRepo, 
    type CrearDevolucionInput, type CrearPedidoInput, } 
from "../repositories/pedido.repository.js";

const ROL_ADMINISTRADOR = 1;
const ROL_OPERADOR = 2;
const ROL_CLIENTE = 3;

const TRANSICIONES_PEDIDO: Record<number, number[]> = {
    1: [2, 6],
    2: [3, 6],
    3: [4, 6],
    4: [5],
    5: [7, 8],
    7: [8],
};

export interface ActorPedido {
    IDUsuario: number;
    IDRol: number;
}

export interface ActorInvitado {
    tokenInvitado: string;
}

export type Actor = ActorPedido | ActorInvitado;

const esInvitado = (actor: Actor): actor is ActorInvitado =>
    "tokenInvitado" in actor;

const esCliente = (actor: Actor): boolean =>
    !esInvitado(actor) && actor.IDRol === ROL_CLIENTE;

const esOperadorOAdministrador = (actor: Actor): boolean =>
    !esInvitado(actor) &&
    (actor.IDRol === ROL_ADMINISTRADOR || actor.IDRol === ROL_OPERADOR);

const resolverClienteDelActor = async ( actor: ActorPedido ): Promise<number | null> => {
    if (!esCliente(actor)) {
        return null;
    }

    return await obtenerIdClientePorUsuarioRepo(actor.IDUsuario);
};

const validarTransicion = (IDEstadoActual: number, IDEstadoNuevo: number): void => {
    const permitidos = TRANSICIONES_PEDIDO[IDEstadoActual] ?? [];

    if (!permitidos.includes(IDEstadoNuevo)) {
        throw new Error("PEDIDO_TRANSICION_INVALIDA");
    }
};

export const crearPedidoService = async ( actor: Actor, input: Omit<CrearPedidoInput, "IDUsuario" | "tokenInvitado"> ) => {
    if (esInvitado(actor)) {
        if (!input.nombre || !input.apellido || !input.correo) {
            throw new Error("PEDIDO_CONTACTO_REQUERIDO");
        }

        return await crearPedidoRepo({
            ...input,
            IDUsuario: null,
            tokenInvitado: actor.tokenInvitado,
        });
    }

    if ( actor.IDRol !== ROL_ADMINISTRADOR && actor.IDRol !== ROL_CLIENTE ) {
        throw new Error("PEDIDO_NO_AUTORIZADO");
    }

    return await crearPedidoRepo({
        ...input,
        IDUsuario: actor.IDUsuario,
        tokenInvitado: null,
    });
};

export const listarPedidosService = async (
    actor: Actor,
    filtros: {
        IDCliente?: number | null;
        IDEstadoPedido?: number | null;
        buscar?: string | null;
        pagina?: number | null;
        registrosPorPagina?: number | null;
    }
) => {
    let IDCliente = filtros.IDCliente ?? null;
    let tokenInvitado: string | null = null;

    if (esInvitado(actor)) {
        IDCliente = null;
        tokenInvitado = actor.tokenInvitado;
    } else if (esCliente(actor)) {
        IDCliente = await resolverClienteDelActor(actor);

        if (IDCliente === null) {
            return { pedidos: [], totalRegistros: 0 };
        }
    }

    return await listarPedidosRepo({
        ...filtros,
        IDCliente,
        tokenInvitado,
    });
};

export const obtenerPedidoService = async ( actor: Actor, IDPedido: number ) => {
    let IDCliente: number | null = null;
    let tokenInvitado: string | null = null;

    if (esInvitado(actor)) {
        tokenInvitado = actor.tokenInvitado;
    } else if (esCliente(actor)) {
        IDCliente = await resolverClienteDelActor(actor);

        if (IDCliente === null) {
            throw new Error("PEDIDO_NO_ENCONTRADO");
        }
    }

    const data = await obtenerPedidoRepo(IDPedido, IDCliente, tokenInvitado);

    if (!data) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    return data;
};

export const cambiarEstadoPedidoService = async ( actor: Actor, IDPedido: number, IDEstadoNuevo: number, 
    observaciones?: string | null ) => {
    if (esInvitado(actor)) {
        if (IDEstadoNuevo !== 2) {
            throw new Error("PEDIDO_NO_AUTORIZADO");
        }

        const pedido = await obtenerResumenPedidoRepo(IDPedido);

        if (!pedido || pedido.tokenInvitado !== actor.tokenInvitado) {
            throw new Error("PEDIDO_NO_ENCONTRADO");
        }

        validarTransicion(pedido.IDEstadoPedido, IDEstadoNuevo);

        return await cambiarEstadoPedidoRepo({
            IDPedido,
            IDEstadoNuevo,
            IDUsuario: null,
            tokenInvitado: actor.tokenInvitado,
            observaciones: observaciones ?? null,
        });
    }

    if (esCliente(actor)) {
        const IDCliente = await resolverClienteDelActor(actor);

        if (IDCliente === null) {
            throw new Error("PEDIDO_NO_ENCONTRADO");
        }

        const pedido = await obtenerResumenPedidoRepo(IDPedido);

        if (!pedido || pedido.IDCliente !== IDCliente) {
            throw new Error("PEDIDO_NO_ENCONTRADO");
        }

        if (IDEstadoNuevo !== 2) {
            throw new Error("PEDIDO_NO_AUTORIZADO");
        }

        validarTransicion(pedido.IDEstadoPedido, IDEstadoNuevo);

        return await cambiarEstadoPedidoRepo({
            IDPedido,
            IDEstadoNuevo,
            IDUsuario: actor.IDUsuario,
            tokenInvitado: null,
            observaciones: observaciones ?? null,
        });
    }

    if (!esOperadorOAdministrador(actor)) {
        throw new Error("PEDIDO_NO_AUTORIZADO");
    }

    if (![2, 3, 4, 5].includes(IDEstadoNuevo)) {
        throw new Error("PEDIDO_ESTADO_INVALIDO");
    }

    const pedido = await obtenerResumenPedidoRepo(IDPedido);

    if (!pedido) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    validarTransicion(pedido.IDEstadoPedido, IDEstadoNuevo);

    return await cambiarEstadoPedidoRepo({
        IDPedido,
        IDEstadoNuevo,
        IDUsuario: actor.IDUsuario,
        tokenInvitado: null,
        observaciones: observaciones ?? null,
    });
};

export const cancelarPedidoService = async ( actor: Actor, IDPedido: number, motivo: string ) => {
    const pedido = await obtenerResumenPedidoRepo(IDPedido);

    if (!pedido) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    if (esInvitado(actor)) {
        if (pedido.tokenInvitado !== actor.tokenInvitado) {
            throw new Error("PEDIDO_NO_ENCONTRADO");
        }
    } else if (esCliente(actor)) {
        const IDCliente = await resolverClienteDelActor(actor);

        if (IDCliente === null || pedido.IDCliente !== IDCliente) {
            throw new Error("PEDIDO_NO_ENCONTRADO");
        }
    } else if (!esOperadorOAdministrador(actor)) {
        throw new Error("PEDIDO_NO_AUTORIZADO");
    }

    validarTransicion(pedido.IDEstadoPedido, 6);

    return await cambiarEstadoPedidoRepo({
        IDPedido,
        IDEstadoNuevo: 6,
        IDUsuario: esInvitado(actor) ? null : actor.IDUsuario,
        tokenInvitado: esInvitado(actor) ? actor.tokenInvitado : null,
        observaciones: motivo,
    });
};

export const solicitarDevolucionService = async ( actor: Actor, input: Omit<CrearDevolucionInput, "IDUsuario" | "IDCliente" | "tokenInvitado"> ) => {
    let IDCliente: number | null = null;
    let tokenInvitado: string | null = null;

    if (esInvitado(actor)) {
        tokenInvitado = actor.tokenInvitado;
    } else if (esCliente(actor)) {
        IDCliente = await resolverClienteDelActor(actor);
    } else if (!esOperadorOAdministrador(actor)) {
        throw new Error("DEVOLUCION_NO_AUTORIZADA");
    }

    const pedido = await obtenerResumenPedidoRepo(input.IDPedido);

    if (!pedido) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    if (IDCliente !== null && pedido.IDCliente !== IDCliente) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    if (tokenInvitado !== null && pedido.tokenInvitado !== tokenInvitado) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    return await crearDevolucionRepo({
        ...input,
        IDUsuario: esInvitado(actor) ? null : actor.IDUsuario,
        tokenInvitado,
        IDCliente: null,
    });
};

export const cambiarEstadoDevolucionService = async (
    actor: ActorPedido,
    IDDevolucion: number,
    IDEstadoNuevo: string,
    observaciones?: string | null
) => {
    if (!esOperadorOAdministrador(actor)) {
        throw new Error("DEVOLUCION_NO_AUTORIZADA");
    }

    const devolucion = await cambiarEstadoDevolucionRepo({
        IDDevolucion,
        IDEstadoNuevo,
        IDUsuario: actor.IDUsuario,
        observaciones: observaciones ?? null,
    });

    return devolucion;
};

export const listarDevolucionesPorPedidoService = async (
    actor: Actor,
    IDPedido: number,
    filtros: { pagina?: number | null; registrosPorPagina?: number | null } = {}
) => {
    let IDCliente: number | null = null;
    let tokenInvitado: string | null = null;

    if (esInvitado(actor)) {
        tokenInvitado = actor.tokenInvitado;
    } else if (esCliente(actor)) {
        IDCliente = await resolverClienteDelActor(actor);

        if (IDCliente === null) {
            throw new Error("PEDIDO_NO_ENCONTRADO");
        }
    }

    const pedido = await obtenerResumenPedidoRepo(IDPedido);

    if (!pedido || (IDCliente !== null && pedido.IDCliente !== IDCliente)) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    if (tokenInvitado !== null && pedido.tokenInvitado !== tokenInvitado) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    return await listarDevolucionesPorPedidoRepo(
        IDPedido,
        IDCliente,
        tokenInvitado,
        filtros.pagina ?? null,
        filtros.registrosPorPagina ?? null
    );
};

export const listarDevolucionesService = async (
    actor: ActorPedido,
    filtros: { pagina?: number | null; registrosPorPagina?: number | null; estado?: string | null; buscar?: string | null }
) => {
    if (!esOperadorOAdministrador(actor)) {
        throw new Error("DEVOLUCION_NO_AUTORIZADA");
    }

    return await listarDevolucionesRepo(filtros);
};

export const liberarReservasVencidasService = async () => {
    return await liberarReservasVencidasRepo(null);
};
