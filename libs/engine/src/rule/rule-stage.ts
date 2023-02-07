import { BaseNode } from '../common/base-node';
import { TNodeOptions } from '../types/node';
import { TRuleContext } from '../types/rule';
import { ERuleStageType, TRuleStageInput, TRuleStageOptions, TRuleStagePreviousOutputs } from '../types/rule-stage';

export default class RuleStage {
  readonly id: string;
  readonly type?: ERuleStageType;
  readonly node: BaseNode<any, any, any>;
  readonly inputs: TRuleStageInput[];
  readonly nodeOptions: TNodeOptions;

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

  async execute(previousOutputs: TRuleStagePreviousOutputs, additionalNodeInputs = {}, ruleContext: TRuleContext): Promise<any> {
    const nodeInputs = this.inputs.reduce(
      (acc, { ruleStageId, inputId, outputId, }) => ({
        ...acc,
        [inputId]: this.getOutputByKey(previousOutputs[ruleStageId], outputId),
      }),
      additionalNodeInputs
    );

    const nodeContext = {
      ...ruleContext,
      nodeOptions: this.nodeOptions,
    };
    const result = await this.node.execute(nodeInputs, nodeContext);

    return result;
  }

  private getOutputByKey(outputs: TRuleStagePreviousOutputs, key: string): any {
    const pathParts = key.split('.');
    const value = pathParts.reduce(
      (acc, pathPart) => acc[pathPart],
      outputs
    );

    return value;
  }
}
