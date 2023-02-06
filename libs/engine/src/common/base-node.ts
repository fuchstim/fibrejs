import Rule from '../rule/rule';
import { TType } from './types';

export type TNodeOptions = { [key: string]: string | number | boolean };

export enum ENodeMetadataOptionType {
  DROP_DOWN = 'DROP_DOWN',
  INPUT = 'INPUT',
}

export type TNodeMetadataOption = {
  id: string,
  name: string,
  type: ENodeMetadataOptionType,
  dropDownOptions?: { id: string, name: string }[],
  validate: (optionValue: any) => boolean,
};

export type TNodeMetadataInputOutput = {
  id: string,
  name: string,
  type: TType<any, any>,
};

export type TGetter<TContext, TReturnType> = (context: TContext) => TReturnType;
export type TOptionalGetter<TContext, TReturnType> = TReturnType | TGetter<TContext, TReturnType>;

export type TNodeContext = {
  rules: Rule[],
  nodeOptions: TNodeOptions
};
export type TNodeMetadata = {
  options: TOptionalGetter<TNodeContext, TNodeMetadataOption[]>,
  inputs: TOptionalGetter<TNodeContext, TNodeMetadataInputOutput[]>,
  outputs: TOptionalGetter<TNodeContext, TNodeMetadataInputOutput[]>,
};

export type TNodeConfig = TNodeMetadata & {
  id: string,
  name: string,
  description?: string,
};

export abstract class BaseNode<TInputs, TOutputs, TOptions extends TNodeOptions> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;

  private metadata: TNodeMetadata;

  constructor(config: TNodeConfig) {
    const { id, name, description, ...metadata } = config;

    this.id = id;
    this.name = name;
    this.description = description;

    this.metadata = metadata;
  }

  abstract execute(inputs: TInputs, options: TOptions): Promise<TOutputs> | TOutputs;

  getMetadata(context: TNodeContext) {
    const { options, inputs, outputs, } = this.metadata;

    return {
      options: typeof options === 'function' ? options(context) : options,
      inputs: typeof inputs === 'function' ? inputs(context) : inputs,
      outputs: typeof outputs === 'function' ? outputs(context) : outputs,
    };
  }

  validateOptions(options: TOptions, context: TNodeContext): boolean {
    const { options: optionConfigs, } = this.getMetadata(context);

    const isValid = Object
      .entries(options)
      .every(([ optionId, value, ]) => {
        const optionConfig = optionConfigs.find(option => option.id === optionId);
        if (!optionConfig?.validate) { return false; }

        return optionConfig.validate(value);
      });

    return isValid;
  }
}
