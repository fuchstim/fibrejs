import { BaseNode } from '..';
import { ERuleSeverity } from '../constants/rule-severities';
import Rule from '../rule/rule';
import RuleSet, { TRuleSetEntry } from '../rule/rule-set';
import RuleStage, { ERuleStageType, TRuleStageInput } from '../rule/rule-stage';
import { TNodeOptions } from './base-node';

type TRuleStageConfig = {
  id: string,
  type?: ERuleStageType,
  nodeId: string,
  inputs: TRuleStageInput[],
  nodeOptions: TNodeOptions
};

type TRuleConfig = {
  id: string,
  name: string,
  stages: TRuleStageConfig[],
};

type TRuleSetEntryConfig = {
  ruleId: string,
  severity: ERuleSeverity,
};

type TRuleSetConfig = {
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

class Config {
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
      ruleSetConfig => this.parseRuleSet(ruleSetConfig, rules)
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

  private parseRule(ruleConfig: TRuleConfig, availableNodes: BaseNode<any, any, any>[]): Rule {
    const { id, name, stages, } = ruleConfig;

    return new Rule({
      id,
      name,
      stages: stages.map(
        stageConfig => this.parseRuleStage(stageConfig, availableNodes)
      ),
    });
  }

  private exportRule(rule: Rule): TRuleConfig {
    const { id, name, stages, } = rule;

    return {
      id,
      name,
      stages: stages.map(
        ruleStage => this.exportRuleStage(ruleStage)
      ),
    };
  }

  private parseRuleStage(ruleStageConfig: TRuleStageConfig, availableNodes: BaseNode<any, any, any>[]): RuleStage {
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

  private exportRuleStage(ruleStage: RuleStage): TRuleStageConfig {
    const { id, type, node, inputs, nodeOptions, } = ruleStage;

    return {
      id,
      type,
      nodeId: node.id,
      inputs,
      nodeOptions,
    };
  }

  private parseRuleSet(ruleSetConfig: TRuleSetConfig, rules: Rule[]): RuleSet {
    const { id, name, entries, } = ruleSetConfig;

    return new RuleSet({
      id,
      name,
      entries: entries.map(
        entry => this.parseRuleSetEntry(entry, rules)
      ),
    });
  }

  private exportRuleSet(ruleSet: RuleSet): TRuleSetConfig {
    const { id, name, entries, } = ruleSet;

    return {
      id,
      name,
      entries: entries.map(
        entry => this.exportRuleSetEntry(entry)
      ),
    };
  }

  private parseRuleSetEntry(ruleSetEntryConfig: TRuleSetEntryConfig, rules: Rule[]): TRuleSetEntry {
    const { ruleId, severity, } = ruleSetEntryConfig;

    const rule = rules.find(
      rule => rule.id === ruleId
    );
    if (!rule) {
      throw new Error(`Failed to find rule with id ${ruleId}`);
    }

    return { rule, severity, };
  }

  private exportRuleSetEntry(ruleSetEntry: TRuleSetEntry): TRuleSetEntryConfig {
    const { rule, severity, } = ruleSetEntry;

    return {
      ruleId: rule.id,
      severity,
    };
  }
}

export default new Config();
