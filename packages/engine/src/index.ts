// Re-Exports
export * as WrappedTypes from './common/wrapped-types';
export { BaseNode } from './common/base-node';
export { ConfigProvider } from './storage/config-provider';
export * as Types from './types';

import { v4 as uuidV4 } from 'uuid';
import Logger from '@fibrejs/logger';

import { BaseNode } from './common/base-node';
import eventBus from './common/event-bus';
import EventEmitter from './common/event-emitter';
import serializer from './common/serializer';
import CollectionSizeNode from './nodes/collection-size';
import CompareBooleansNode from './nodes/compare-booleans';
import CompareNumbersNode from './nodes/compare-numbers';
import CompareStringsNode from './nodes/compare-strings';
import ExecuteRuleNode from './nodes/execute-rule';
import ExitNode from './nodes/exit';
import StaticValueNode from './nodes/static-value';
import Rule from './executors/rule';
import RuleSet from './executors/rule-set';
import ConfigParser from './storage/config-parser';
import { ConfigProvider } from './storage/config-provider';
import { TRuleSetInputs } from './types/rule-set';
import { TSerializationContext } from './types/serializer';
import { TEventTypes } from './types/events';
import { TRuleSetExecutorContext } from './types/rule-set';
import { TEngineConfig, TRuleConfig, TRuleSetConfig } from './types/config';
import { TRuleInputs } from './types/rule';

export type TEngineOptions = {
  configProvider: ConfigProvider,
  customNodes?: BaseNode<any, any, any>[]
};

export default class Engine extends EventEmitter<TEventTypes> {
  private configProvider: ConfigProvider;
  private activeConfigRevision = 0;
  private nodes: BaseNode<any, any, any>[];
  private rules: Rule[] = [];
  private ruleSets: RuleSet[] = [];

  constructor(options: TEngineOptions) {
    super();

    this.configProvider = options.configProvider;

    this.nodes = [
      ...options.customNodes ?? [],
      new CollectionSizeNode(),
      new CompareBooleansNode(),
      new CompareNumbersNode(),
      new CompareStringsNode(),
      new ExecuteRuleNode(),
      new ExitNode(),
      new StaticValueNode(),
    ];

    eventBus.registerProxy(this);
  }

  async init() {
    await this.loadConfig();
  }

  validateRuleConfig(config: TRuleConfig) {
    const rule = ConfigParser.parseRule(config, this.nodes);

    const validationContext = {
      executionId: 'validation',
      logger: new Logger('validation'),
      rules: this.rules,
      ruleSets: this.ruleSets,
    };
    const validationResult = rule.validateContext(validationContext);
    if (!validationResult.valid) {
      throw new Error(`Invalid rule configuration: ${validationResult.reason}`);
    }

    return { valid: true, };
  }

  async previewRule(config: TRuleConfig, inputs: TRuleInputs) {
    const rule = ConfigParser.parseRule(config, this.nodes);

    const executionId = `preview-${uuidV4()}`;
    const context = {
      executionId,
      logger: new Logger().ns(executionId),
      rules: this.rules,
      ruleSets: this.ruleSets,
      isPreview: true,
    };
    const result = rule.run(inputs, context);

    return result;
  }

  async executeRule(ruleId: string, inputs: TRuleSetInputs) {
    const rule = this.rules.find(rule => rule.id === ruleId);
    if (!rule) {
      throw new Error(`Cannot execute unknown rule: ${ruleId}`);
    }

    const executionId = uuidV4();
    const ruleExecutorContext: TRuleSetExecutorContext = {
      executionId,
      logger: new Logger().ns(executionId),
      rules: this.rules,
      ruleSets: this.ruleSets,
    };

    const result = await rule.run(
      inputs,
      ruleExecutorContext
    );

    return result;
  }

  validateRuleSetConfig(config: TRuleSetConfig) {
    const ruleSet = ConfigParser.parseRuleSet(config);

    const validationContext = {
      executionId: 'validation',
      logger: new Logger('validation'),
      rules: this.rules,
      ruleSets: this.ruleSets,
    };
    const validationResult = ruleSet.validateContext(validationContext);
    if (!validationResult.valid) {
      throw new Error(`Invalid rule set configuration: ${validationResult.reason}`);
    }

    return { valid: true, };
  }

  async executeRuleSet(ruleSetId: string, inputs: TRuleSetInputs) {
    const ruleSet = this.ruleSets.find(ruleSet => ruleSet.id === ruleSetId);
    if (!ruleSet) {
      throw new Error(`Cannot execute unknown rule set: ${ruleSetId}`);
    }

    const executionId = uuidV4();
    const ruleSetExecutorContext: TRuleSetExecutorContext = {
      executionId,
      logger: new Logger().ns(executionId),
      rules: this.rules,
      ruleSets: this.ruleSets,
    };

    const result = await ruleSet.run(
      inputs,
      ruleSetExecutorContext
    );

    return result;
  }

  getActiveConfig() {
    const activeConfig = ConfigParser.export(
      this.activeConfigRevision,
      this.rules,
      this.ruleSets
    );

    return activeConfig;
  }

  async loadConfig() {
    const latestRevision = await this.configProvider.getLatestRevision();

    const config = await this.configProvider.load(latestRevision);
    const { revision, rules, ruleSets, } = ConfigParser.parse(config, this.nodes);

    this.activeConfigRevision = revision;
    this.rules = rules;
    this.ruleSets = ruleSets;
  }

  async saveActiveConfig() {
    const revision = await this.configProvider.getLatestRevision();

    const config = ConfigParser.export(
      revision + 1,
      this.rules,
      this.ruleSets
    );

    await this.configProvider.save(config);
  }

  async replaceActiveConfig(config: TEngineConfig) {
    const { revision, rules, ruleSets, } = ConfigParser.parse(config, this.nodes);

    if (revision <= this.activeConfigRevision) {
      throw new Error('Cannot replace active config with older revision');
    }

    await this.configProvider.save(
      ConfigParser.export(
        revision,
        rules,
        ruleSets
      )
    );

    this.activeConfigRevision = revision;
    this.rules = rules;
    this.ruleSets = ruleSets;
  }

  exportSerializedNode(nodeId: string, context?: TSerializationContext) {
    const node = this.nodes.find(node => node.id === nodeId);
    if (!node) { throw new Error(`Invalid Node ID: ${nodeId}`);}

    const nodeContext = {
      executionId: '',
      logger: new Logger().ns('serializer', nodeId),
      rules: this.rules,
      ruleSets: this.ruleSets,
      rule: this.rules.find(rule => rule.id === context?.ruleId),
      ruleSet: this.ruleSets.find(ruleSet => ruleSet.id === context?.ruleSetId),
      nodeOptions: { ...node.getDefaultOptions(), ...context?.nodeOptions, },
    };

    return serializer.serializeNode(node, nodeContext);
  }

  exportSerializedNodes(limitedContext?: { ruleId?: string, ruleSetId?: string }) {
    return this.nodes.map(
      node => this.exportSerializedNode(node.id, limitedContext)
    );
  }

  generateId(prefix: 'rule' | 'rule-set'): string {
    const existingEntities = prefix === 'rule' ? this.rules : this.ruleSets;

    const highestExistingId = Math.max(
      0,
      ...existingEntities.map(e => Number(e.id.replace(`${prefix}-`, '')))
    );

    return `${prefix}-${highestExistingId + 1}`;
  }
}
