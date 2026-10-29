
"use strict";

import type { CorsOptions } from "cors";

const corsConfig: CorsOptions = {
    origin: (origin, callback): void => {
        const whitelist: (string | undefined)[] = [
            process.env.FRONTEND_URL,
        ];

        // Permitir solicitudes sin Origin cuando se ejecuta con --api.
        if (process.argv.includes("--api")) {
            whitelist.push(undefined);
        }

        if (whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Error de CORS"));
        }
    },
};

export { corsConfig };
