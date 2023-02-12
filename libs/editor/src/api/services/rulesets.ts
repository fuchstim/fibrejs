import type Engine from '@tripwire/engine';

import { IService } from '../../types';
import type { Types } from '@tripwire/engine';

export default class RuleSetsService implements IService<Types.Config.TRuleSetConfig> {
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

  async create(ruleSet: Types.Config.TRuleSetConfig) {
    const config = this.engine.getActiveConfig();

    await this.engine.replaceActiveConfig({
      version: config.version,
      revision: config.revision + 1,
      rules: config.rules,
      ruleSets: [
        ...config.ruleSets,
        ruleSet,
      ],
    });

    return ruleSet;
  }

  async patch(ruleSetId: string, ruleSet: Types.Config.TRuleSetConfig) {
    if (ruleSetId !== ruleSet.id) { throw new Error(`Rule set id ${ruleSetId} does not match rule set id ${ruleSet.id}`); }

    const config = this.engine.getActiveConfig();

    await this.engine.replaceActiveConfig({
      version: config.version,
      revision: config.revision + 1,
      rules: config.rules,
      ruleSets: [
        ...config.ruleSets.filter(r => r.id !== ruleSetId),
        ruleSet,
      ],
    });

    return ruleSet;
  }
}
