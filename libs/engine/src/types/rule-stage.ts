import type { BaseNode } from '../common/base-node';
import type Rule from '../executors/rule';
import type { TExecutorResult } from './common';
import type { TNodeOptions } from './node';
import type { TRuleExecutorContext } from './rule';

export enum ERuleStageReservedId {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT'
}

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

export type TRuleStageInputs = Record<string, any>;
export type TRuleStageResults = Record<string, TExecutorResult<any, any>>;
