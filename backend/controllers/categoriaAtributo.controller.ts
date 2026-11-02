import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import { obtenerCategoriasAtributosService, obtenerCategoriaAtributoPorIdService, crearCategoriaAtributoService, actualizarCategoriaAtributoService,
    eliminarCategoriaAtributoService,
} from "../services/categoriaAtributo.service.js";

const ERRORES_NO_ENCONTRADOS = new Set([50421, 50422, 50424]);
const ERRORES_CONFLICTO = new Set([50423]);

const responderErrorCategoriaAtributo = ( res: Response, error: unknown, contexto: string ): void => {
    const numero = obtenerNumeroErrorSql(error);
    const mensaje = error instanceof Error ? error.message : "Error desconocido";

    if (numero !== undefined && ERRORES_NO_ENCONTRADOS.has(numero)) {
        res.status(404).json({ msg: mensaje });
        return;
    }

    if (numero !== undefined && ERRORES_CONFLICTO.has(numero)) {
        res.status(409).json({ msg: mensaje });
        return;
    }

    if (numero !== undefined && numero >= 50000 && numero < 60000) {
        res.status(400).json({ msg: mensaje });
        return;
    }

    console.error(`Error al ${contexto}:`, mensaje);
    res.status(500).json({
        msg: "Hubo un error al procesar la asociacion categoria-atributo",
    });
};

const esIdValido = (id: number): boolean => Number.isSafeInteger(id) && id > 0;

const reglaIDCategoria = () =>
    body("IDCategoria")
        .isInt({ min: 1 })
        .withMessage("IDCategoria debe ser un entero positivo")
        .toInt();

const reglaIDAtributo = () =>
    body("IDAtributo")
        .isInt({ min: 1 })
        .withMessage("IDAtributo debe ser un entero positivo")
        .toInt();

const reglaObligatorio = (opcional: boolean) => {
    const validador = body("obligatorio");

    return (opcional ? validador.optional() : validador)
        .isBoolean()
        .withMessage("obligatorio debe ser booleano")
        .toBoolean();
};

export const validarCategoriaAtributo = [
    reglaIDCategoria(),
    reglaIDAtributo(),
    reglaObligatorio(true),
];

export const validarActualizarCategoriaAtributo = [
    reglaIDCategoria(),
    reglaIDAtributo(),
    reglaObligatorio(false),
];

export const getCategoriasAtributos = async (
    req: Request,
    res: Response
): Promise<void> => {
    const IDCategoriaRaw = req.query.IDCategoria;

    const IDCategoria =
        IDCategoriaRaw === undefined ? undefined : Number(IDCategoriaRaw);

    if (IDCategoria !== undefined && !esIdValido(IDCategoria)) {
        res.status(400).json({ msg: "El ID de la categoria es invalido" });
        return;
    }

    try {
        const asociaciones = await obtenerCategoriasAtributosService(IDCategoria);
        res.status(200).json({
            msg: "Asociaciones categoria-atributo obtenidas con exito",
            data: asociaciones,
        });
    } catch (error: unknown) {
        console.error(
            "Error al listar asociaciones categoria-atributo:",
            error instanceof Error ? error.message : error
        );
        res.status(500).json({
            msg: "Hubo un error al obtener las asociaciones categoria-atributo",
        });
    }
};

export const getCategoriaAtributo = async ( req: Request, res: Response ): Promise<void> => {
    const IDCategoriaAtributo = Number(req.params.id);

    if (!esIdValido(IDCategoriaAtributo)) {
        res.status(400).json({ msg: "El ID de la asociacion es invalido" });
        return;
    }

    try {
        const asociacion = await obtenerCategoriaAtributoPorIdService(
            IDCategoriaAtributo
        );
        res.status(200).json({
            msg: "Asociacion categoria-atributo obtenida con exito",
            data: asociacion,
        });
    } catch (error: unknown) {
        if (
            error instanceof Error &&
            error.message === "CATEGORIA_ATRIBUTO_NO_ENCONTRADO"
        ) {
            res.status(404).json({ msg: "Asociacion categoria-atributo no encontrada" });
            return;
        }

        console.error(
            "Error al obtener asociacion categoria-atributo:",
            error instanceof Error ? error.message : error
        );
        res.status(500).json({
            msg: "Hubo un error al obtener la asociacion categoria-atributo",
        });
    }
};

export const postCategoriaAtributo = async ( req: Request, res: Response ): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const { IDCategoria, IDAtributo, obligatorio = false } = req.body as {
        IDCategoria: number;
        IDAtributo: number;
        obligatorio?: boolean;
    };

    try {
        const data = await crearCategoriaAtributoService(
            Number(IDCategoria),
            Number(IDAtributo),
            Boolean(obligatorio)
        );
        res.status(201).json({
            msg: "Asociacion categoria-atributo creada correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorCategoriaAtributo(res, error, "crear asociacion categoria-atributo");
    }
};

export const putCategoriaAtributo = async ( req: Request, res: Response ): Promise<void> => {
    const IDCategoriaAtributo = Number(req.params.id);

    if (!esIdValido(IDCategoriaAtributo)) {
        res.status(400).json({ msg: "El ID de la asociacion es invalido" });
        return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const { IDCategoria, IDAtributo, obligatorio } = req.body as {
        IDCategoria: number;
        IDAtributo: number;
        obligatorio: boolean;
    };

    try {
        const data = await actualizarCategoriaAtributoService(
            IDCategoriaAtributo,
            Number(IDCategoria),
            Number(IDAtributo),
            Boolean(obligatorio)
        );
        res.status(200).json({
            msg: "Asociacion categoria-atributo actualizada correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorCategoriaAtributo(
            res,
            error,
            "actualizar asociacion categoria-atributo"
        );
    }
};

export const deleteCategoriaAtributo = async ( req: Request, res: Response ): Promise<void> => {
    const IDCategoriaAtributo = Number(req.params.id);

    if (!esIdValido(IDCategoriaAtributo)) {
        res.status(400).json({ msg: "El ID de la asociacion es invalido" });
        return;
    }

    try {
        const data = await eliminarCategoriaAtributoService(IDCategoriaAtributo);
        res.status(200).json({
            msg: "Asociacion categoria-atributo eliminada correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        responderErrorCategoriaAtributo(res, error, "eliminar asociacion categoria-atributo");
    }
};
