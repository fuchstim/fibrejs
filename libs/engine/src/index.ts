// Re-Exports
export * as WrappedTypes from './common/wrapped-types';
export { BaseNode } from './common/base-node';
export { ConfigProvider } from './storage/config-provider';
export * as Types from './types';

import ConfigParser from './storage/config-parser';
import { ConfigProvider } from './storage/config-provider';
import { BaseNode } from './common/base-node';
import serializer from './common/serializer';
import ExitNode from './nodes/exit';
import CompareBooleansNode from './nodes/compare-booleans';
import CompareNumbersNode from './nodes/compare-numbers';
import CompareStringsNode from './nodes/compare-strings';
import StaticValueNode from './nodes/static-value';
import Rule from './rule';
import RuleSet from './rule/rule-set';
import { TRuleSetExecutionResult, TRuleSetInputs } from './types/rule-set';
import { TSerializedNode } from './types/serializer';
import { TEngineConfig } from './types/config';
import { TKeyValue } from './types/common';
import { TNodeOptions } from './types/node';

export type TEngineOptions = {
  configProvider: ConfigProvider,
  customNodes?: BaseNode<any, any, any>[]
};

export default class Engine {
  private configProvider: ConfigProvider;
  private activeConfigVersion = 0;
  private nodes: BaseNode<any, any, any>[];
  private rules: Rule[] = [];
  private ruleSets: RuleSet[] = [];

  constructor(options: TEngineOptions) {
    this.configProvider = options.configProvider;

    this.nodes = [
      ...options.customNodes ?? [],
      new ExitNode(),
      new CompareBooleansNode(),
      new CompareNumbersNode(),
      new CompareStringsNode(),
      new StaticValueNode(),
    ];
  }

  async init() {
    const configVersion = await this.configProvider.getLatestConfigVersion();

    const config = await this.configProvider.loadConfig(configVersion);
    const { version, rules, ruleSets, } = ConfigParser.parse(config, this.nodes);

    this.activeConfigVersion = version;
    this.rules = rules;
    this.ruleSets = ruleSets;
  }

  async executeRuleSet(ruleSetId: string, inputs: TRuleSetInputs): Promise<TRuleSetExecutionResult> {
    const ruleSet = this.ruleSets.find(ruleSet => ruleSet.id === ruleSetId);
    if (!ruleSet) {
      throw new Error(`Cannot execute unknown RuleSet: ${ruleSetId}`);
    }

    const result = await ruleSet.execute(
      inputs,
      { rules: this.rules, }
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

  exportSerializedNode(nodeId: string, nodeOptions?: TNodeOptions): TSerializedNode {
    const node = this.nodes.find(
      node => node.id === nodeId
    );
    if (!node) { throw new Error(`Invalid Node ID: ${nodeId}`);}

    const context = {
      rules: this.rules,
      nodeOptions,
    };

    return serializer.serializeNode(node, context);
  }

  exportSerializedNodes(nodeOptions?: TKeyValue<string, TNodeOptions>): TSerializedNode[] {
    return this.nodes.map(
      node => this.exportSerializedNode(node.id, nodeOptions?.[node.id])
    );
  }
}
