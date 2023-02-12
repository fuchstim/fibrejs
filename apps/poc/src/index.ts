import fs from 'fs';
import express from 'express';

import Engine, { ConfigProvider as BaseConfigProvider, Types } from '@tripwire/engine';
import createMiddleware from '@tripwire/editor';

import GetUserNode from './nodes/get-user';
import EntryTestNode from './nodes/entry-test';

class ConfigProvider extends BaseConfigProvider {
  getLatestRevision() {
    return 1;
  }

  load(revision: number) {
    const config = JSON.parse(
      fs.readFileSync('./example-config.json').toString()
    ) as Types.Config.TEngineConfig;

    return config;
  }

  save(config: Types.Config.TEngineConfig) {
    fs.writeFileSync(
      './example-config.json',
      JSON.stringify(config)
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

  fs.writeFileSync(
    'nodes.json',
    JSON.stringify(
      await engine.exportSerializedNodes(),
      null,
      2
    )
  );

  const hostname = 'localhost';
  const port = 3030;

  const app = express();
  app.use(express.json());
  app.post(
    '/run',
    async (req, res) => {
      const inputs = req.body;
      if (!inputs) {
        res.status(400);
        res.json({ error: 'Invalid inputs', });
      }

      try {
        const result = await engine.executeRuleSet(
          'testRuleSet',
          inputs
        );

        res.json(result);
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
  app.use(createMiddleware(engine));
  app.listen(
    port,
    hostname,
    () => console.log(`Server listening on http://${hostname}:${port}`)
  );

  return app;
}

run();
