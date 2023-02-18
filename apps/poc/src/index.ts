import fs from 'fs';
import express from 'express';
import path from 'path';

import Engine, { ConfigProvider as BaseConfigProvider, Types } from '@fibre/engine';
import createMiddleware from '@fibre/editor';

import GetUserNode from './nodes/get-user';
import EntryTestNode from './nodes/entry-test';

class ConfigProvider extends BaseConfigProvider {
  getLatestRevision() {
    return fs.readdirSync(path.resolve('config'))
      .filter(filename => filename.endsWith('.json'))
      .map(filename => Number(filename.replace('.json', '')))
      .sort((a, b) => a - b)
      .pop() ?? 1;
  }

  load(revision: number) {
    const config = JSON.parse(
      fs.readFileSync(path.resolve('config', `${revision}.json`)).toString()
    ) as Types.Config.TEngineConfig;

    return config;
  }

  save(config: Types.Config.TEngineConfig) {
    fs.writeFileSync(
      path.resolve('config', `${config.revision}.json`),
      JSON.stringify(config, null, 2)
    );

    return;
  }
}

const engine = new Engine({
  configProvider: new ConfigProvider(),
  customNodes: [
    new GetUserNode(),
    new EntryTestNode(),
  ],
});

async function run() {
  await engine.init();

  const hostname = 'localhost';
  const port = 3030;

  const app = express();
  app.use(express.json());
  app.post(
    '/run/:type/:id',
    async (req, res) => {
      const { id, type, } = req.params;
      const inputs = req.body;
      if (!id || !type || !inputs) {
        res.status(400);
        res.json({ error: 'Invalid inputs', });
      }

      try {
        switch (type) {
          case 'rule': res.json(await engine.executeRule(id, inputs)); break;
          case 'rule-set': res.json(await engine.executeRuleSet(id, inputs)); break;
          default:
            res.status(400);
            res.json({ message: `Invalid type: ${type}`, });
        }
      } catch (e: unknown) {
        res.status(500);

        const error = e as Error;

        res.json({
          message: error.message,
          stack: error.stack,
        });
      }
    }
  );

  app.use(createMiddleware({ engine, }));
  app.listen(
    port,
    hostname,
    () => console.log(`Server listening on http://${hostname}:${port}`)
  );

  return app;
}

run();
