import { ZodSchema } from 'zod';
import { BaseNode } from '../common/base-node';
import Executor from '../common/executor';
import { detectDuplicates } from '../common/util';
import { TExecutorResult, TValidationResult } from '../types/common';
import { ENodeType, TNodeExecutorContext, TNodeOptions } from '../types/node';
import { TRuleStageExecutorContext, TRuleStageInput, TRuleStageInputs, TRuleStageOptions, TRuleStageResults } from '../types/rule-stage';

export default class RuleStage
extends Executor<TRuleStageInputs, TExecutorResult<TRuleStageInputs, TRuleStageResults>, TRuleStageExecutorContext> {
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

    const result = await this.node.run(
      inputs,
      nodeContext
    );

    return result;
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
    // TODO: Compare output and input schemas

    // const { inputSchema: nodeInputSchema, } = this.node.getMetadata(context);

    // const stageInputSchemas = this.inputs
    //   .map(input => ({ input, schema: this.getStageInputSchema(input, context), }))
    //   .filter(({ schema, }) => schema !== null)
    //   .reduce(
    //     (acc, { input, schema, }) => ({ ...acc, [input.inputId]: schema, }),
    //     {} as Record<string, ZodSchema>
    //   );

    // debugger

    // const invalidStageInputs = nodeInputs
    //   .map(
    //     ({ id: inputId, type: nodeInputType, }) => {
    //       const stageInputType = stageInputTypes[inputId];
    //       if (!stageInputType) {
    //         if (isNullable(nodeInputType)) {
    //           return { inputId, valid: true, };
    //         }

    //         return { inputId, valid: false, reason: `Missing input: ${inputId}`, };
    //       }

    //       if (nodeInputType.id === stageInputType.id) {
    //         return { inputId, valid: true, };
    //       }

    //       if (isNullableOf(stageInputType, nodeInputType)) {
    //         return { inputId, valid: true, };
    //       }

    //       return { inputId, valid: false, reason: `Stage input ${stageInputType.name} is not valid for node input ${nodeInputType.name}`, };
    //     }
    //   )
    //   .filter(r => !r.valid);

    // if (invalidStageInputs.length) {
    //   const reasons = invalidStageInputs.map(r => `${r.inputId} (${r.reason})`);

    //   return {
    //     valid: false,
    //     reason: `One or more stage inputs are invalid: ${reasons.join(', ')}`,
    //   };
    // }

    return { valid: true, reason: null, };
  }

  private getStageInputSchema(stageInput: TRuleStageInput, context: TRuleStageExecutorContext): ZodSchema {
    const sourceRuleStage = context.rule?.stages.find(stage => stage.id === stageInput.ruleStageId);
    if (!sourceRuleStage) {
      throw new Error(`Unable to find source stage ${stageInput.ruleStageId} for input ${stageInput.inputId}`);
    }

    const { outputSchema: sourceNodeOutputSchema, } = sourceRuleStage.node.getMetadata(
      sourceRuleStage.createNodeContext(context)
    );

    const [ outputId, ...outputKeyParts ] = stageInput.outputId.split('.');

    const sourceNodeOutput = sourceNodeOutputSchema.shape[outputId];
    if (!sourceNodeOutput) {
      throw new Error(`Unable to find output ${outputId} in stage ${sourceRuleStage.id}`);
    }

    return outputKeyParts.reduce(
      (acc, keyPart) => acc?.shape?.[keyPart] ?? null,
      sourceNodeOutput
    );
  }
}
