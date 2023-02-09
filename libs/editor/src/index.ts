import express from 'express';
import path from 'path';

import type Engine from '@tripwire/engine';

import createApiMiddleware from './api';

export default function createMiddleware(engine: Engine) {
  const app = express();

  app.use('/api', createApiMiddleware(engine));

  const htmlPath = path.resolve(__dirname, 'html');
  app.use(express.static(htmlPath));
  app.get('*', (_, res) => res.sendFile(path.resolve(htmlPath, 'index.html')));

  return app;
}
