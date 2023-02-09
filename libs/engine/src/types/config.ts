import type { ERuleSeverity } from '../constants/rule-severities';
import type Rule from '../rule';
import type RuleSet from '../rule/rule-set';
import type { TNodeOptions } from './node';
import type { TRuleStageInput } from './rule-stage';

export type TRuleStageConfig = {
  id: string,
  nodeId: string,
  inputs: TRuleStageInput[],
  nodeOptions: TNodeOptions
};

export type TRuleConfig = {
  id: string,
  name: string,
  stages: TRuleStageConfig[],
};

export type TRuleSetEntryConfig = {
  ruleId: string,
  severity: ERuleSeverity,
};

export type TRuleSetConfig = {
  id: string,
  name: string,
  entries: TRuleSetEntryConfig[]
};

export type TEngineConfig = {
  version: number,
  rules: TRuleConfig[],
  ruleSets: TRuleSetConfig[]
};

export type TParsedEngineConfig = {
  version: number,
  rules: Rule[],
  ruleSets: RuleSet[],
};
