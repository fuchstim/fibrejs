import { BaseNode } from '../common/base-node';
import { EPrimitive, WBooleanType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext, TNodeMetadataInputOutput, TNodeMetadataOption } from '../types/node';

type TNodeInputs = Record<string, any>;

type TNodeOutputs = Record<string, any>;

type TNodeOptions = {
  isConditional: boolean,
  ruleId: string
};

export default class ExecuteRule extends BaseNode<TNodeInputs, TNodeOutputs, TNodeOptions> {
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
      inputs: context => this.getInputs(context),
      outputs: context => this.getOutputs(context),
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
        inputOptions: { type: EPrimitive.BOOLEAN, },
        validate: input => typeof input === 'boolean',
      },
      {
        id: 'ruleId',
        name: 'Rule',
        type: ENodeMetadataOptionType.DROP_DOWN,
        dropDownOptions,
        validate: ruleId => dropDownOptions.some(
          option => option.id === ruleId
        ),
      },
    ];
  }

  private getInputs(context: TNodeExecutorContext<TNodeOptions>): TNodeMetadataInputOutput[] {
    const rule = context.rules.find(rule => rule.id === context.nodeOptions.ruleId);
    if (!rule) { return []; }

    const ruleInputs = rule.entryStage?.node.getMetadata(context).inputs ?? [];
    const conditionalRuleInputs = context.nodeOptions.isConditional ? [ { id: 'executeRule', name: 'Execute Rule', type: WBooleanType, }, ] : [];

    return [
      ...conditionalRuleInputs,
      ...ruleInputs,
    ];
  }

  private getOutputs(context: TNodeExecutorContext<TNodeOptions>): TNodeMetadataInputOutput[] {
    const rule = context.rules.find(rule => rule.id === context.nodeOptions.ruleId);
    if (!rule) { return []; }

    const ruleOutputs = rule.exitStage?.node.getMetadata(context).outputs ?? [];

    return context.nodeOptions.isConditional ? [] : ruleOutputs;
  }

  async execute(inputs: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>): Promise<TNodeOutputs> {
    const rule = context.rules.find(rule => rule.id === context.nodeOptions.ruleId);
    if (!rule) {
      throw new Error(`Cannot execute unknown rule: ${context.nodeOptions.ruleId}`);
    }

    if (context.nodeOptions.isConditional && !WBooleanType.unwrap(inputs.executeRule)) {
      return {};
    }

    const metadata = this.getMetadata(context);

    const unwrappedInputs = metadata.inputs
      .reduce(
        (acc, input) => ({
          ...acc,
          [input.id]: input.type.unwrap(inputs[input.id]),
        }),
        {}
      );

    const result = await rule.execute(unwrappedInputs, context);

    if (context.isPreview) {
      return {
        ...result.exitStageOutputs,
        stageResults: result.stageResults,
      };
    }

    const wrappedOutputs = metadata.outputs
      .reduce(
        (acc, output) => ({
          ...acc,
          [output.id]: output.type.wrap(result.exitStageOutputs[output.id]),
        }),
        { stageResults: result.stageResults, }
      );

    return wrappedOutputs;
  }
}
