import 'dotenv/config';
import sql from 'mssql';
import bcrypt from "bcrypt";

type ValorSeed = string | number | boolean;
type FilaSeed = Record<string, ValorSeed>;

type CatalogoSeed = {
    tabla: string;
    clave: string[];
    identidad: boolean;
    filas: FilaSeed[];
};

const catalogos: CatalogoSeed[] = [
    {
        tabla: 'Roles',
        clave: ['nombre'],
        identidad: true,
        filas: [
            { IDRol: 1, nombre: 'Administrador' },
            { IDRol: 2, nombre: 'Operador' },
            { IDRol: 3, nombre: 'Cliente' },
        ],
    },
    {
        tabla: 'Generos',
        clave: ['nombre'],
        identidad: true,
        filas: [
            { IDGenero: 1, nombre: 'Hombres', estado: true },
            { IDGenero: 2, nombre: 'Mujeres', estado: true },
            { IDGenero: 3, nombre: 'Niños', estado: true },
        ],
    },
    {
        tabla: 'Categorias',
        clave: ['nombre'],
        identidad: true,
        filas: [
            { IDCategoria: 1, nombre: 'Abrigos', estado: false },
            { IDCategoria: 2, nombre: 'Camisetas', estado: true },
            { IDCategoria: 3, nombre: 'Chaquetas', estado: true },
            { IDCategoria: 4, nombre: 'Sudaderas', estado: true },
            { IDCategoria: 5, nombre: 'Pantalones', estado: true },
            { IDCategoria: 6, nombre: 'Pantalones cortos', estado: true },
            { IDCategoria: 7, nombre: 'Chaquetas impermeables', estado: true },
            { IDCategoria: 8, nombre: 'Camisetas manga larga', estado: true },
            { IDCategoria: 9, nombre: 'Zapatos deportivos', estado: true },
            { IDCategoria: 10, nombre: 'Zapatos para senderismo', estado: true },
        ],
    },
    {
        tabla: 'Atributos',
        clave: ['nombre'],
        identidad: true,
        filas: [
            { IDAtributo: 1, nombre: 'Color', estado: true, rol: 'COLOR' },
            { IDAtributo: 2, nombre: 'Talla Ropa', estado: true, rol: 'TALLA' },
            { IDAtributo: 3, nombre: 'Talla Calzado', estado: true, rol: 'TALLA' },
            { IDAtributo: 4, nombre: 'Material', estado: true, rol: 'GENERICO' },
        ],
    },
    {
        tabla: 'ValoresAtributos',
        clave: ['IDAtributo', 'valor'],
        identidad: true,
        filas: [
            { IDValorAtributo: 1, IDAtributo: 1, valor: 'Azul' },
            { IDValorAtributo: 2, IDAtributo: 1, valor: 'Negro' },
            { IDValorAtributo: 3, IDAtributo: 1, valor: 'Gris' },
            { IDValorAtributo: 4, IDAtributo: 1, valor: 'Blanco' },
            { IDValorAtributo: 5, IDAtributo: 1, valor: 'Rojo' },
            { IDValorAtributo: 6, IDAtributo: 1, valor: 'Verde' },
            { IDValorAtributo: 7, IDAtributo: 2, valor: 'XXS' },
            { IDValorAtributo: 8, IDAtributo: 2, valor: 'XS' },
            { IDValorAtributo: 9, IDAtributo: 2, valor: 'S' },
            { IDValorAtributo: 10, IDAtributo: 2, valor: 'M' },
            { IDValorAtributo: 11, IDAtributo: 2, valor: 'L' },
            { IDValorAtributo: 12, IDAtributo: 2, valor: 'XL' },
            { IDValorAtributo: 13, IDAtributo: 2, valor: 'XXL' },
            { IDValorAtributo: 14, IDAtributo: 3, valor: '6' },
            { IDValorAtributo: 15, IDAtributo: 3, valor: '7' },
            { IDValorAtributo: 16, IDAtributo: 3, valor: '8' },
            { IDValorAtributo: 17, IDAtributo: 3, valor: '9' },
            { IDValorAtributo: 18, IDAtributo: 3, valor: '10' },
            { IDValorAtributo: 19, IDAtributo: 3, valor: '11' },
            { IDValorAtributo: 20, IDAtributo: 3, valor: '12' },
        ],
    },
    {
        tabla: 'CategoriasAtributos',
        clave: ['IDCategoria', 'IDAtributo'],
        identidad: true,
        filas: [
            { IDCategoriaAtributo: 1, IDCategoria: 2, IDAtributo: 1, obligatorio: true },
            { IDCategoriaAtributo: 2, IDCategoria: 3, IDAtributo: 1, obligatorio: true },
            { IDCategoriaAtributo: 3, IDCategoria: 4, IDAtributo: 1, obligatorio: true },
            { IDCategoriaAtributo: 4, IDCategoria: 5, IDAtributo: 1, obligatorio: true },
            { IDCategoriaAtributo: 5, IDCategoria: 6, IDAtributo: 1, obligatorio: true },
            { IDCategoriaAtributo: 6, IDCategoria: 7, IDAtributo: 1, obligatorio: true },
            { IDCategoriaAtributo: 7, IDCategoria: 8, IDAtributo: 1, obligatorio: true },
            { IDCategoriaAtributo: 8, IDCategoria: 2, IDAtributo: 2, obligatorio: true },
            { IDCategoriaAtributo: 9, IDCategoria: 3, IDAtributo: 2, obligatorio: true },
            { IDCategoriaAtributo: 10, IDCategoria: 4, IDAtributo: 2, obligatorio: true },
            { IDCategoriaAtributo: 11, IDCategoria: 5, IDAtributo: 2, obligatorio: true },
            { IDCategoriaAtributo: 12, IDCategoria: 6, IDAtributo: 2, obligatorio: true },
            { IDCategoriaAtributo: 13, IDCategoria: 7, IDAtributo: 2, obligatorio: true },
            { IDCategoriaAtributo: 14, IDCategoria: 8, IDAtributo: 2, obligatorio: true },
            { IDCategoriaAtributo: 15, IDCategoria: 9, IDAtributo: 1, obligatorio: true },
            { IDCategoriaAtributo: 16, IDCategoria: 10, IDAtributo: 1, obligatorio: true },
            { IDCategoriaAtributo: 17, IDCategoria: 9, IDAtributo: 3, obligatorio: true },
            { IDCategoriaAtributo: 18, IDCategoria: 10, IDAtributo: 3, obligatorio: true },
        ],
    },
    {
        tabla: 'PedidosEstados',
        clave: ['nombre'],
        identidad: true,
        filas: [
            { IDEstadoPedido: 1, nombre: 'PendientePago', descripcion: 'Pedido esperando confirmacion del pago', estado: true },
            { IDEstadoPedido: 2, nombre: 'Confirmado', descripcion: 'Pedido con pago confirmado', estado: true },
            { IDEstadoPedido: 3, nombre: 'Preparando', descripcion: 'Pedido en preparacion', estado: true },
            { IDEstadoPedido: 4, nombre: 'Despachado', descripcion: 'Pedido enviado al cliente', estado: true },
            { IDEstadoPedido: 5, nombre: 'Entregado', descripcion: 'Pedido recibido por el cliente', estado: true },
            { IDEstadoPedido: 6, nombre: 'Cancelado', descripcion: 'Pedido cancelado', estado: true },
            { IDEstadoPedido: 7, nombre: 'DevueltoParcial', descripcion: 'Pedido con devolucion parcial', estado: true },
            { IDEstadoPedido: 8, nombre: 'DevueltoTotal', descripcion: 'Pedido con devolucion total', estado: true },
        ],
    },
    {
        tabla: 'PedidosTransiciones',
        clave: ['IDEstadoOrigen', 'IDEstadoDestino'],
        identidad: false,
        filas: [
            { IDEstadoOrigen: 1, IDEstadoDestino: 2 },
            { IDEstadoOrigen: 1, IDEstadoDestino: 6 },
            { IDEstadoOrigen: 2, IDEstadoDestino: 3 },
            { IDEstadoOrigen: 2, IDEstadoDestino: 6 },
            { IDEstadoOrigen: 3, IDEstadoDestino: 4 },
            { IDEstadoOrigen: 3, IDEstadoDestino: 6 },
            { IDEstadoOrigen: 4, IDEstadoDestino: 5 },
            { IDEstadoOrigen: 5, IDEstadoDestino: 7 },
            { IDEstadoOrigen: 5, IDEstadoDestino: 8 },
            { IDEstadoOrigen: 7, IDEstadoDestino: 8 },
        ],
    },
    {
        tabla: 'InventariosTiposMovimientos',
        clave: ['nombre'],
        identidad: true,
        filas: [
            { IDTipoMovimiento: 1, nombre: 'Entrada por compra', naturaleza: 'E', estado: true },
            { IDTipoMovimiento: 2, nombre: 'Salida por venta', naturaleza: 'S', estado: true },
            { IDTipoMovimiento: 3, nombre: 'Ajuste positivo', naturaleza: 'E', estado: true },
            { IDTipoMovimiento: 4, nombre: 'Ajuste negativo', naturaleza: 'S', estado: true },
            { IDTipoMovimiento: 5, nombre: 'Devolución de cliente', naturaleza: 'E', estado: true },
            { IDTipoMovimiento: 6, nombre: 'Devolución a proveedor', naturaleza: 'S', estado: true },
        ],
    },
];

