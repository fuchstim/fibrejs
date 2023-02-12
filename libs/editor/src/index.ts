import express from 'express';
import path from 'path';

import type Engine from '@tripwire/engine';

import createApiMiddleware from './api';

const HTML_PATH = path.resolve(__dirname, 'html');
const STATIC_FILES = [ 'main.js', 'main.css', ];

export default function createMiddleware(engine: Engine) {
  const app = express();

  app.use('/api', createApiMiddleware(engine));
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
