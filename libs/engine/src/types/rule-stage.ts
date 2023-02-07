import type { BaseNode } from '../common/base-node';
import type { TKeyValue } from './common';
import type { TNodeOptions } from './node';

export enum ERuleStageType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
}

export type TRuleStageInput = {
  ruleStageId: string,
  outputId: string,
  inputId: string,
};

export type TRuleStageOptions = {
  id: string,
  type?: ERuleStageType,
  node: BaseNode<any, any, any>,
  inputs: TRuleStageInput[],
  nodeOptions: TNodeOptions,
};

export type TRuleStagePreviousOutputs = TKeyValue<string, any>;
