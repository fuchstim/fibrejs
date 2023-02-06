import fs from 'fs';
import Engine, { TEngineConfig } from '@tripwire/engine';

import GetUserNode from './nodes/get-user';
import EntryTestNode from './nodes/entry-test';

const engine = new Engine({
  customNodes: [
    new GetUserNode(),
    new EntryTestNode(),
  ],
});

const config = JSON.parse(
  fs.readFileSync('./example-config.json').toString()
) as TEngineConfig;
engine.loadConfig(config);

(async () => {
  await engine.executeRuleSet(
    config.ruleSets[0].id,
    { userId: { value: 'test', }, }
  );
})();