const insertarCatalogo = async (
    pool: sql.ConnectionPool,
    { tabla, clave, identidad, filas }: CatalogoSeed
): Promise<number> => {
    let insertadas = 0;

    for (const fila of filas) {
        const columnas = Object.keys(fila);
        const request = pool.request();

        columnas.forEach((columna, indice) => {
            request.input(`v${indice}`, fila[columna]);
        });

        const condicion = clave
            .map((columna) => `[${columna}] = @v${columnas.indexOf(columna)}`)
            .join(' AND ');

        const listaColumnas = columnas.map((columna) => `[${columna}]`).join(', ');
        const listaValores = columnas.map((_, indice) => `@v${indice}`).join(', ');

        const encenderIdentidad = identidad
            ? `SET IDENTITY_INSERT dbo.[${tabla}] ON;`
            : '';
        const apagarIdentidad = identidad
            ? `SET IDENTITY_INSERT dbo.[${tabla}] OFF;`
            : '';

        const resultado = await request.query(`
            IF NOT EXISTS (
                SELECT 1 FROM dbo.[${tabla}] WHERE ${condicion}
            )
            BEGIN
                ${encenderIdentidad}
                INSERT INTO dbo.[${tabla}] (${listaColumnas})
                VALUES (${listaValores});
                ${apagarIdentidad}
                SELECT 1 AS insertado;
            END
        `);

        if ((resultado.recordset?.length ?? 0) > 0) {
            insertadas += 1;
        }
    }

    console.log(`${tabla}: ${insertadas} registro(s) nuevo(s).`);
    return insertadas;
};

