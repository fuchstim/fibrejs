import { BaseNode } from '../common/base-node';
import Rule from '../rule';
import RuleSet from '../rule/rule-set';
import RuleStage from '../rule/rule-stage';

import { TEngineConfig, TEngineConfigRule, TEngineConfigRuleSet, TEngineConfigRuleStage, TParsedEngineConfig } from '../types/config';

class ConfigParser {
  validate(config: TEngineConfig): boolean {
    return true; // TODO: Actually validate config. Detect e.g. circular references, invalid options, invalid nodeIds etc
  }

  parse(config: TEngineConfig, availableNodes: BaseNode<any, any, any>[]): TParsedEngineConfig {
    if (!this.validate(config)) {
      throw new Error('Failed to parse invalid config');
    }

    const rules = config.rules.map(
      rule => this.parseRule(rule, availableNodes)
    );

    const ruleSets = config.ruleSets.map(
      ruleSetConfig => this.parseRuleSet(ruleSetConfig)
    );

    return {
      version: config.version,
      rules,
      ruleSets,
    };
  }

  export(version: number, rules: Rule[], ruleSets: RuleSet[]): TEngineConfig {
    const ruleConfigs = rules.map(
      rule => this.exportRule(rule)
    );

    const ruleSetConfigs = ruleSets.map(
      ruleSet => this.exportRuleSet(ruleSet)
    );

    return {
      version,
      rules: ruleConfigs,
      ruleSets: ruleSetConfigs,
    };
  }

  private parseRule(ruleConfig: TEngineConfigRule, availableNodes: BaseNode<any, any, any>[]): Rule {
    const { id, name, stages, } = ruleConfig;

    return new Rule({
      id,
      name,
      stages: stages.map(
        stageConfig => this.parseRuleStage(stageConfig, availableNodes)
      ),
    });
  }

  private exportRule(rule: Rule): TEngineConfigRule {
    const { id, name, stages, } = rule;

    return {
      id,
      name,
      stages: stages.map(
        ruleStage => this.exportRuleStage(ruleStage)
      ),
    };
  }

  private parseRuleStage(ruleStageConfig: TEngineConfigRuleStage, availableNodes: BaseNode<any, any, any>[]): RuleStage {
    const { id, type, inputs, nodeId, nodeOptions, } = ruleStageConfig;

    const node = availableNodes.find(
      node => node.id === nodeId
    );
    if (!node) { throw new Error(`Failed to find node with id ${nodeId}`); }

    return new RuleStage({
      id,
      type,
      node,
      inputs,
      nodeOptions,
    });
  }

  private exportRuleStage(ruleStage: RuleStage): TEngineConfigRuleStage {
    const { id, type, node, inputs, nodeOptions, } = ruleStage;

    return {
      id,
      type,
      nodeId: node.id,
      inputs,
      nodeOptions,
    };
  }

  private parseRuleSet(ruleSetConfig: TEngineConfigRuleSet): RuleSet {
    const { id, name, entries, } = ruleSetConfig;

    return new RuleSet({
      id,
      name,
      entries,
    });
  }

  private exportRuleSet(ruleSet: RuleSet): TEngineConfigRuleSet {
    const { id, name, entries, } = ruleSet;

    return {
      id,
      name,
      entries,
    };
  }
}

export default new ConfigParser();
