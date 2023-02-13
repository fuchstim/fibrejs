export { AuthenticationProvider } from './authentication-provider';

import express from 'express';
import path from 'path';

import type Engine from '@tripwire/engine';

import createApiMiddleware from './api';
import { AuthenticationProvider, AnonymousAuthenticationProvider } from './authentication-provider';

const HTML_PATH = path.resolve(__dirname, 'html');
const STATIC_FILES = [ 'main.js', 'main.css', ];

type TMiddlewareOptions = {
  engine: Engine,
  authenticationProvider?: AuthenticationProvider
};
export default function createMiddleware(options: TMiddlewareOptions) {
  const app = express();

  const authenticationProvider = options.authenticationProvider ?? new AnonymousAuthenticationProvider();
  app.use(authenticationProvider.middleware);

  app.use('/api', createApiMiddleware(options.engine));

  app.use(express.static(HTML_PATH));
  app.get('*', (req, res) => {
    const reqFilename = req.path.toLowerCase().split('/').pop() ?? '';
    if (STATIC_FILES.includes(reqFilename)) {
      res.sendFile(path.resolve(HTML_PATH, reqFilename));

      return;
    }

    if (reqFilename === 'base-path') {
      res.json({ basePath: app.mountpath, });

      return;
    }

    res.sendFile(path.resolve(HTML_PATH, 'index.html'));
  });

  return app;
}
