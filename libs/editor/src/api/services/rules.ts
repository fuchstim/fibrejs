import type Engine from '@tripwire/engine';

import { IService } from '../../types';

export default class RulesService implements IService {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  get(ruleId: string) {
    const config = this.engine.getActiveConfig();

    return config.rules.find(
      rule => rule.id === ruleId
    );
  }

  find() {
    const config = this.engine.getActiveConfig();

    return config.rules;
  }
}
