import type { BaseNode } from '../common/base-node';
import type Rule from '../executors/rule';
import type { TExecutorResult } from './common';
import type { TNodeOptions } from './node';
import type { TRuleExecutorContext, TRuleInputs } from './rule';

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

export type TRuleStageExecutorContext = TRuleExecutorContext & { rule?: Rule };

export type TRuleStageResults = Record<string, TExecutorResult<any>>;

export type TRuleStageInputs = {
  ruleInputs: TRuleInputs,
  previousStageResults: TRuleStageResults
};
export type TRuleStageOutputs = Record<string, any>;
