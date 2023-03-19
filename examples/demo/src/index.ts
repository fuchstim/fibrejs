import express from 'express';

import Engine from '@fibrejs/engine';
import createMiddleware from '@fibrejs/editor';
import Logger from '@fibrejs/logger';

import configProvider from './_config-provider';

const app = express();
const logger = new Logger().ns('demo-api');

const engine = new Engine({ configProvider, });

app.use(
  createMiddleware({
    engine,
    name: 'demo_',
    nameShort: 'd_',
    apiPath: '/api',
  })
);

app.listen(3030, () => {
  logger.warn('Listening on port', 3030);
});
