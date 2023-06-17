import { TOptional, TValidationResult } from '../types/common';
import { TNodeOptions, TNodeConfig, TNodeExecutorContext, ENodeType, TNodeMetadataOptions, ENodeMetadataOptionType } from '../types/node';
import Executor from './executor';
import z, { ZodString } from 'zod';
import { validateAgainstSchema } from './util';

export abstract class BaseNode<
  TInputs extends Record<string, any>,
  TOutputs extends Record<string, any>,
  TOptions extends TNodeOptions
> extends Executor<TInputs, TOutputs, TNodeExecutorContext<TOptions>> {
  readonly id: TNodeConfig<TOptions>['id'];
  readonly name: TNodeConfig<TOptions>['name'];
  readonly type?: TNodeConfig<TOptions>['type'];
  readonly description: TNodeConfig<TOptions>['description'];

  private readonly options: TNodeConfig<TOptions>['options'];
  private readonly inputSchema: TNodeConfig<TOptions>['inputSchema'];
  private readonly outputSchema: TNodeConfig<TOptions>['outputSchema'];

  constructor(config: TNodeConfig<TOptions>) {
    super(config.id, 'node');

    const { id, name, description, type, options, inputSchema, outputSchema, } = config;

    this.id = id;
    this.name = name;
    this.type = type;
    this.description = description;

    this.options = options;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
  }

  override validateContext(context: TNodeExecutorContext<TOptions>): TValidationResult {
    const options = this.getOptions(context);
    const { outputSchema, } = this.getSchemas(context);

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

    const optionValidationErrors = Object.entries(options)
      .map(([ id, option, ]) => this.validateOption(option, context.nodeOptions[id]))
      .filter(result => !result.valid);
    if (optionValidationErrors.length) {
      return {
        valid: false,
        reason: `Invalid option configs: ${optionValidationErrors.map(e => e.reason).join(', ')}`,
      };
    }

    return {
      valid: true,
      reason: null,
    };
  }

  override validateInputs(inputs: TInputs, context: TNodeExecutorContext<TOptions>): TValidationResult {
    const { inputSchema, } = this.getSchemas(context);

    return validateAgainstSchema(inputSchema, inputs, { prefix: 'Invalid node inputs', });
  }

  override validateOutputs(outputs: TOutputs, context: TNodeExecutorContext<TOptions>): TValidationResult {
    const { outputSchema, } = this.getSchemas(context);

    return validateAgainstSchema(outputSchema, outputs, { prefix: 'Invalid node outputs', });
  }

  getOptions(context: TOptional<TNodeExecutorContext<TOptions>, 'nodeOptions'>) {
    const options = typeof this.options === 'function' ? this.options(context) : this.options;

    return options;
  }

  getDefaultOptions(context: TOptional<TNodeExecutorContext<TOptions>, 'nodeOptions'>) {
    const options = this.getOptions(context);

    return Object.entries(options)
      .reduce(
        (acc, [ optionId, { defaultValue, }, ]) => ({ ...acc, [optionId]: defaultValue, }),
        {} as { [K in keyof TOptions]: TOptions[K] }
      );
  }

  getSchemas(context: TNodeExecutorContext<TOptions>) {
    const inputSchema = typeof this.inputSchema === 'function' ? this.inputSchema(context) : this.inputSchema;
    const outputSchema = typeof this.outputSchema === 'function' ? this.outputSchema(context) : this.outputSchema;

    return { inputSchema, outputSchema, };
  }

  private validateOption(option: TNodeMetadataOptions<TNodeOptions>[string], value: any): TValidationResult {
    const errorPrefix = `Invalid value for option "${option.name}"`;

    if (option.type === ENodeMetadataOptionType.DROP_DOWN) {
      const allowedValues = option.dropDownOptions.map(o => o.id);

      const schema = z.enum([ allowedValues[0], ...allowedValues.slice(1), ]);

      return validateAgainstSchema(schema, value, { prefix: errorPrefix, });
    }

    if (option.type === ENodeMetadataOptionType.INPUT) {
      return validateAgainstSchema(option.inputSchema, value, { prefix: errorPrefix, });
    }

    return { valid: false, reason: 'Unknown option type', };
  }
}
