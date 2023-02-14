import { BaseNode } from '../common/base-node';
import Executor from '../common/executor';
import { detectDuplicates } from '../common/util';
import { TExecutorValidationResult } from '../types/common';
import { ENodeType, TNodeExecutorContext, TNodeOptions } from '../types/node';
import { TRuleStageExecutorContext, TRuleStageInput, TRuleStageInputs, TRuleStageOptions, TRuleStageOutputs } from '../types/rule-stage';

export default class RuleStage extends Executor<TRuleStageInputs, TRuleStageOutputs, TRuleStageExecutorContext> {
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

  async execute(inputs: TRuleStageInputs, context: TRuleStageExecutorContext) {
    const nodeContext = this.createNodeContext(context);
    const nodeMetadata = this.node.getMetadata(nodeContext);

    const wrappedInputs = nodeMetadata.inputs
      .reduce(
        (acc, input) => ({
          ...acc,
          [input.id]: input.type.fromNative(inputs[input.id]),
        }),
        {}
      );

    const { outputs: wrappedOutputs, } = await this.node.run(
      wrappedInputs,
      nodeContext
    );

    return nodeMetadata.outputs
      .reduce(
        (acc, output) => ({
          ...acc,
          [output.id]: output.type.toNative(wrappedOutputs[output.id]),
        }),
        {}
      );
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
}
