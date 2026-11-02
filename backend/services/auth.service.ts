import { buscarUsuarioPorCorreo, actualizarPassword, } from "../repositories/auth.repository.js";
import { checkPassword, hashPassword, } from "../utils/auth.js";
import { generateJWT } from "../utils/jwt.js";

export const iniciarSesion = async ( correo: string, contraseña: string
) => {
    const usuario = await buscarUsuarioPorCorreo( correo.trim() );

    if (!usuario) {
        throw new Error("CREDENCIALES_INVALIDAS");
    }
    

    const contraseñaCorrecta = await checkPassword(
        contraseña,
        usuario.contraseña
    );

    if (!contraseñaCorrecta) {
        throw new Error("CREDENCIALES_INVALIDAS");
    }

    console.log(usuario);
    const token = generateJWT(
        usuario.IDUsuario,
        usuario.nombre,
        usuario.correo
    );

    return { token };
};

export const cambiarPassword = async ( IDUsuario: number, contraseña: string ): Promise<void> => {
    const passwordHash = await hashPassword(contraseña);
    await actualizarPassword(IDUsuario, passwordHash);
};
