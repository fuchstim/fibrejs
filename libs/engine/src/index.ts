// Re-Exports
export * as WrappedTypes from './common/wrapped-types';
export { BaseNode } from './common/base-node';
export { ConfigProvider } from './storage/config-provider';
export * as Types from './types';

import { randomUUID } from 'crypto';
import Logger from '@tripwire/logger';

import { BaseNode } from './common/base-node';
import eventBus from './common/event-bus';
import EventEmitter from './common/event-emitter';
import serializer from './common/serializer';
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
import { TMultiSerializationContext, TSerializationContext } from './types/serializer';
import { TEventTypes } from './types/events';
import { TRuleSetExecutorContext } from './types/rule-set';

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

  async executeRuleSet(ruleSetId: string, inputs: TRuleSetInputs) {
    const ruleSet = this.ruleSets.find(ruleSet => ruleSet.id === ruleSetId);
    if (!ruleSet) {
      throw new Error(`Cannot execute unknown RuleSet: ${ruleSetId}`);
    }

    const executionId = randomUUID();
    const ruleSetExecutorContext: TRuleSetExecutorContext = {
      executionId: randomUUID(),
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
      nodeOptions: context?.nodeOptions ?? node.getDefaultOptions(),
    };

    return serializer.serializeNode(node, nodeContext);
  }

  exportSerializedNodes(context?: TMultiSerializationContext) {
    return this.nodes.map(
      node => this.exportSerializedNode(node.id, { ...context, nodeOptions: context?.nodeOptions?.[node.id], })
    );
  }
}
