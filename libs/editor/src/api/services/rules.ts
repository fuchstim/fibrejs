import type Engine from '@tripwire/engine';

import { IService } from '../../types';
import type { Types } from '@tripwire/engine';

export default class RulesService implements IService<Types.Config.TRuleConfig> {
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

  async create(rule: Types.Config.TRuleConfig) {
    const config = this.engine.getActiveConfig();

    await this.engine.replaceActiveConfig({
      version: config.version,
      revision: config.revision + 1,
      rules: [
        ...config.rules,
        rule,
      ],
      ruleSets: config.ruleSets,
    });

    return rule;
  }

  async patch(ruleId: string, rule: Types.Config.TRuleConfig) {
    if (ruleId !== rule.id) { throw new Error(`Rule id ${ruleId} does not match rule id ${rule.id}`); }

    const config = this.engine.getActiveConfig();

    await this.engine.replaceActiveConfig({
      version: config.version,
      revision: config.revision + 1,
      rules: [
        ...config.rules.filter(r => r.id !== ruleId),
        rule,
      ],
      ruleSets: config.ruleSets,
    });

    return rule;
  }
}
