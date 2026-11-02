export type ImagenProductoPayload = {
    URLImagen: string;
    EsPrincipal?: boolean;
    IDValorColor?: number | null;
};

export type VarianteProductoPayload = {
    IDProductoVariante?: number;
    SKU?: string;
    Precio?: number;
    Atributos: number[];
};

export type CrearProductoPayload = {
    IDGenero: number;
    IDCategoria: number;
    nombre: string;
    descripcion?: string | null;
    precioBase: number;
    imagenes?: ImagenProductoPayload[];
    variantes: VarianteProductoPayload[];
};

export type ActualizarProductoPayload = Omit<CrearProductoPayload, "variantes"> & {
    estado: boolean;
    variantes?: VarianteProductoPayload[];
};
