import { BaseNode } from '../common/base-node';
import Executor from '../common/executor';
import { detectDuplicates } from '../common/util';
import { TExecutorResult, TExecutorValidationResult } from '../types/common';
import { ENodeType, TNodeExecutorContext, TNodeOptions } from '../types/node';
import { TRuleStageExecutorContext, TRuleStageInput, TRuleStageInputs as TRuleStageExecutorInputs, TRuleStageOptions } from '../types/rule-stage';

export default class RuleStage extends Executor<TRuleStageExecutorInputs, TExecutorResult<any>, TRuleStageExecutorContext> {
  readonly id: string;
  readonly node: BaseNode<any, any, any>;
  readonly inputs: TRuleStageInput[];
  readonly nodeOptions: TNodeOptions;

  constructor(options: TRuleStageOptions) {
    super(options.id, 'rule-stage');

    this.id = options.id;
    this.node = options.node;
    this.inputs = options.inputs;
    this.nodeOptions = options.nodeOptions;
  }

  get dependsOn() {
    return this.inputs.map(input => input.ruleStageId);
  }

  createNodeContext(context: TRuleStageExecutorContext): TNodeExecutorContext<TNodeOptions> {
    return {
      ...context,
      ruleStage: this,
      nodeOptions: {
        ...this.node.getDefaultOptions(),
        ...this.nodeOptions,
      },
    };
  }

  async execute({ previousResults, additionalNodeInputs, }: TRuleStageExecutorInputs, context: TRuleStageExecutorContext) {
    const nodeInputs = this.inputs.reduce(
      (acc, { ruleStageId, inputId, outputId, }) => ({
        ...acc,
        [inputId]: this.getOutputByKey(previousResults[ruleStageId], outputId),
      }),
      additionalNodeInputs ?? {}
    );

    const nodeContext = this.createNodeContext(context);
    const result = await this.node.run(
      nodeInputs,
      nodeContext
    );

    return result.outputs;
  }

  override validateContext(context: TRuleStageExecutorContext): TExecutorValidationResult<TRuleStageExecutorContext> {
    const validationContext = this.createNodeContext(context);

    const duplicateInputsIds = detectDuplicates(this.inputs.map(i => i.inputId));
    if (duplicateInputsIds.length) {
      return { valid: false, reason: `Multiple values to same inputs: ${duplicateInputsIds.join(', ')}`, actual: context, };
    }

    if (this.node.type === ENodeType.ENTRY && this.inputs.length > 0) {
      return { valid: false, reason: 'Entry node stage cannot have inputs', actual: context, };
    }

    const nodeInputs = this.node.getMetadata(validationContext).inputs;
    if (this.node.type !== ENodeType.ENTRY && this.inputs.length !== nodeInputs.length) {
      const missingInputs = nodeInputs.filter(
        nodeInput => !this.inputs.map(i => i.inputId).includes(nodeInput.id)
      );

      return { valid: false, reason: `Missing inputs: ${missingInputs.map(i => i.id)}`, actual: context, };
    }

    return this.node.validateContext(validationContext);
  }

  private getOutputByKey({ outputs, }: TExecutorResult<any>, key: string): any {
    const pathParts = key.split('.');
    const value = pathParts.reduce(
      (acc, pathPart) => acc[pathPart],
      outputs
    );

    return value;
  }
}
