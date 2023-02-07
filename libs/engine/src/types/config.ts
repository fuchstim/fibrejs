import { ERuleSeverity } from '../constants/rule-severities';
import Rule from '../rule/rule';
import RuleSet from '../rule/rule-set';
import { TBaseNodeOptions } from './node';
import { ERuleStageType, TRuleStageInput } from './rule-stage';

export type TConfigRuleStage = {
  id: string,
  type?: ERuleStageType,
  nodeId: string,
  inputs: TRuleStageInput[],
  nodeOptions: TBaseNodeOptions
};

export type TConfigRule = {
  id: string,
  name: string,
  stages: TConfigRuleStage[],
};

export type TConfigRuleSetEntry = {
  ruleId: string,
  severity: ERuleSeverity,
};

export type TConfigRuleSet = {
  id: string,
  name: string,
  entries: TConfigRuleSetEntry[]
};

export type TConfigEngine = {
  version: number,
  rules: TConfigRule[],
  ruleSets: TConfigRuleSet[]
};

export type TParsedEngineConfig = {
  version: number,
  rules: Rule[],
  ruleSets: RuleSet[],
};
