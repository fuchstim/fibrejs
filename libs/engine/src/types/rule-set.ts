import { ERuleSeverity } from '../constants/rule-severities';
import Rule from '../rule/rule';

export type TRuleSetEntry = {
  rule: Rule,
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
