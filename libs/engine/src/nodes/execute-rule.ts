import { BaseNode } from '../common/base-node';
import { ENodeMetadataOptionType, TNodeExecutorContext, TNodeMetadataInputOutput, TNodeMetadataOption } from '../types/node';
import { ERuleStageReservedId } from '../types/rule-stage';

type TNodeInputs = Record<string, any>;

type TNodeOutputs = Record<string, any>;

type TNodeOptions = {
  ruleId: string
};

export default class ExecuteRule extends BaseNode<TNodeInputs, TNodeOutputs, TNodeOptions> {
  constructor() {
    super({
      id: 'executeRule',
      name: 'Execute Rule',
      description: 'Execute another rule',

      defaultOptions: {
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

    return rule.entryStage?.node.getMetadata(context).inputs ?? [];
  }

  private getOutputs(context: TNodeExecutorContext<TNodeOptions>): TNodeMetadataInputOutput[] {
    const rule = context.rules.find(rule => rule.id === context.nodeOptions.ruleId);
    if (!rule) { return []; }

    return rule.exitStage?.node.getMetadata(context).outputs ?? [];
  }

  async execute(inputs: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>): Promise<TNodeOutputs> {
    const rule = context.rules.find(rule => rule.id === context.nodeOptions.ruleId);
    if (!rule) {
      throw new Error(`Cannot execute unknown rule: ${context.nodeOptions.ruleId}`);
    }

    const unwrappedInputs = this
      .getMetadata(context)
      .inputs
      .reduce(
        (acc, input) => ({
          ...acc,
          [input.id]: input.type.unwrap(inputs[input.id]),
        }),
        {}
      );

    const result = await rule.execute(unwrappedInputs, context);

    return result[ERuleStageReservedId.EXIT]?.outputs ?? {};
  }
}
