import type { BaseNode } from '../common/base-node';
import type { TExecutorResult, TKeyValue } from './common';
import type { TNodeOptions } from './node';
import type { TRuleExecutorContext } from './rule';

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

export type TRuleStageExecutorContext = TRuleExecutorContext;

export type TRuleStageResults = TKeyValue<string, TExecutorResult<any>>;

export type TRuleStageInputs = {
  previousResults: TRuleStageResults,
  additionalNodeInputs?: TKeyValue<string, any>;
};
