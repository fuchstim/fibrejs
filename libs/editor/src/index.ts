import next from 'next';
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';

import type Engine from '@tripwire/engine';

import requestContext from './common/request-context';

type TCreateMiddlewareOptions = {
  hostname: string,
  port: number,
  engine: Engine,
};

export default async function createMiddleware({ engine, hostname, port, }: TCreateMiddlewareOptions) {
  const nextApp = next({
    dir: path.resolve(__dirname),
    dev: process.env.NODE_ENV !== 'production',
    hostname,
    port,
  });

  await nextApp.prepare();

  const handler = nextApp.getRequestHandler();

  const middleware = express();

  middleware.use(
    (req: Request, _: Response, next: NextFunction) => {
      requestContext.attach(req, { engine, });

      next();
    }
  );

  middleware.get('*', (req, res) => handler(req, res));
  middleware.post('/api/*', (req, res) => handler(req, res));

  return middleware;
}

