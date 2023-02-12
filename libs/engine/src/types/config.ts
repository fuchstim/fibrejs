import type { BaseNode } from '../common/base-node';
import type { ERuleSeverity } from './rule-set';
import type Rule from '../executors/rule';
import type RuleSet from '../executors/rule-set';
import type { TNodeOptions } from './node';
import type { TRuleStageInput } from './rule-stage';

export enum EConfigVersion {
  V_1 = 'V_1'
}

export interface IConfigParser {
  parse(config: TEngineConfig, availableNodes: BaseNode<any, any, any>[]): TParsedEngineConfig;
  export(revision: number, rules: Rule[], ruleSets: RuleSet[]): TEngineConfig;
}

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
  version: EConfigVersion,
  revision: number,
  rules: TRuleConfig[],
  ruleSets: TRuleSetConfig[]
};

export type TParsedEngineConfig = {
  revision: number,
  rules: Rule[],
  ruleSets: RuleSet[],
};
