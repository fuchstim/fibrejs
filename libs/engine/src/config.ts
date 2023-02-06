import { BaseNode } from '.';
import { ERuleSeverity } from './constants/severities';
import Rule from './rule/rule';
import RuleSet, { TRuleWithSeverity } from './rule/rule-set';
import RuleStage, { ERuleStageType, TRuleStageInput } from './rule/rule-stage';

type TRuleStageConfig = {
  id: string,
  type?: ERuleStageType,
  nodeId: string,
  inputs: TRuleStageInput[],
};

type TRuleConfig = {
  id: string,
  name: string,
  severity: ERuleSeverity,
  stages: TRuleStageConfig[],
};

type TRuleSetConfig = {
  id: string,
  name: string,
  rules: TRuleConfig[],
};

export type TConfig = {
  version: number,
  ruleSets: TRuleSetConfig[]
};

class Config {
  validate(config: TConfig): boolean {
    return true; // TODO: Actually validate config
  }

  parse(config: TConfig, availableNodes: BaseNode<any, any>[]): RuleSet[] {
    if (!this.validate(config)) {
      throw new Error('Failed to parse invalid config');
    }

    const ruleSets = config.ruleSets.map(
      ruleSetConfig => this.parseRuleSet(ruleSetConfig, availableNodes)
    );

    return ruleSets;
  }

  export(version: number, ruleSets: RuleSet[]): TConfig {
    const ruleSetConfigs = ruleSets.map(
      ruleSet => this.exportRuleSet(ruleSet)
    );

    return {
      version,
      ruleSets: ruleSetConfigs,
    };
  }

  private parseRuleSet(ruleSetConfig: TRuleSetConfig, availableNodes: BaseNode<any, any>[]): RuleSet {
    const rules = ruleSetConfig.rules.map(
      ruleConfig => this.parseRule(ruleConfig, availableNodes)
    );

    const { id, name, } = ruleSetConfig;

    return new RuleSet({
      id,
      name,
      rules,
    });
  }

  private exportRuleSet(ruleSet: RuleSet): TRuleSetConfig {
    const ruleConfigs = ruleSet.rules.map(
      rule => this.exportRule(rule)
    );

    const { id, name, } = ruleSet;

    return {
      id,
      name,
      rules: ruleConfigs,
    };
  }

  private parseRule(ruleConfig: TRuleConfig, availableNodes: BaseNode<any, any>[]): TRuleWithSeverity {
    const stages = ruleConfig.stages.map(
      stageConfig => this.parseRuleStage(stageConfig, availableNodes)
    );

    const { id, name, severity, } = ruleConfig;

    return {
      severity,
      rule: new Rule({
        id,
        name,
        stages,
      }),
    };
  }

  private exportRule({ rule, severity, }: TRuleWithSeverity): TRuleConfig {
    const stageConfigs = rule.stages.map(
      ruleStage => this.exportRuleStage(ruleStage)
    );

    const { id, name, } = rule;

    return {
      id,
      name,
      severity,
      stages: stageConfigs,
    };
  }

  private parseRuleStage(ruleStageConfig: TRuleStageConfig, availableNodes: BaseNode<any, any>[]): RuleStage {
    const node = availableNodes.find(
      node => node.id === ruleStageConfig.nodeId
    );
    if (!node) { throw new Error(`Failed to find node with id ${ruleStageConfig.nodeId}`); }

    const { id, type, inputs, } = ruleStageConfig;

    return new RuleStage({
      id,
      type,
      node,
      inputs,
    });
  }

  private exportRuleStage(ruleStage: RuleStage): TRuleStageConfig {
    const { id, type, node, inputs, } = ruleStage;

    return {
      id,
      type,
      nodeId: node.id,
      inputs,
    };
  }
}

export default new Config();
