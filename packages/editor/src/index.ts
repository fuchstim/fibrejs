export { AuthenticationProvider } from './authentication-provider';
export { TAuthenticatedUser } from './types';

import express, { Application, NextFunction, Response } from 'express';
import path from 'path';

import type Engine from '@fibrejs/engine';

import createApiMiddleware from './api';
import { AuthenticationProvider, AnonymousAuthenticationProvider } from './authentication-provider';
import { TConfig } from './types';

const HTML_PATH = path.resolve(__dirname, 'html');
const STATIC_FILES = [ 'main.js', 'main.css', ];

type TMiddlewareOptions = {
  engine: Engine,
  name: string,
  nameShort: string,
  apiPath?: string,
  authenticationProvider?: AuthenticationProvider
};
export default function createMiddleware(options: TMiddlewareOptions) {
  const app = express();

  app.use(
    '*',
    (_, res: Response, next: NextFunction) => { res.locals.config = getConfig(app, options); next(); }
  );

  const authenticationProvider = options.authenticationProvider ?? new AnonymousAuthenticationProvider();
  app.use(authenticationProvider.middleware);

  app.use(path.join('/', options.apiPath ?? 'api'), createApiMiddleware(options.engine));

  app.use(express.static(HTML_PATH));
  app.get('*', (req, res) => {
    const reqFilename = req.path.toLowerCase().split('/').pop() ?? '';
    if (STATIC_FILES.includes(reqFilename)) {
      res.sendFile(path.resolve(HTML_PATH, reqFilename));

      return;
    }

    if (reqFilename === 'config') {
      res.redirect(301, path.join(res.locals.config.apiBasePath, 'config'));
      res.end();

      return;
    }

    res.sendFile(path.resolve(HTML_PATH, 'index.html'));
  });

  return app;
}

function getConfig(app: Application, options: TMiddlewareOptions): TConfig {
  const basePath = Array.isArray(app.mountpath) ? app.mountpath[0] : app.mountpath;
  const apiPath = options.apiPath ?? 'api';

  return {
    name: options.name,
    nameShort: options.nameShort ?? options.name.slice(0, 1),
    basePath,
    apiBasePath: path.join(basePath, apiPath),
  };
}
