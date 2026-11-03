import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import { obtenerNumeroErrorSql } from "../utils/sqlErrors.js";
import { obtenerPaginacion, responderPaginacionError } from "../utils/paginacion.js";
import {
    obtenerValoresAtributoService,
    obtenerValorAtributoPorIdService,
    crearValorAtributoService,
    actualizarValorAtributoService,
    eliminarValorAtributoService,
} from "../services/valorAtributo.service.js";

const ERRORES_NO_ENCONTRADOS = new Set([50411, 50414]);
const ERRORES_CONFLICTO = new Set([50413, 50415, 50416, 50417]);

const responderErrorValorAtributo = ( res: Response, error: unknown, contexto: string ): void => {
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
    res.status(500).json({ msg: "Hubo un error al procesar el valor de atributo" });
};

const esIdValido = (id: number): boolean => Number.isSafeInteger(id) && id > 0;

export const validarValorAtributo = [
    body("IDAtributo")
        .isInt({ min: 1 })
        .withMessage("IDAtributo debe ser un entero positivo")
        .toInt(),
    body("valor")
        .isString()
        .withMessage("valor debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("valor es requerido")
        .isLength({ max: 100 })
        .withMessage("valor no puede exceder 100 caracteres"),
];

export const getValoresAtributo = async (req: Request, res: Response): Promise<void> => {
    const IDAtributoRaw = req.query.IDAtributo ?? req.query.idAtributo;
    const IDAtributo =
        IDAtributoRaw === undefined ? null : Number(IDAtributoRaw);

    if (IDAtributo !== null && !esIdValido(IDAtributo)) {
        res.status(400).json({ msg: "El ID del atributo es invalido" });
        return;
    }

    try {
        const { pagina, registrosPorPagina } = obtenerPaginacion(req);
        const result = await obtenerValoresAtributoService(IDAtributo, {
            pagina,
            registrosPorPagina,
        });
        res.status(200).json({
            msg: "Valores de atributo obtenidos con exito",
            ...result,
        });
    } catch (error: unknown) {
        try {
            responderPaginacionError(res, error);
            return;
        } catch {
            // no es error de paginacion
        }
        console.error(
            "Error al listar valores de atributo:",
            error instanceof Error ? error.message : error
        );
        res.status(500).json({ msg: "Hubo un error al obtener los valores de atributo" });
    }
};

export const getValorAtributo = async (req: Request, res: Response): Promise<void> => {
    const IDValorAtributo = Number(req.params.id);

    if (!esIdValido(IDValorAtributo)) {
        res.status(400).json({ msg: "El ID del valor de atributo es invalido" });
        return;
    }

    try {
        const valor = await obtenerValorAtributoPorIdService(IDValorAtributo);
        res.status(200).json({
            msg: "Valor de atributo obtenido con exito",
            data: valor,
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "VALOR_ATRIBUTO_NO_ENCONTRADO") {
            res.status(404).json({ msg: "Valor de atributo no encontrado" });
            return;
        }

        console.error(
            "Error al obtener valor de atributo:",
            error instanceof Error ? error.message : error
        );
        res.status(500).json({ msg: "Hubo un error al obtener el valor de atributo" });
    }
};

export const postValorAtributo = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const { IDAtributo, valor } = req.body as {
        IDAtributo: number;
        valor: string;
    };

    try {
        const data = await crearValorAtributoService(Number(IDAtributo), valor);
        res.status(201).json({
            msg: "Valor de atributo creado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorValorAtributo(res, error, "crear valor de atributo");
    }
};

export const putValorAtributo = async (req: Request, res: Response): Promise<void> => {
    const IDValorAtributo = Number(req.params.id);

    if (!esIdValido(IDValorAtributo)) {
        res.status(400).json({ msg: "El ID del valor de atributo es invalido" });
        return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ msg: "Datos invalidos", errors: errors.array() });
        return;
    }

    const { IDAtributo, valor } = req.body as {
        IDAtributo: number;
        valor: string;
    };

    try {
        const data = await actualizarValorAtributoService(
            IDValorAtributo,
            Number(IDAtributo),
            valor
        );
        res.status(200).json({
            msg: "Valor de atributo actualizado correctamente",
            data,
        });
    } catch (error: unknown) {
        responderErrorValorAtributo(res, error, "actualizar valor de atributo");
    }
};

export const deleteValorAtributo = async (req: Request, res: Response): Promise<void> => {
    const IDValorAtributo = Number(req.params.id);

    if (!esIdValido(IDValorAtributo)) {
        res.status(400).json({ msg: "El ID del valor de atributo es invalido" });
        return;
    }

    try {
        const data = await eliminarValorAtributoService(IDValorAtributo);
        res.status(200).json({
            msg: "Valor de atributo eliminado correctamente",
            data: data ?? null,
        });
    } catch (error: unknown) {
        responderErrorValorAtributo(res, error, "eliminar valor de atributo");
    }
};


