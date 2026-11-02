import { body } from "express-validator";

const validarImagenes = (campo: string) => [
    body(campo)
        .optional()
        .isArray()
        .withMessage(`${campo} debe ser un arreglo`),
    body(`${campo}.*.URLImagen`)
        .isString()
        .trim()
        .notEmpty()
        .withMessage("La URL de la imagen es requerida")
        .isLength({ max: 500 })
        .withMessage("La URL de la imagen no puede exceder 500 caracteres"),
    body(`${campo}.*.EsPrincipal`)
        .optional()
        .isBoolean()
        .withMessage("EsPrincipal debe ser booleano")
        .toBoolean(),
    body(`${campo}.*.IDValorColor`)
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("IDValorColor debe ser un entero positivo")
        .toInt(),
];

const validarVariantes = (obligatorias: boolean) => [
    obligatorias
        ? body("variantes")
              .isArray({ min: 1 })
              .withMessage("variantes debe tener al menos una variante")
        : body("variantes")
              .optional()
              .isArray()
              .withMessage("variantes debe ser un arreglo"),
    body("variantes.*.IDProductoVariante")
        .optional()
        .isInt({ min: 1 })
        .withMessage("IDProductoVariante debe ser un entero positivo")
        .toInt(),
    body("variantes.*.SKU")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({ max: 100 })
        .withMessage("SKU no puede exceder 100 caracteres"),
    body("variantes.*.Precio")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("Precio debe ser un numero mayor o igual a 0")
        .toFloat(),
    body("variantes.*.Atributos")
        .isArray({ min: 1 })
        .withMessage("Atributos debe tener al menos un valor de atributo"),
    body("variantes.*.Atributos.*")
        .isInt({ min: 1 })
        .withMessage("Cada atributo debe ser un entero positivo")
        .toInt(),
];

export const validarCrearProducto = [
    body("IDGenero")
        .isInt({ min: 1 })
        .withMessage("IDGenero debe ser un entero positivo")
        .toInt(),
    body("IDCategoria")
        .isInt({ min: 1 })
        .withMessage("IDCategoria debe ser un entero positivo")
        .toInt(),
    body("nombre")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("nombre es requerido")
        .isLength({ max: 150 })
        .withMessage("nombre no puede exceder 150 caracteres"),
    body("descripcion")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage("descripcion no puede exceder 500 caracteres"),
    body("precioBase")
        .isFloat({ min: 0 })
        .withMessage("precioBase debe ser un numero mayor o igual a 0")
        .toFloat(),
    ...validarVariantes(true),
    ...validarImagenes("imagenes"),
];

export const validarActualizarProducto = [
    body("IDGenero")
        .isInt({ min: 1 })
        .withMessage("IDGenero debe ser un entero positivo")
        .toInt(),
    body("IDCategoria")
        .isInt({ min: 1 })
        .withMessage("IDCategoria debe ser un entero positivo")
        .toInt(),
    body("nombre")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("nombre es requerido")
        .isLength({ max: 150 })
        .withMessage("nombre no puede exceder 150 caracteres"),
    body("descripcion")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage("descripcion no puede exceder 500 caracteres"),
    body("precioBase")
        .isFloat({ min: 0 })
        .withMessage("precioBase debe ser un numero mayor o igual a 0")
        .toFloat(),
    body("estado")
        .isBoolean()
        .withMessage("estado debe ser booleano")
        .toBoolean(),
    ...validarVariantes(false),
    ...validarImagenes("imagenes"),
];
