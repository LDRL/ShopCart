import { body } from "express-validator";

const reglaNombre = () =>
    body("nombre")
        .isString()
        .withMessage("El nombre debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("El nombre no puede estar vacío")
        .isLength({ max: 50 })
        .withMessage("El nombre no puede exceder los 50 caracteres");

const reglaApellido = () =>
    body("apellido")
        .isString()
        .withMessage("El apellido debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("El apellido no puede estar vacío")
        .isLength({ max: 50 })
        .withMessage("El apellido no puede exceder los 50 caracteres");

const reglaEmail = () =>
    body("email")
        .isString()
        .withMessage("El correo debe ser una cadena de texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("El correo no puede estar vacío")
        .isEmail()
        .withMessage("Email no válido")
        .isLength({ max: 150 })
        .withMessage("El correo no puede exceder los 150 caracteres");

const reglaContrasena = () =>
    body("contraseña")
        .isString()
        .withMessage("La contraseña debe ser una cadena de texto")
        .bail()
        .isLength({ min: 8 })
        .withMessage(
            "La contraseña es muy corta, debe contener 8 caracteres minimo"
        );

const reglaRol = () =>
    body("id_rol")
        .isInt({ min: 1 })
        .withMessage("El rol es inválido")
        .toInt();

export const validarUsuario = [
    reglaNombre(),
    reglaApellido(),
    reglaEmail(),
    reglaContrasena(),
    reglaRol(),
];

export const validarUsuarioActualizacion = [
    reglaNombre(),
    reglaApellido(),
    reglaEmail(),
    reglaRol(),
];
