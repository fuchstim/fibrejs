import express from 'express';
import path from 'path';

import type Engine from '@tripwire/engine';

export default function createMiddleware(engine: Engine) {
  const app = express();

  const htmlPath = path.resolve(__dirname, 'html');

  app.use(express.static(htmlPath));

  app.get(
    '/api/test',
    (req, res, next) => res.json(engine.exportSerializedNodes())
  );

  return app;
}
