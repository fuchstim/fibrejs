import { BaseNode } from '../common/base-node';
import Executor from '../common/executor';
import { detectDuplicates } from '../common/util';
import { TExecutorValidationResult } from '../types/common';
import { ENodeType, TNodeExecutorContext, TNodeOptions } from '../types/node';
import { ERuleStageReservedId, TRuleStageExecutorContext, TRuleStageInput, TRuleStageInputs, TRuleStageOptions, TRuleStageResults } from '../types/rule-stage';

export default class RuleStage extends Executor<TRuleStageInputs, TRuleStageResults, TRuleStageExecutorContext> {
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
    const { outputs: wrappedOutputs, } = await this.node.run(
      inputs,
      this.createNodeContext(context)
    );

    return wrappedOutputs;
  }

  override validateContext(context: TRuleStageExecutorContext): TExecutorValidationResult<TRuleStageExecutorContext> {
    const validationContext = this.createNodeContext(context);

    if (Object.values(ERuleStageReservedId).includes(this.id as ERuleStageReservedId)) {
      return { valid: false, reason: `${this.id} is a reserved stage id`, actual: context, };
    }

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
