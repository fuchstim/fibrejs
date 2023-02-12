import Logger from '@tripwire/logger';
import { BaseNode } from '../common/base-node';
import Rule from '../executors/rule';
import RuleSet from '../executors/rule-set';
import RuleStage from '../executors/rule-stage';

import { TEngineConfig, TRuleConfig, TRuleSetConfig, TRuleStageConfig, TParsedEngineConfig } from '../types/config';

class ConfigParser {
  parse(config: TEngineConfig, availableNodes: BaseNode<any, any, any>[]): TParsedEngineConfig {
    const rules = config.rules.map(
      rule => this.parseRule(rule, availableNodes)
    );

    const duplicateRuleIds = this.detectDuplicates(rules);
    if (duplicateRuleIds.length) {
      throw new Error(`Duplicate rule ids: ${duplicateRuleIds.join(', ')}`);
    }

    const ruleSets = config.ruleSets.map(
      ruleSetConfig => this.parseRuleSet(ruleSetConfig)
    );

    const duplicateRuleSetIds = this.detectDuplicates(ruleSets);
    if (duplicateRuleSetIds.length) {
      throw new Error(`Duplicate rule set ids: ${duplicateRuleSetIds.join(', ')}`);
    }

    const validationContext = {
      executionId: 'validation',
      logger: new Logger('validation'),
      rules,
      ruleSets,
    };
    const invalidRuleSets = ruleSets
      .map(ruleSet => ({ ruleSet, result: ruleSet.validateContext(validationContext), }))
      .filter(({ result, }) => !result.valid);
    if (invalidRuleSets.length) {
      const invalidReasons = invalidRuleSets.map(rs => `${rs.ruleSet.id} (${rs.result.reason})`).join(', ');
      throw new Error(`One or more rule sets is not valid: ${invalidReasons}`);
    }

    return {
      version: config.version,
      rules,
      ruleSets,
    };
  }

  private detectDuplicates(inputs: (string | { id: string })[]): string[] {
    const inputStrings = inputs.map(
      input => typeof input === 'string' ? input : input.id
    );

    return Array.from(
      new Set(
        inputStrings.filter(
          input => inputStrings.filter(i => i === input).length > 1
        )
      )
    );
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

    const duplicateStageIds = this.detectDuplicates(stages);
    if (duplicateStageIds.length) {
      throw new Error(`Duplicate rule stage ids detected in rule ${id}: ${duplicateStageIds.join(', ')}`);
    }

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
    const { id, inputs, nodeId, nodeOptions, } = ruleStageConfig;

    const node = availableNodes.find(
      node => node.id === nodeId
    );
    if (!node) { throw new Error(`Failed to find node with id ${nodeId}`); }

    return new RuleStage({
      id,
      node,
      inputs,
      nodeOptions,
    });
  }

  private exportRuleStage(ruleStage: RuleStage): TRuleStageConfig {
    const { id, node, inputs, nodeOptions, } = ruleStage;

    return {
      id,
      nodeId: node.id,
      inputs,
      nodeOptions,
    };
  }

  private parseRuleSet(ruleSetConfig: TRuleSetConfig): RuleSet {
    const { id, name, entries, } = ruleSetConfig;

    return new RuleSet({
      id,
      name,
      entries,
    });
  }

  private exportRuleSet(ruleSet: RuleSet): TRuleSetConfig {
    const { id, name, entries, } = ruleSet;

    return {
      id,
      name,
      entries,
    };
  }
}

export default new ConfigParser();
