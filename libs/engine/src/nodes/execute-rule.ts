import { BaseNode } from '../common/base-node';
import { TKeyValue } from '../types/common';
import { ENodeMetadataOptionType, TNodeContext, TNodeMetadataInputOutput, TNodeMetadataOption } from '../types/node';

type TNodeInput = TKeyValue<string, any>;

type TNodeOutput = TKeyValue<string, any>;

type TNodeOptions = {
  ruleId: string
};

export default class ExecuteRule extends BaseNode<TNodeInput, TNodeOutput, TNodeOptions> {
  constructor() {
    super({
      id: 'executeRule',
      name: 'Execute Rule',

      options: context => this.getOptions(context),
      inputs: context => this.getInputs(context),
      outputs: context => this.getOutputs(context),
    });
  }

  private getOptions(context: TNodeContext<TNodeOptions>): TNodeMetadataOption[] {
    const dropDownOptions = context.rules.map(
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

  private getInputs(context: TNodeContext<TNodeOptions>): TNodeMetadataInputOutput[] {
    const rule = context.rules.find(
      rule => rule.id === context.nodeOptions.ruleId
    );
    if (!rule) { return []; }

    return rule.entryStage.node.getMetadata(context).inputs;
  }

  private getOutputs(context: TNodeContext<TNodeOptions>): TNodeMetadataInputOutput[] {
    const rule = context.rules.find(
      rule => rule.id === context.nodeOptions.ruleId
    );
    if (!rule) { return []; }

    return rule.exitStage.node.getMetadata(context).outputs;
  }

  execute(inputs: TNodeInput, context: TNodeContext<TNodeOptions>): TNodeOutput {
    return {
      result: { value: false, },
    };
  }
}
