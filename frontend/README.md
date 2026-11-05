# ShopCart — Frontend

React 19 + Vite + TypeScript. Estado global con Redux Toolkit, datos remotos con
TanStack Query, HTTP con Axios y componentes visuales con Material UI.

## Requisitos

- Node 26.6+
- Backend de ShopCart corriendo en `http://localhost:8080`

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck (`tsc -b`) + build de producción |
| `npm run lint` | ESLint |



## Variables de entorno

| Variable | La usa | Para qué |
|---|---|---|
| `VITE_API_URL` | `src/api/axiosClient.ts` | Base URL de Axios. En desarrollo `/api` (relativa, pasa por el proxy). |
| `VITE_PROXY_TARGET` | `vite.config.ts` | Origen del backend al que el proxy reenvía `/api` y `/uploads`. Solo existe en dev. |

`VITE_PROXY_TARGET` **no** llega al bundle del navegador: Vite solo expone las
variables `VITE_*` a `import.meta.env` cuando el código las referencia, y el
proxy se resuelve en el servidor de desarrollo.

Si `VITE_API_URL` queda vacío o sin definir, el cliente usa `/api` por defecto.

## Sesión

- El `access_token` vive **solo en memoria** (Redux). Nunca se persiste en
  `localStorage`.
- El `refresh_token` viaja en una cookie `HttpOnly` que el JavaScript no puede
  leer: por eso el cliente Axios usa `withCredentials: true`.
- El refresh silencioso se ejecuta **solo al entrar a una ruta protegida**
  (`AuthGuard`). Un invitado que navega `/tienda` o el login nunca dispara
  `POST /auth/refresh`.
- Ante un `401`, el interceptor renueva el token una vez y reintenta la petición
  original. Si el refresh falla, se limpia la sesión y se redirige al login.

## Rutas

| Ruta | Acceso |
|---|---|
| `/login` | Pública |
| `/tienda` | Pública (menú de géneros + categorías) |
| `/dashboard/*` | Protegida por `AuthGuard` |

La raíz `/` redirige a `/dashboard`; el guard decide si muestra el panel o el
login.



## Producción

El build usa `VITE_API_URL=/api`, así que se espera que el servidor que sirve el
frontend proxyee `/api` hacia el backend. Si se despliega en otro origen, definir
`VITE_API_URL` con la URL absoluta y habilitar `FRONTEND_URL` + cookies
`SameSite=None; Secure` en el backend.
