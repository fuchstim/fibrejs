import { TNodeOptions, TNodeConfig, TNodeExecutorContext, TNodeMetadata, ENodeType } from '../types/node';
import Executor from './executor';
import { EPrimitive } from './wrapped-types';

// eslint-disable-next-line max-len
export abstract class BaseNode<TInputs extends Record<string, any>, TOutputs extends Record<string, any>, TOptions extends TNodeOptions> extends Executor<TInputs, TOutputs, TNodeExecutorContext<TOptions>> {
  readonly id: string;
  readonly name: string;
  readonly type?: ENodeType;
  readonly description?: string;

  private metadata: TNodeMetadata<TOptions>;

  constructor(config: TNodeConfig<TOptions>) {
    super(config.id, 'node');

    const { id, name, description, type, ...metadata } = config;

    this.id = id;
    this.name = name;
    this.type = type;
    this.description = description;

    this.metadata = metadata;
  }

  protected override validateInput(inputValues: TInputs, context: TNodeExecutorContext<TOptions>) {
    const { inputs, } = this.getMetadata(context);

    const valid = inputs.every(
      input => input.type.validate(inputValues[input.id])
    );

    return {
      valid,
      actual: inputValues,
      expected: inputs.reduce(
        (acc, { id, type, }) => ({ ...acc, [id]: type, }),
        {}
      ),
    };
  }

  protected override validateOutput(outputValues: TOutputs, context: TNodeExecutorContext<TOptions>) {
    const { outputs, } = this.getMetadata(context);

    if (this.type === ENodeType.EXIT) {
      const validExitNodeOutputConfig = (
        outputs.length === 1
        && outputs[0].id === 'result'
        && Object.values(EPrimitive).includes(outputs[0].type.id as EPrimitive)
      );

      if (!validExitNodeOutputConfig) {
        throw new Error(`Exit node ${this.id} has invalid output configuration`);
      }
    }

    const valid = outputs.every(
      output => output.type.validate(outputValues[output.id])
    );

    return {
      valid,
      actual: outputValues,
      expected: outputs.reduce(
        (acc, { id, type, }) => ({ ...acc, [id]: type, }),
        {}
      ),
    };
  }

  getDefaultOptions() {
    return this.metadata.defaultOptions;
  }

  getMetadata(context: TNodeExecutorContext<TOptions>) {
    const { defaultOptions, options, inputs, outputs, } = this.metadata;

    return {
      defaultOptions,
      options: typeof options === 'function' ? options(context) : options,
      inputs: typeof inputs === 'function' ? inputs(context) : inputs,
      outputs: typeof outputs === 'function' ? outputs(context) : outputs,
    };
  }

  validateContext(context: TNodeExecutorContext<TOptions>): boolean {
    const { options: optionConfigs, } = this.getMetadata(context);

    const isValid = optionConfigs.every(
      ({ id, validate, }) => validate(context.nodeOptions[id])
    );

    return isValid;
  }
}
