import { BaseNode } from '../common/base-node';
import Rule from '../rule/rule';
import RuleSet from '../rule/rule-set';
import RuleStage from '../rule/rule-stage';
import { TConfigEngine, TConfigRule, TConfigRuleSet, TConfigRuleSetEntry, TConfigRuleStage, TParsedEngineConfig } from '../types/config';
import { TRuleSetEntry } from '../types/rule-set';

class Config {
  validate(config: TConfigEngine): boolean {
    return true; // TODO: Actually validate config. Detect e.g. circular references, invalid options, invalid nodeIds etc
  }

  parse(config: TConfigEngine, availableNodes: BaseNode<any, any, any>[]): TParsedEngineConfig {
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

  export(version: number, rules: Rule[], ruleSets: RuleSet[]): TConfigEngine {
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

  private parseRule(ruleConfig: TConfigRule, availableNodes: BaseNode<any, any, any>[]): Rule {
    const { id, name, stages, } = ruleConfig;

    return new Rule({
      id,
      name,
      stages: stages.map(
        stageConfig => this.parseRuleStage(stageConfig, availableNodes)
      ),
    });
  }

  private exportRule(rule: Rule): TConfigRule {
    const { id, name, stages, } = rule;

    return {
      id,
      name,
      stages: stages.map(
        ruleStage => this.exportRuleStage(ruleStage)
      ),
    };
  }

  private parseRuleStage(ruleStageConfig: TConfigRuleStage, availableNodes: BaseNode<any, any, any>[]): RuleStage {
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

  private exportRuleStage(ruleStage: RuleStage): TConfigRuleStage {
    const { id, type, node, inputs, nodeOptions, } = ruleStage;

    return {
      id,
      type,
      nodeId: node.id,
      inputs,
      nodeOptions,
    };
  }

  private parseRuleSet(ruleSetConfig: TConfigRuleSet, rules: Rule[]): RuleSet {
    const { id, name, entries, } = ruleSetConfig;

    return new RuleSet({
      id,
      name,
      entries: entries.map(
        entry => this.parseRuleSetEntry(entry, rules)
      ),
    });
  }

  private exportRuleSet(ruleSet: RuleSet): TConfigRuleSet {
    const { id, name, entries, } = ruleSet;

    return {
      id,
      name,
      entries: entries.map(
        entry => this.exportRuleSetEntry(entry)
      ),
    };
  }

  private parseRuleSetEntry(ruleSetEntryConfig: TConfigRuleSetEntry, rules: Rule[]): TRuleSetEntry {
    const { ruleId, severity, } = ruleSetEntryConfig;

    const rule = rules.find(
      rule => rule.id === ruleId
    );
    if (!rule) {
      throw new Error(`Failed to find rule with id ${ruleId}`);
    }

    return { rule, severity, };
  }

  private exportRuleSetEntry(ruleSetEntry: TRuleSetEntry): TConfigRuleSetEntry {
    const { rule, severity, } = ruleSetEntry;

    return {
      ruleId: rule.id,
      severity,
    };
  }
}

export default new Config();
