// Constants
export * as Types from './constants/types';

// Nodes
export * from './nodes/base-node';

import { ERuleSeverity } from './constants/severities';
import RuleSet from './rule/rule-set';
import { TRuleStageInput } from './rule/rule-stage';

import Config, { TConfig } from './config';

import BaseNode from './nodes/base-node';
import ExitNode from './nodes/exit-node';
import CompareBooleansNode from './nodes/compare-booleans-node';
import CompareNumbersNode from './nodes/compare-numbers-node';
import CompareStringsNode from './nodes/compare-strings-node';

export type TEngineOptions = {
  customNodes?: BaseNode<any, any, any>[]
};

export default class Engine {
  private registeredNodes: BaseNode<any, any, any>[];
  private registeredRuleSets: { [key: string]: RuleSet } = {};

  constructor(options: TEngineOptions) {
    this.registeredNodes = [
      ...options.customNodes ?? [],
      new ExitNode(),
      new CompareBooleansNode(),
      new CompareNumbersNode(),
      new CompareStringsNode(),
    ];
  }

  loadConfig(config: TConfig) {
    const ruleSets = Config.parse(config, this.registeredNodes);

    this.registeredRuleSets = ruleSets.reduce(
      (acc, ruleSet) => ({ ...acc, [ruleSet.id]: ruleSet, }),
      {}
    );
  }

  exportConfig(): TConfig {
    return Config.export(
      -1,
      Object.values(this.registeredRuleSets)
    );
  }

  async executeRuleSet(ruleSetId: string, inputs: TRuleStageInput): Promise<ERuleSeverity> {
    const ruleSet = this.registeredRuleSets[ruleSetId];
    if (!ruleSet) {
      throw new Error(`Cannot execute unknown RuleSet: ${ruleSetId}`);
    }

    const result = await ruleSet.execute(inputs);

    return result;
  }
}
