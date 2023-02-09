import type Engine from '@tripwire/engine';

import { IService } from '../../types';

export default class RuleSetsService implements IService {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  get(ruleSetId: string) {
    const config = this.engine.getActiveConfig();

    return config.ruleSets.find(
      ruleSet => ruleSet.id === ruleSetId
    );
  }

  find() {
    const config = this.engine.getActiveConfig();

    return config.ruleSets;
  }
}
