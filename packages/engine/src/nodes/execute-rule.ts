import z, { AnyZodObject } from 'zod';
import { BaseNode } from '../common/base-node';
import { ENodeMetadataOptionType, TNodeExecutorContext, TNodeMetadataOption } from '../types/node';

type TNodeInputs = Record<string, any>;
type TNodeOutputs = Record<string, any>;

type TNodeOptions = {
  isConditional: boolean,
  ruleId: string
};

export default class ExecuteRuleNode extends BaseNode<TNodeInputs, TNodeOutputs, TNodeOptions> {
  constructor() {
    super({
      id: 'executeRule',
      name: 'Execute Rule',
      description: 'Execute another rule',

      defaultOptions: {
        isConditional: false,
        ruleId: '',
      },
      options: context => this.getOptions(context),
      inputSchema: context => this.getInputSchema(context),
      outputSchema: context => this.getOutputSchema(context),
    });
  }

  private getOptions(context: TNodeExecutorContext<TNodeOptions>): TNodeMetadataOption[] {
    const dropDownOptions = context.rules
      .filter(rule => rule.id !== context.rule?.id)
      .map(
        ({ id, name, }) => ({ id, name, })
      );

    return [
      {
        id: 'isConditional',
        name: 'Is Conditional',
        type: ENodeMetadataOptionType.INPUT,
        inputSchema: z.boolean(),
      },
      {
        id: 'ruleId',
        name: 'Rule',
        type: ENodeMetadataOptionType.DROP_DOWN,
        dropDownOptions,
      },
    ];
  }

  private getInputSchema(context: TNodeExecutorContext<TNodeOptions>): AnyZodObject {
    const rule = context.rules.find(rule => rule.id === context.nodeOptions.ruleId);
    if (!rule) { return z.object({}); }

    const { inputSchema: ruleInputSchema, } = rule.entryStage?.node.getMetadata(context) ?? { inputSchema: z.object({}), };
    if (!context.nodeOptions.isConditional) {
      return ruleInputSchema;
    }

    return ruleInputSchema.extend({
      executeRule: z.boolean().describe('Execute Rule'),
    });
  }

  private getOutputSchema(context: TNodeExecutorContext<TNodeOptions>): AnyZodObject {
    const rule = context.rules.find(rule => rule.id === context.nodeOptions.ruleId);
    if (!rule) { return z.object({}); }

    const { outputSchema, } = rule.exitStage?.node.getMetadata(context) ?? { outputSchema: z.object({}), };

    return context.nodeOptions.isConditional ? outputSchema.deepPartial() : outputSchema;
  }

  async execute(inputs: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>): Promise<TNodeOutputs> {
    const rule = context.rules.find(rule => rule.id === context.nodeOptions.ruleId);
    if (!rule) {
      throw new Error(`Cannot execute unknown rule: ${context.nodeOptions.ruleId}`);
    }

    if (context.nodeOptions.isConditional && !inputs.executeRule) {
      return {};
    }

    const result = await rule.execute(inputs, context);

    return {
      ...result.exitStageOutputs,
      stageResults: result.stageResults,
    };
  }
}
