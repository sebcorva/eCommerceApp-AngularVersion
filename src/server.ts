import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// Configuración obligatoria para que Express entienda el proxy de Nginx
app.set('trust proxy', true);

// ============================================================
// 🔥 ACTUALIZACIÓN DE SEGURIDAD PARA ANGULAR 19+ SSR
// ============================================================
const angularApp = new AngularNodeAppEngine({
  // 1. Permite que el motor procese las cabeceras x-forwarded-for y x-forwarded-proto de Nginx
  trustProxyHeaders: true,

  // 2. Registra explícitamente los hosts seguros para mitigar el bloqueo SSRF
  allowedHosts: ['localhost', 'angular-app', '127.0.0.1']
});
app.use('/api', (req, res) => {
  res.redirect(307, `http://api-server:3000${req.url}`);
});
/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);