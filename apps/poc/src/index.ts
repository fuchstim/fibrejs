import fs from 'fs';
import express from 'express';

import Engine, { BaseConfigProvider, TEngineConfig } from '@tripwire/engine';
import createMiddleware from '@tripwire/editor';

import GetUserNode from './nodes/get-user';
import EntryTestNode from './nodes/entry-test';

class ConfigProvider extends BaseConfigProvider {
  getLatestConfigVersion() {
    return 1;
  }

  loadConfig(version: number) {
    const config = JSON.parse(
      fs.readFileSync('./example-config.json').toString()
    ) as TEngineConfig;

    return config;
  }

  saveConfig(config: TEngineConfig) {
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
  await engine.loadConfig();

  const hostname = 'localhost';
  const port = 3030;

  const app = express();
  app.use(await createMiddleware({ hostname, port, engine, }));
  app.listen(port, hostname);

  return app;
}

run();
