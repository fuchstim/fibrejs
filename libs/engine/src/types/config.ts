import type { ERuleSeverity } from '../constants/rule-severities';
import type Rule from '../rule';
import type RuleSet from '../rule/rule-set';
import type { TNodeOptions } from './node';
import type { ERuleStageType, TRuleStageInput } from './rule-stage';

export type TEngineConfigRuleStage = {
  id: string,
  type?: ERuleStageType,
  nodeId: string,
  inputs: TRuleStageInput[],
  nodeOptions: TNodeOptions
};

export type TEngineConfigRule = {
  id: string,
  name: string,
  stages: TEngineConfigRuleStage[],
};

export type TEngineConfigRuleSetEntry = {
  ruleId: string,
  severity: ERuleSeverity,
};

export type TEngineConfigRuleSet = {
  id: string,
  name: string,
  entries: TEngineConfigRuleSetEntry[]
};

export type TEngineConfig = {
  version: number,
  rules: TEngineConfigRule[],
  ruleSets: TEngineConfigRuleSet[]
};

export type TParsedEngineConfig = {
  version: number,
  rules: Rule[],
  ruleSets: RuleSet[],
};