async function seed() {
    let pool: sql.ConnectionPool | undefined;

    try {
        pool = await sql.connect({
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            server: process.env.SQL_HOST || "localhost",
            database: process.env.SQL_DATABASE,
            port: Number(process.env.SQL_PORT || 1433),
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        });

        for (const catalogo of catalogos) {
            await insertarCatalogo(pool, catalogo);
        }

        const correo = 'admin@sistema.com';
        const password = 'Pass1234';

        if (!correo || !password) {
            throw new Error(
                'Faltan las variables del administrador inicial.'
            );
        }

        const existente = await pool
            .request()
            .input('correo', sql.VarChar(100), correo)
            .query(`
                SELECT TOP 1 IDUsuario
                FROM dbo.Usuarios
                WHERE correo = @correo;
            `);

        if (existente.recordset.length > 0) {
            console.log('El administrador ya existe.');
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const resultado = await pool
            .request()
            .input(
                'P_NOMBRE',
                sql.VarChar(80),
                'Administrador'
            )
            .input(
                'P_APELLIDO',
                sql.VarChar(80),
                'del sistema'
            )
            .input(
                'P_CORREO',
                sql.VarChar(100),
                correo
            )
            .input(
                'P_PASSWORD',
                sql.VarChar(255),
                passwordHash
            )
            .input(
                'P_ID_ROL',
                sql.Int,
                1
            )
            .execute('dbo.SP_Usuarios_CrearUsuario');

        console.log(
            'Seed ejecutado:',
            resultado.recordset[0]
        );

    } catch (error) {
        console.error('Error ejecutando seed:', error);
        process.exitCode = 1;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

seed();
