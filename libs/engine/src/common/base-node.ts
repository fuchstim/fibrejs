import { TNodeOptions, TNodeConfig, TNodeExecutorContext, TNodeMetadata, ENodeType } from '../types/node';
import Executor from './executor';

// eslint-disable-next-line max-len
export abstract class BaseNode<TInputs, TOutputs, TOptions extends TNodeOptions> extends Executor<TInputs, TOutputs, TNodeExecutorContext<TOptions>> {
  readonly id: string;
  readonly name: string;
  readonly type?: ENodeType;
  readonly description?: string;

  private metadata: TNodeMetadata<TOptions>;

  constructor(config: TNodeConfig<TOptions>) {
    super('node');

    const { id, name, description, type, ...metadata } = config;

    this.id = id;
    this.name = name;
    this.type = type;
    this.description = description;

    this.metadata = metadata;
  }

  getMetadata(context: TNodeExecutorContext<TOptions>) {
    const { options, inputs, outputs, } = this.metadata;

    return {
      options: typeof options === 'function' ? options(context) : options,
      inputs: typeof inputs === 'function' ? inputs(context) : inputs,
      outputs: typeof outputs === 'function' ? outputs(context) : outputs,
    };
  }

  validateOptions(options: TOptions, context: TNodeExecutorContext<TOptions>): boolean {
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
