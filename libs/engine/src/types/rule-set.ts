import type { ERuleSeverity } from '../constants/rule-severities';
import type { TExecutorContext, TExecutorResult } from './common';
import type { TRuleOutput } from './rule';

export type TRuleSetEntry = {
  ruleId: string,
  severity: ERuleSeverity,
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

export type TRuleSetExecutorResult = {
  triggered: boolean,
  severity: ERuleSeverity | null,
  ruleResults: {
    ruleId: string,
    severity: ERuleSeverity,
    result: TExecutorResult<TRuleOutput>
  }[]
};
