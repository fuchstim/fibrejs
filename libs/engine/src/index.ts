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
import ExitNode from './nodes/exit';
import CompareBooleansNode from './nodes/compare-booleans';
import CompareNumbersNode from './nodes/compare-numbers';
import CompareStringsNode from './nodes/compare-strings';
import StaticValueNode from './nodes/static-value';
import Rule from './executors/rule';
import RuleSet from './executors/rule-set';
import ConfigParser from './storage/config-parser';
import { ConfigProvider } from './storage/config-provider';
import { TRuleSetInputs } from './types/rule-set';
import { TSerializedNode } from './types/serializer';
import { TEngineConfig } from './types/config';
import { TNodeOptions } from './types/node';
import { TEventTypes } from './types/events';
import { TRuleSetExecutorContext } from './types/rule-set';

export type TEngineOptions = {
  configProvider: ConfigProvider,
  customNodes?: BaseNode<any, any, any>[]
};

export default class Engine extends EventEmitter<TEventTypes> {
  private configProvider: ConfigProvider;
  private activeConfigVersion = 0;
  private nodes: BaseNode<any, any, any>[];
  private rules: Rule[] = [];
  private ruleSets: RuleSet[] = [];

  constructor(options: TEngineOptions) {
    super();

    this.configProvider = options.configProvider;

    this.nodes = [
      ...options.customNodes ?? [],
      new ExitNode(),
      new CompareBooleansNode(),
      new CompareNumbersNode(),
      new CompareStringsNode(),
      new StaticValueNode(),
    ];

    eventBus.registerProxy(this);
  }

  async init() {
    const configVersion = await this.configProvider.getLatestConfigVersion();

    const config = await this.configProvider.loadConfig(configVersion);
    const { version, rules, ruleSets, } = ConfigParser.parse(config, this.nodes);

    this.activeConfigVersion = version;
    this.rules = rules;
    this.ruleSets = ruleSets;
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
    };

    const result = await ruleSet.run(
      inputs,
      ruleSetExecutorContext
    );

    return result;
  }

  getActiveConfig(): TEngineConfig {
    const activeConfig = ConfigParser.export(
      this.activeConfigVersion,
      this.rules,
      this.ruleSets
    );

    return activeConfig;
  }

  async saveActiveConfig(): Promise<void> {
    const configVersion = await this.configProvider.getLatestConfigVersion();

    const config = ConfigParser.export(
      configVersion + 1,
      this.rules,
      this.ruleSets
    );

    await this.configProvider.saveConfig(config);
  }

  exportSerializedNode(nodeId: string, nodeOptions: TNodeOptions = {}): TSerializedNode {
    const node = this.nodes.find(
      node => node.id === nodeId
    );
    if (!node) { throw new Error(`Invalid Node ID: ${nodeId}`);}

    const context = {
      executionId: '',
      logger: new Logger().ns('serializer', nodeId),
      rules: this.rules,
      nodeOptions,
    };

    return serializer.serializeNode(node, context);
  }

  exportSerializedNodes(nodeOptions?: Record<string, TNodeOptions>): TSerializedNode[] {
    return this.nodes.map(
      node => this.exportSerializedNode(node.id, nodeOptions?.[node.id])
    );
  }
}
