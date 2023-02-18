import type { TExecutorContext, TExecutorResult } from './common';
import type { TRuleInputs, TRuleOutputs } from './rule';

export enum ERulePriority {
  LOWEST = 'LOWEST',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  HIGHEST = 'HIGHEST'
}

export type TRuleSetEntry = {
  ruleId: string,
  priority: ERulePriority,
};

export type TRuleSetOptions = {
  id: string,
  name: string,
  entries: TRuleSetEntry[],
};

export type TRuleSetInputs = {
  [key: string]: any
};

export type TRuleSetExecutorContext = TExecutorContext;

export type TRuleSetEntryResult = TExecutorResult<TRuleInputs, TRuleOutputs> & {
  ruleId: string,
  priority: ERulePriority,
};

export type TRuleSetExecutorResult = {
  highestPriorityRuleResult: TRuleSetEntryResult | null,
  ruleResults: TRuleSetEntryResult[]
};
