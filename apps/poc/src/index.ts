import fs from 'fs';
import express from 'express';

import Engine, { BaseStorageProvider, Types } from '@tripwire/engine';
import createMiddleware from '@tripwire/editor';

import GetUserNode from './nodes/get-user';
import EntryTestNode from './nodes/entry-test';

class StorageProvider extends BaseStorageProvider {
  getLatestConfigVersion() {
    return 1;
  }

  loadConfig(version: number) {
    const config = JSON.parse(
      fs.readFileSync('./example-config.json').toString()
    ) as Types.Config.TEngineConfig;

    return config;
  }

  saveConfig(config: Types.Config.TEngineConfig) {
    fs.writeFileSync(
      './example-config.json',
      JSON.stringify(config)
    );

    return;
  }
}

const engine = new Engine({
  storageProvider: new StorageProvider(),
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
      await engine.exportSerializedNodes()
    )
  );

  const hostname = 'localhost';
  const port = 3030;

  const app = express();
  app.use(createMiddleware(engine));
  app.listen(
    port,
    hostname,
    () => console.log(`Server listening on http://${hostname}:${port}`)
  );

  return app;
}

run();
