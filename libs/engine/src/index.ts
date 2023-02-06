// Re-Exports
export * as Types from './common/types';
export { BaseNode } from './common/base-node';
export { TEngineConfig } from './common/config';

import RuleSet, { TRuleSetExecutionResult, TRuleSetInputs } from './rule/rule-set';

import Config, { TEngineConfig } from './common/config';

import { BaseNode, TSerializedNode } from './common/base-node';
import ExitNode from './nodes/exit';
import CompareBooleansNode from './nodes/compare-booleans';
import CompareNumbersNode from './nodes/compare-numbers';
import CompareStringsNode from './nodes/compare-strings';
import StaticValueNode from './nodes/static-value';
import Rule from './rule/rule';

export type TEngineOptions = {
  customNodes?: BaseNode<any, any, any>[]
};

export default class Engine {
  private nodes: BaseNode<any, any, any>[];
  private rules: Rule[] = [];
  private ruleSets: RuleSet[] = [];

  constructor(options: TEngineOptions) {
    this.nodes = [
      ...options.customNodes ?? [],
      new ExitNode(),
      new CompareBooleansNode(),
      new CompareNumbersNode(),
      new CompareStringsNode(),
      new StaticValueNode(),
    ];
  }

  loadConfig(config: TEngineConfig) {
    const { rules, ruleSets, } = Config.parse(config, this.nodes);

    this.rules = rules;
    this.ruleSets = ruleSets;
  }

  exportConfig(): TEngineConfig {
    return Config.export(
      -1,
      this.rules,
      this.ruleSets
    );
  }

  exportSerializedNodes(): TSerializedNode[] {
    return this.nodes.map(
      node => node.serialize()
    );
  }

  async executeRuleSet(ruleSetId: string, inputs: TRuleSetInputs): Promise<TRuleSetExecutionResult> {
    const ruleSet = this.ruleSets.find(ruleSet => ruleSet.id === ruleSetId);
    if (!ruleSet) {
      throw new Error(`Cannot execute unknown RuleSet: ${ruleSetId}`);
    }

    const result = await ruleSet.execute(inputs);

    return result;
  }
}
