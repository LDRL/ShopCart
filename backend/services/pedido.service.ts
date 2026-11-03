import { cambiarEstadoDevolucionRepo, cambiarEstadoPedidoRepo, crearDevolucionRepo, crearPedidoRepo, liberarReservasVencidasRepo, 
    listarDevolucionesPorPedidoRepo, listarPedidosRepo, obtenerIdClientePorUsuarioRepo, obtenerPedidoRepo, 
    obtenerResumenPedidoRepo, type CrearDevolucionInput, type CrearPedidoInput, } 
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

const esCliente = (actor: ActorPedido): boolean => actor.IDRol === ROL_CLIENTE;

const esOperadorOAdministrador = (actor: ActorPedido): boolean =>
    actor.IDRol === ROL_ADMINISTRADOR || actor.IDRol === ROL_OPERADOR;

const resolverClienteDelActor = async ( actor: ActorPedido ): Promise<number | null> => {
    if (!esCliente(actor)) {
        return null;
    }

    return await obtenerIdClientePorUsuarioRepo(actor.IDUsuario);
};

export const crearPedidoService = async ( actor: ActorPedido, input: Omit<CrearPedidoInput, "IDUsuario"> ) => {
    if ( actor.IDRol !== ROL_ADMINISTRADOR && actor.IDRol !== ROL_CLIENTE ) {
        throw new Error("PEDIDO_NO_AUTORIZADO");
    }

    return await crearPedidoRepo({
        ...input,
        IDUsuario: actor.IDUsuario,
    });
};

export const listarPedidosService = async (
    actor: ActorPedido,
    filtros: {
        IDCliente?: number | null;
        IDEstadoPedido?: number | null;
        buscar?: string | null;
        pagina?: number;
        tamanoPagina?: number;
    }
) => {
    let IDCliente = filtros.IDCliente ?? null;

    if (esCliente(actor)) {
        IDCliente = await resolverClienteDelActor(actor);

        if (IDCliente === null) {
            return [];
        }
    }

    return await listarPedidosRepo({
        ...filtros,
        IDCliente,
    });
};

export const obtenerPedidoService = async ( actor: ActorPedido, IDPedido: number ) => {
    let IDCliente: number | null = null;

    if (esCliente(actor)) {
        IDCliente = await resolverClienteDelActor(actor);

        if (IDCliente === null) {
            throw new Error("PEDIDO_NO_ENCONTRADO");
        }
    }

    const data = await obtenerPedidoRepo(IDPedido, IDCliente);

    if (!data) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    return data;
};

export const cambiarEstadoPedidoService = async ( actor: ActorPedido, IDPedido: number, IDEstadoNuevo: number, 
    observaciones?: string | null ) => {
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

    const permitidos = TRANSICIONES_PEDIDO[pedido.IDEstadoPedido] ?? [];

    if (!permitidos.includes(IDEstadoNuevo)) {
        throw new Error("PEDIDO_TRANSICION_INVALIDA");
    }

    return await cambiarEstadoPedidoRepo({
        IDPedido,
        IDEstadoNuevo,
        IDUsuario: actor.IDUsuario,
        observaciones: observaciones ?? null,
    });
};

export const cancelarPedidoService = async ( actor: ActorPedido, IDPedido: number, motivo: string ) => {
    const pedido = await obtenerResumenPedidoRepo(IDPedido);

    if (!pedido) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    if (esCliente(actor)) {
        const IDCliente = await resolverClienteDelActor(actor);

        if (IDCliente === null || pedido.IDCliente !== IDCliente) {
            throw new Error("PEDIDO_NO_ENCONTRADO");
        }
    } else if (!esOperadorOAdministrador(actor)) {
        throw new Error("PEDIDO_NO_AUTORIZADO");
    }

    const permitidos = TRANSICIONES_PEDIDO[pedido.IDEstadoPedido] ?? [];

    if (!permitidos.includes(6)) {
        throw new Error("PEDIDO_TRANSICION_INVALIDA");
    }

    return await cambiarEstadoPedidoRepo({
        IDPedido,
        IDEstadoNuevo: 6,
        IDUsuario: actor.IDUsuario,
        observaciones: motivo,
    });
};

export const solicitarDevolucionService = async ( actor: ActorPedido, input: Omit<CrearDevolucionInput, "IDUsuario" | "IDCliente"> ) => {
    let IDCliente: number | null = null;

    if (esCliente(actor)) {
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

    return await crearDevolucionRepo({
        ...input,
        IDUsuario: actor.IDUsuario,
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

export const listarDevolucionesPorPedidoService = async ( actor: ActorPedido, IDPedido: number ) => {
    let IDCliente: number | null = null;

    if (esCliente(actor)) {
        IDCliente = await resolverClienteDelActor(actor);

        if (IDCliente === null) {
            throw new Error("PEDIDO_NO_ENCONTRADO");
        }
    }

    const pedido = await obtenerResumenPedidoRepo(IDPedido);

    if (!pedido || (IDCliente !== null && pedido.IDCliente !== IDCliente)) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
    }

    return await listarDevolucionesPorPedidoRepo(IDPedido, IDCliente);
};

export const liberarReservasVencidasService = async () => {
    return await liberarReservasVencidasRepo(null);
};
