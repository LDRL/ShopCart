import jwt from "jsonwebtoken";

export const generateJWT = (id: number, nombre: string, mail: string): string =>{

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET no está configurado");
    }

    const data = {
        id: id,
        nombre: nombre,
        mail: mail
        
    }
    const token = jwt.sign(data, secret, {
        expiresIn: '24h'
    })

    return token

}

