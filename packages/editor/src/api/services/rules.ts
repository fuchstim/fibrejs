import type Engine from '@fibre/engine';
import type { Types } from '@fibre/engine';

import { ICRUDService } from '../../types';

export default class RulesService implements ICRUDService<Types.Config.TRuleConfig> {
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

    return config.rules.sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }

  async create(rule: Omit<Types.Config.TRuleConfig, 'id'>) {
    const config = this.engine.getActiveConfig();

    const id = this.engine.generateId('rule');

    await this.engine.replaceActiveConfig({
      version: config.version,
      revision: config.revision + 1,
      rules: [
        ...config.rules,
        { id, ...rule, },
      ],
      ruleSets: config.ruleSets,
    });

    return { id, ...rule, };
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

  async delete(ruleId: string) {
    const config = this.engine.getActiveConfig();

    const rule = config.rules.find(rule => rule.id === ruleId);
    if (!rule) {
      throw new Error(`Cannot delete unknown rule ${ruleId}`);
    }

    const filteredRules = config.rules.filter(rule => rule.id !== ruleId);
    const filteredRuleSets = config.ruleSets.map(
      ruleSet => ({ ...ruleSet, entries: ruleSet.entries.filter(entry => entry.ruleId !== ruleId), })
    );

    await this.engine.replaceActiveConfig({
      version: config.version,
      revision: config.revision + 1,
      rules: filteredRules,
      ruleSets: filteredRuleSets,
    });

    return rule;
  }
}
