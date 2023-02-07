import { BaseNode } from '../common/base-node';
import { TKeyValue } from './common';
import { TNodeOptions } from './node';

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

export type TRuleStagePreviousOutputs = TKeyValue<any>;
