import type RuleStage from '../executors/rule-stage';
import type { TRuleSetExecutorContext } from './rule-set';
import type { TRuleStageResults } from './rule-stage';

export type TRuleOptions = {
  id: string,
  name: string,
  stages: RuleStage[]
};

export type TRuleInputs = Record<string, any>;
export type TStageOutputs = Record<string, any>;

export type TRuleExecutorContext = TRuleSetExecutorContext;

export type TRuleOutput = {
  triggered: boolean,
  ruleStageResults: TRuleStageResults
};
