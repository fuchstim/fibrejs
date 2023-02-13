import { TExecutorValidationResult } from '../types/common';
import { TNodeOptions, TNodeConfig, TNodeExecutorContext, TNodeMetadata, ENodeType } from '../types/node';
import Executor from './executor';
import { detectDuplicates } from './util';
import { EPrimitive } from './wrapped-types';

// eslint-disable-next-line max-len
export abstract class BaseNode<TInputs extends Record<string, any>, TOutputs extends Record<string, any>, TOptions extends TNodeOptions> extends Executor<TInputs, TOutputs, TNodeExecutorContext<TOptions>> {
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

  override validateContext(context: TNodeExecutorContext<TOptions>): TExecutorValidationResult<TNodeExecutorContext<TOptions>> {
    const { options: optionConfigs, inputs, outputs, } = this.getMetadata(context);

    if (this.type === ENodeType.EXIT) {
      const validExitNodeOutputConfig = (
        outputs.length === 1
        && outputs[0].id === 'result'
        && Object.values(EPrimitive).includes(outputs[0].type.id as EPrimitive)
      );

      if (!validExitNodeOutputConfig) {
        return {
          valid: false,
          reason: 'Invalid exit node output config',
          actual: context,
        };
      }
    }

    const duplicateInputIds = detectDuplicates(inputs);
    if (duplicateInputIds.length) {
      return {
        valid: false,
        reason: `Duplicate input ids: ${duplicateInputIds.join(', ')}`,
        actual: context,
      };
    }

    const duplicateOutputIds = detectDuplicates(outputs);
    if (duplicateOutputIds.length) {
      return {
        valid: false,
        reason: `Duplicate output ids: ${duplicateOutputIds.join(', ')}`,
        actual: context,
      };
    }

    const invalidOptionConfigs = optionConfigs.filter(
      ({ id, validate, }) => !validate(context.nodeOptions[id])
    );
    if (invalidOptionConfigs.length) {
      return {
        valid: false,
        reason: `Invalid option configs: ${invalidOptionConfigs.map(c => `${c.name} (${c.id})`).join(', ')}`,
        actual: context,
      };
    }

    return {
      valid: true,
      reason: null,
      actual: context,
    };
  }

  override validateInputs(inputValues: TInputs, context: TNodeExecutorContext<TOptions>): TExecutorValidationResult<TInputs> {
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
        actual: inputValues,
        expected: inputs.reduce(
          (acc, { id, type, }) => ({ ...acc, [id]: type, }),
          {}
        ),
      };
    }

    return {
      valid: true,
      reason: null,
      actual: inputValues,
      expected: inputs.reduce(
        (acc, { id, type, }) => ({ ...acc, [id]: type, }),
        {}
      ),
    };
  }

  override validateOutputs(outputValues: TOutputs, context: TNodeExecutorContext<TOptions>): TExecutorValidationResult<TOutputs> {
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
        actual: outputValues,
        expected: outputs.reduce(
          (acc, { id, type, }) => ({ ...acc, [id]: type, }),
          {}
        ),
      };
    }

    return {
      valid: true,
      reason: null,
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
}
