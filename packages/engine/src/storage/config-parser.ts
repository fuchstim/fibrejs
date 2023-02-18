import Logger from '@fibrejs/logger';
import { BaseNode } from '../common/base-node';
import Rule from '../executors/rule';
import RuleSet from '../executors/rule-set';
import RuleStage from '../executors/rule-stage';

import { TEngineConfig, TRuleConfig, TRuleSetConfig, TRuleStageConfig, TParsedEngineConfig, EConfigVersion, IConfigParser } from '../types/config';
import { detectDuplicates } from '../common/util';

const EXPORT_VERSION = EConfigVersion.V_1;

class ConfigParser implements IConfigParser {
  parse(config: TEngineConfig, availableNodes: BaseNode<any, any, any>[]): TParsedEngineConfig {
    const rules = config.rules.map(
      rule => this.parseRule(rule, availableNodes)
    );

    const duplicateRuleIds = detectDuplicates(rules);
    if (duplicateRuleIds.length) {
      throw new Error(`Duplicate rule ids: ${duplicateRuleIds.join(', ')}`);
    }

    const ruleSets = config.ruleSets.map(
      ruleSetConfig => this.parseRuleSet(ruleSetConfig)
    );

    const duplicateRuleSetIds = detectDuplicates(ruleSets);
    if (duplicateRuleSetIds.length) {
      throw new Error(`Duplicate rule set ids: ${duplicateRuleSetIds.join(', ')}`);
    }

    const validationContext = {
      executionId: 'validation',
      logger: new Logger('validation'),
      rules,
      ruleSets,
    };

    const invalidRules = rules
      .map(rule => ({ rule, result: rule.validateContext(validationContext), }))
      .filter(({ result, }) => !result.valid);
    if (invalidRules.length) {
      const invalidReasons = invalidRules.map(r => `${r.rule.id} (${r.result.reason})`).join(', ');
      throw new Error(`One or more rules are not valid: ${invalidReasons}`);
    }

    const invalidRuleSets = ruleSets
      .map(ruleSet => ({ ruleSet, result: ruleSet.validateContext(validationContext), }))
      .filter(({ result, }) => !result.valid);
    if (invalidRuleSets.length) {
      const invalidReasons = invalidRuleSets.map(rs => `${rs.ruleSet.id} (${rs.result.reason})`).join(', ');
      throw new Error(`One or more rule sets are not valid: ${invalidReasons}`);
    }

    return {
      revision: config.revision,
      rules,
      ruleSets,
    };
  }

  export(revision: number, rules: Rule[], ruleSets: RuleSet[]): TEngineConfig {
    const ruleConfigs = rules.map(
      rule => this.exportRule(rule)
    );

    const ruleSetConfigs = ruleSets.map(
      ruleSet => this.exportRuleSet(ruleSet)
    );

    return {
      version: EXPORT_VERSION,
      revision,
      rules: ruleConfigs,
      ruleSets: ruleSetConfigs,
    };
  }

  parseRule(ruleConfig: TRuleConfig, availableNodes: BaseNode<any, any, any>[]): Rule {
    const { id, name, stages, } = ruleConfig;

    const duplicateStageIds = detectDuplicates(stages);
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

  exportRule(rule: Rule): TRuleConfig {
    const { id, name, sortedStages, } = rule;

    return {
      id,
      name,
      stages: sortedStages
        .flat()
        .map(
          ruleStage => this.exportRuleStage(ruleStage)
        ),
    };
  }

  parseRuleStage(ruleStageConfig: TRuleStageConfig, availableNodes: BaseNode<any, any, any>[]): RuleStage {
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

  exportRuleStage(ruleStage: RuleStage): TRuleStageConfig {
    const { id, node, inputs, nodeOptions, } = ruleStage;

    return {
      id,
      nodeId: node.id,
      inputs,
      nodeOptions,
    };
  }

  parseRuleSet(ruleSetConfig: TRuleSetConfig): RuleSet {
    const { id, name, entries, } = ruleSetConfig;

    return new RuleSet({
      id,
      name,
      entries,
    });
  }

  exportRuleSet(ruleSet: RuleSet): TRuleSetConfig {
    const { id, name, entries, } = ruleSet;

    return {
      id,
      name,
      entries,
    };
  }
}

export default new ConfigParser();
