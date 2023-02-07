import RuleStage from '../rule/rule-stage';
import { TKeyValue } from './common';

export type TRuleOptions = {
  id: string,
  name: string,
  stages: RuleStage[]
};

export type TRuleInputs = TKeyValue<any>;
export type TStageOutputs = TKeyValue<any>;

export type TRuleOutput = {
  triggered: boolean,
  // ToDo: Add more rule execution information
};
