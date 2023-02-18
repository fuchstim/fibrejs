import type Engine from '@fibrejs/engine';

import { ICRUDService } from '../../types';
import type { Types } from '@fibrejs/engine';

export default class RuleSetsService implements ICRUDService<Types.Config.TRuleSetConfig> {
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

    return config.ruleSets.sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }

  async create(ruleSet: Omit<Types.Config.TRuleSetConfig, 'id'>) {
    const config = this.engine.getActiveConfig();

    const id = this.engine.generateId('rule-set');

    await this.engine.replaceActiveConfig({
      version: config.version,
      revision: config.revision + 1,
      rules: config.rules,
      ruleSets: [
        ...config.ruleSets,
        { id, ...ruleSet, },
      ],
    });

    return { id, ...ruleSet, };
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

  async delete(ruleSetId: string) {
    const config = this.engine.getActiveConfig();

    const ruleSet = config.ruleSets.find(ruleSet => ruleSet.id === ruleSetId);
    if (!ruleSet) {
      throw new Error(`Cannot delete unknown rule set ${ruleSetId}`);
    }

    const filteredRuleSets = config.ruleSets.filter(ruleSet => ruleSet.id !== ruleSetId);

    await this.engine.replaceActiveConfig({
      version: config.version,
      revision: config.revision + 1,
      rules: config.rules,
      ruleSets: filteredRuleSets,
    });

    return ruleSet;
  }
}
