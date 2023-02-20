import { BaseNode } from '../common/base-node';
import Executor from '../common/executor';
import { detectDuplicates } from '../common/util';
import { WrappedComplex, WrappedType } from '../common/wrapped-types';
import { TValidationResult } from '../types/common';
import { ENodeType, TNodeExecutorContext, TNodeOptions } from '../types/node';
import { TRuleStageExecutorContext, TRuleStageInput, TRuleStageInputs, TRuleStageOptions, TRuleStageResults } from '../types/rule-stage';

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

  async execute(wrappedInputs: TRuleStageInputs, context: TRuleStageExecutorContext) {
    const { outputs: wrappedOutputs, } = await this.node.run(
      wrappedInputs,
      this.createNodeContext(context)
    );

    return wrappedOutputs;
  }

  override validateContext(context: TRuleStageExecutorContext): TValidationResult {
    const validationContext = this.createNodeContext(context);

    const duplicateInputsIds = detectDuplicates(this.inputs.map(i => i.inputId));
    if (duplicateInputsIds.length) {
      return { valid: false, reason: `Multiple values to same inputs: ${duplicateInputsIds.join(', ')}`, };
    }

    if (this.node.type === ENodeType.ENTRY && this.inputs.length > 0) {
      return { valid: false, reason: 'Entry node stage cannot have inputs', };
    }

    if (this.node.type !== ENodeType.ENTRY) {
      try {
        const stageInputsValidationResult = this.validateStageInputs(validationContext);
        if (!stageInputsValidationResult.valid) {
          return stageInputsValidationResult;
        }
      } catch (error) {
        return { valid: false, reason: (error as Error).message, };
      }
    }

    return this.node.validateContext(validationContext);
  }

  private validateStageInputs(context: TNodeExecutorContext<TNodeOptions>): TValidationResult {
    const nodeInputs = this.node.getMetadata(context).inputs;

    if (this.inputs.length < nodeInputs.length) {
      const missingInputs = nodeInputs.filter(
        nodeInput => !this.inputs.map(i => i.inputId).includes(nodeInput.id)
      );

      return { valid: false, reason: `Missing inputs: ${missingInputs.map(i => i.id).join(', ')}`, };
    }

    const stageInputTypes = this.inputs
      .map(input => ({ input, type: this.getStageInputType(input, context), }))
      .filter(({ type, }) => type !== null)
      .reduce(
        (acc, { input, type, }) => ({ ...acc, [input.inputId]: type as WrappedType<any, any>, }),
        {} as Record<string, WrappedType<any, any>>
      );

    const invalidStageInputs = nodeInputs
      .map(
        ({ id: inputId, type: nodeInputType, }) => {
          const stageInputType = stageInputTypes[inputId];
          if (!stageInputType) {
            return { inputId, valid: false, reason: `No stage input found for node input ${inputId}`, };
          }

          if (nodeInputType.id === stageInputType.id) {
            return { inputId, valid: true, };
          }

          return { inputId, valid: false, reason: `Stage input ${stageInputType.name} is not valid for node input ${nodeInputType.name}`, };
        }
      )
      .filter(r => !r.valid);

    if (invalidStageInputs.length) {
      const reasons = invalidStageInputs.map(r => `${r.inputId} (${r.reason})`);

      return {
        valid: false,
        reason: `One or more stage inputs are invalid: ${reasons.join(', ')}`,
      };
    }

    return { valid: true, reason: null, };
  }

  private getStageInputType(stageInput: TRuleStageInput, context: TRuleStageExecutorContext): WrappedType<any, any> | null {
    const sourceRuleStage = context.rule?.stages.find(s => s.id === stageInput.ruleStageId);
    if (!sourceRuleStage) {
      throw new Error(`Unable to find source stage ${stageInput.ruleStageId} for input ${stageInput.inputId}`);
    }

    const { outputs: sourceRuleStageOutputs, } = sourceRuleStage.node.getMetadata(
      sourceRuleStage.createNodeContext(context)
    );

    const [ outputId, ...outputKeyParts ] = stageInput.outputId.split('.');

    const sourceRuleStageOutput = sourceRuleStageOutputs.find(o => o.id === outputId);
    if (!sourceRuleStageOutput) {
      throw new Error(`Unable to find output ${outputId} in stage ${sourceRuleStage.id}`);
    }

    const outputType = outputKeyParts.reduce(
      (acc, keyPart) => {
        if (acc instanceof WrappedComplex<any, any>) {
          return acc.fields[keyPart];
        }

        return null;
      },
      sourceRuleStageOutput.type as WrappedType<any, any> | null
    );

    return outputType;
  }
}
