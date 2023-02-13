import express, { NextFunction, Response } from 'express';

import type Engine from '@tripwire/engine';

import NodesService from './services/nodes';
import PreviewRuleService from './services/preview-rule';
import RulesService from './services/rules';
import RuleSetsService from './services/rulesets';

import { registerService } from './common';

export default function createApiMiddleware(engine: Engine) {
  const app = express();

  app.use(express.json());
  app.use((_, res: Response, next: NextFunction) => {
    res.set('Access-Control-Allow-Origin', '*');

    next();
  });

  registerService(app, '/nodes', new NodesService(engine));
  registerService(app, '/preview-rule', new PreviewRuleService(engine));
  registerService(app, '/rules', new RulesService(engine));
  registerService(app, '/rule-sets', new RuleSetsService(engine));

  app.get('/user', (_, res) => res.json(res.locals.user));

  app.get(
    '*',
    (_, res) => {
      res.status(400);
      res.json({ error: 'Unknown endpoint', });
    }
  );

  return app;
}
