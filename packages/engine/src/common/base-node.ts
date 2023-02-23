import { TValidationResult } from '../types/common';
import { TNodeOptions, TNodeConfig, TNodeExecutorContext, TNodeMetadata, ENodeType } from '../types/node';
import Executor from './executor';
import { detectDuplicates } from './util';
import { EPrimitive } from './wrapped-types';

export abstract class BaseNode<
  TInputs extends Record<string, any>,
  TOutputs extends Record<string, any>,
  TOptions extends TNodeOptions
> extends Executor<TInputs, TOutputs, TNodeExecutorContext<TOptions>> {
  readonly id: string;
  readonly name: string;
  readonly type?: ENodeType;
  readonly description: string;

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

  override validateContext(context: TNodeExecutorContext<TOptions>): TValidationResult {
    const { options: optionConfigs, inputs, outputs, } = this.getMetadata(context);

    if (this.type === ENodeType.EXIT) {
      // TODO: Support more flexible exit node output types
      const validExitNodeOutputConfig = (
        outputs.length === 1
        && outputs[0].id === 'result'
        && Object.values(EPrimitive).includes(outputs[0].type.id as EPrimitive)
      );

      if (!validExitNodeOutputConfig) {
        return {
          valid: false,
          reason: 'Invalid exit node output config',
        };
      }
    }

    const duplicateInputIds = detectDuplicates(inputs);
    if (duplicateInputIds.length) {
      return {
        valid: false,
        reason: `Duplicate input ids: ${duplicateInputIds.join(', ')}`,
      };
    }

    const duplicateOutputIds = detectDuplicates(outputs);
    if (duplicateOutputIds.length) {
      return {
        valid: false,
        reason: `Duplicate output ids: ${duplicateOutputIds.join(', ')}`,
      };
    }

    const optionValidationErrors = optionConfigs
      .map(
        option => ({ option, result: option.validate(context.nodeOptions[option.id]), })
      )
      .filter(({ result, }) => !result.valid);
    if (optionValidationErrors.length) {
      return {
        valid: false,
        reason: `Invalid option configs: ${optionValidationErrors.map(e => `${e.option.name} (${e.result.reason})`).join(', ')}`,
      };
    }

    return {
      valid: true,
      reason: null,
    };
  }

  override validateInputs(inputValues: TInputs, context: TNodeExecutorContext<TOptions>): TValidationResult {
    const { inputs, } = this.getMetadata(context);

    const inputValidationErrors = inputs
      .map(
        input => ({ input, result: input.type.validate(inputValues[input.id]), })
      )
      .filter(({ result, }) => !result.valid);

    if (inputValidationErrors.length) {
      return {
        valid: false,
        reason: `Invalid inputs for values: ${inputValidationErrors.map(e => `${e.input.id} (${e.result.reason})`).join(', ')}}`,
      };
    }

    return {
      valid: true,
      reason: null,
    };
  }

  override validateOutputs(outputValues: TOutputs, context: TNodeExecutorContext<TOptions>): TValidationResult {
    const { outputs, } = this.getMetadata(context);

    const outputValidationErrors = outputs
      .map(
        output => ({ output, result: output.type.validate(outputValues[output.id]), })
      )
      .filter(({ result, }) => !result.valid);

    if (outputValidationErrors.length) {
      return {
        valid: false,
        reason: `Invalid outputs for values: ${outputValidationErrors.map(e => `${e.output.id} (${e.result.reason})`).join(', ')}}`,
      };
    }

    return {
      valid: true,
      reason: null,
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
}
