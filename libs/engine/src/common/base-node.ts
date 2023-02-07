import { TNodeOptions, TNodeConfig, TNodeContext, TNodeMetadata } from '../types/node';

export abstract class BaseNode<TInputs, TOutputs, TOptions extends TNodeOptions> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;

  private metadata: TNodeMetadata<TOptions>;

  constructor(config: TNodeConfig<TOptions>) {
    const { id, name, description, ...metadata } = config;

    this.id = id;
    this.name = name;
    this.description = description;

    this.metadata = metadata;
  }

  abstract execute(inputs: TInputs, context: TNodeContext<TOptions>): Promise<TOutputs> | TOutputs;

  getMetadata(context: TNodeContext<TOptions>) {
    const { options, inputs, outputs, } = this.metadata;

    return {
      options: typeof options === 'function' ? options(context) : options,
      inputs: typeof inputs === 'function' ? inputs(context) : inputs,
      outputs: typeof outputs === 'function' ? outputs(context) : outputs,
    };
  }

  validateOptions(options: TOptions, context: TNodeContext<TOptions>): boolean {
    const { options: optionConfigs, } = this.getMetadata(context);

    const isValid = Object
      .entries(options ?? {})
      .every(([ optionId, value, ]) => {
        const optionConfig = optionConfigs.find(option => option.id === optionId);
        if (!optionConfig?.validate) { return false; }

        return optionConfig.validate(value);
      });

    return isValid;
  }
}
