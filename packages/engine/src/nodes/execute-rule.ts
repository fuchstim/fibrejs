import z, { AnyZodObject } from 'zod';
import { BaseNode } from '../common/base-node';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

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

      options: context => ({
        isConditional: {
          name: 'Is Conditional',
          type: ENodeMetadataOptionType.INPUT,
          defaultValue: false,
          inputSchema: z.boolean(),
        },
        ruleId: {
          name: 'Rule',
          type: ENodeMetadataOptionType.DROP_DOWN,
          defaultValue: '',
          dropDownOptions: context.rules
            .filter(rule => rule.id !== context.rule?.id)
            .map(rule => ({ id: rule.id, name: rule.name, })),
        },
      }),
      inputSchema: context => this.getInputSchema(context),
      outputSchema: context => this.getOutputSchema(context),
    });
  }

  private getInputSchema(context: TNodeExecutorContext<TNodeOptions>): AnyZodObject {
    const rule = context.rules.find(rule => rule.id === context.nodeOptions.ruleId);
    if (!rule) { return z.object({}); }

    const { inputSchema: ruleInputSchema, } = rule.entryStage?.node.getSchemas(context) ?? { inputSchema: z.object({}), };
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

    const { outputSchema, } = rule.exitStage?.node.getSchemas(context) ?? { outputSchema: z.object({}), };

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
