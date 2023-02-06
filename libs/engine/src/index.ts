// Constants
export * as Types from './constants/types';

// Nodes
export * from './nodes/base';

import { ERuleSeverity } from './constants/severities';
import RuleSet, { TRuleSetExecutionResult, TRuleSetInputs } from './rule/rule-set';
import { TRuleStageInput } from './rule/rule-stage';

import Config, { TConfig } from './config';

import BaseNode, { TSerializedNode } from './nodes/base';
import ExitNode from './nodes/exit';
import CompareBooleansNode from './nodes/compare-booleans';
import CompareNumbersNode from './nodes/compare-numbers';
import CompareStringsNode from './nodes/compare-strings';
import StaticValueNode from './nodes/static-value';

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
      new StaticValueNode(),
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

  exportSerializedNodes(): TSerializedNode[] {
    return this.registeredNodes.map(
      node => node.serialize()
    );
  }

  async executeRuleSet(ruleSetId: string, inputs: TRuleSetInputs): Promise<TRuleSetExecutionResult> {
    const ruleSet = this.registeredRuleSets[ruleSetId];
    if (!ruleSet) {
      throw new Error(`Cannot execute unknown RuleSet: ${ruleSetId}`);
    }

    const result = await ruleSet.execute(inputs);

    return result;
  }
}
