"use strict";

import { Router } from "express";
import { body } from "express-validator";

import { handleInputErrors } from "../middleware/validacion.js";
import { login, resetPassword, user } from "../controllers/auth.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post('/login', 
    body('email').isEmail().withMessage('Email no válido'),
    body('contraseña').notEmpty().withMessage('La contraseña no puede ir vacia'),
    handleInputErrors,
    login)


router.put('/reset-password/:id',
    body('contraseña').isLength({min:8}).withMessage('La contraseña es muy corta, debe contener 8 caracteres minimo'),
    body("confirmar_contraseña").custom((value: unknown, { req }) => {
        if (value !== req.body.contraseña) {
            throw new Error("Las contraseñas no son iguales");
        }
        return true
    }),
    handleInputErrors,
    resetPassword
)

router.get('/user',
    authenticate,
    user
)
export default router;