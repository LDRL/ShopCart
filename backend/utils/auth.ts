import bcrypt from "bcrypt";

export const hashPassword = async (contraseña: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    return hashedPassword;
};

export const checkPassword = async (contraseña: string, contraseñaEncriptada: string): Promise<boolean> => {
    return await bcrypt.compare(contraseña, contraseñaEncriptada)
}

