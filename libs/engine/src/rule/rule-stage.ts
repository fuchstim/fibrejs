import { BaseNode, TNodeOptions } from '../common/base-node';

export enum ERuleStageType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
}

export type TRuleStageInput = {
  ruleStageId: string,
  outputId: string,
  inputId: string,
};

export type TRuleStageOptions = {
  id: string,
  type?: ERuleStageType,
  node: BaseNode<any, any, any>,
  inputs: TRuleStageInput[],
  nodeOptions: TNodeOptions,
};

export type TPreviousStageOutputs = {
  [stageId: string]: any
};

export default class RuleStage {
  readonly id: string;
  readonly type?: ERuleStageType;
  readonly node: BaseNode<any, any, any>;
  readonly inputs: TRuleStageInput[];
  readonly nodeOptions: TNodeOptions;
  private executed = false;

  constructor(options: TRuleStageOptions) {
    this.id = options.id;
    this.type = options.type;
    this.node = options.node;
    this.inputs = options.inputs;
    this.nodeOptions = options.nodeOptions;
  }

  get dependsOn() {
    return this.inputs.map(input => input.ruleStageId);
  }

  async execute(previousOutputs: TPreviousStageOutputs, additionalNodeInputs = {}): Promise<any> {
    if (this.executed) {
      throw new Error('Cannot execute RuleStage that was already executed');
    }

    const nodeInputs = this.inputs.reduce(
      (acc, { ruleStageId, inputId, outputId, }) => ({
        ...acc,
        [inputId]: this.getOutputByKey(previousOutputs[ruleStageId], outputId),
      }),
      additionalNodeInputs
    );

    const result = await this.node.execute(nodeInputs, this.nodeOptions);
    this.executed = true;

    return result;
  }

  private getOutputByKey(outputs: TPreviousStageOutputs, key: string): any {
    const pathParts = key.split('.');
    const value = pathParts.reduce(
      (acc, pathPart) => acc[pathPart],
      outputs
    );

    return value;
  }
}
