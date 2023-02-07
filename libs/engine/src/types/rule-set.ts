import type { ERuleSeverity } from '../constants/rule-severities';

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

export type TRuleSetExecutionResult = {
  triggered: boolean,
  severity: ERuleSeverity | null,
};
