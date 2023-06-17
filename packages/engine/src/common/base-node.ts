import { fromZodError } from 'zod-validation-error';
import { TValidationResult } from '../types/common';
import { TNodeOptions, TNodeConfig, TNodeExecutorContext, TNodeMetadata, ENodeType } from '../types/node';
import Executor from './executor';
import { ZodString } from 'zod';
import { validateAgainstSchema } from './util';

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
    const { options, outputSchema, } = this.getMetadata(context);

    if (this.type === ENodeType.EXIT) {
      // TODO: Support more flexible exit node output types
      const validExitNodeOutputConfig = (
        Object.keys(outputSchema.shape).length === 1
        && outputSchema.shape.result instanceof ZodString
      );

      if (!validExitNodeOutputConfig) {
        return {
          valid: false,
          reason: 'Invalid exit node output config',
        };
      }
    }

    const optionValidationErrors = options
      .map(option => ({
        option,
        result: option.validate(context.nodeOptions[option.id]),
      }))
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

  override validateInputs(inputs: TInputs, context: TNodeExecutorContext<TOptions>): TValidationResult {
    const { inputSchema, } = this.getMetadata(context);

    return validateAgainstSchema(inputSchema, inputs, { prefix: 'Invalid node inputs', });
  }

  override validateOutputs(outputs: TOutputs, context: TNodeExecutorContext<TOptions>): TValidationResult {
    const { outputSchema, } = this.getMetadata(context);

    return validateAgainstSchema(outputSchema, outputs, { prefix: 'Invalid node outputs', });
  }

  getDefaultOptions() {
    return this.metadata.defaultOptions;
  }

  getMetadata(context: TNodeExecutorContext<TOptions>) {
    const { defaultOptions, options, inputSchema, outputSchema, } = this.metadata;

    return {
      defaultOptions,
      options: typeof options === 'function' ? options(context) : options,
      inputSchema: typeof inputSchema === 'function' ? inputSchema(context) : inputSchema,
      outputSchema: typeof outputSchema === 'function' ? outputSchema(context) : outputSchema,
    };
  }
}
