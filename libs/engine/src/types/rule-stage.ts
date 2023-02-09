import type { BaseNode } from '../common/base-node';
import type { TKeyValue } from './common';
import type { TNodeOptions } from './node';

export type TRuleStageInput = {
  ruleStageId: string,
  outputId: string,
  inputId: string,
};

export type TRuleStageOptions = {
  id: string,
  node: BaseNode<any, any, any>,
  inputs: TRuleStageInput[],
  nodeOptions: TNodeOptions,
};

export type TRuleStagePreviousOutputs = TKeyValue<string, any>;
