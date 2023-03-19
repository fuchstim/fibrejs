
import fs from 'fs';
import path from 'path';

import { ConfigProvider, Types } from '@fibrejs/engine';

class CustomConfigProvider extends ConfigProvider {
  getLatestRevision(): number {
    return fs.readdirSync(path.resolve('config'))
      .filter(filename => filename.endsWith('.json'))
      .map(filename => Number(filename.replace('.json', '')))
      .sort((a, b) => a - b)
      .pop() ?? 1;
  }

  load(revision: number): Types.Config.TEngineConfig {
    const config = JSON.parse(
      fs.readFileSync(path.resolve('config', `${revision}.json`)).toString()
    ) as Types.Config.TEngineConfig;

    return config;
  }

  save(config: Types.Config.TEngineConfig): void {
    fs.writeFileSync(
      path.resolve('config', `${config.revision}.json`),
      JSON.stringify(config, null, 2)
    );

    return;
  }
}

export default new CustomConfigProvider();
