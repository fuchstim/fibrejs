import fs from 'fs';
import Engine, { BaseConfigProvider, TEngineConfig } from '@tripwire/engine';

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

(async () => {
  await engine.loadConfig();

  const result = await engine.executeRuleSet(
    'testRuleSet',
    {
      userId: { value: 'test', },
      age: { value: 49, },
    }
  );

  console.log({ result, });
})();
