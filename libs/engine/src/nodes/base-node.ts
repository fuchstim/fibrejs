import { EPrimitive, TSerializedType, TType } from '../constants/types';

export enum ENodeOptionType {
  DROP_DOWN = 'DROP_DOWN',
  INPUT = 'INPUT',
}

export type TDropDownOption = {
  id: string,
  name: string,
};

export type TNodeOption = {
  id: string,
  name: string,
  type: ENodeOptionType,
  dropDownOptions?: TDropDownOption[],
  validate: (v: any) => boolean,
};

export type TNodeInputOutput = {
  id: string,
  name: string,
  type: TType<any, any>,
};

export type TNodeConfig = {
  id: string,
  name: string,
  description?: string,

  options: TNodeOption[],
  inputs: TNodeInputOutput[],
  outputs: TNodeInputOutput[],
};

export type TSerializedNodeOption = {
  id: string,
  name: string,
  type: ENodeOptionType,
  dropDownOptions?: TDropDownOption[],
};

export type TSerializedNodeInputOutput = {
  id: string,
  name: string,
  type: TSerializedType,
};

export type TSerializedNode = {
  id: string,
  name: string,
  description?: string,

  options: TSerializedNodeOption[],
  inputs: TSerializedNodeInputOutput[],
  outputs: TSerializedNodeInputOutput[],
};

export abstract class BaseNode<TInput, TOutput, TOptions> {
  readonly id: string;
  private name: string;
  private description?: string;

  private options: TNodeOption[];
  private inputs: TNodeInputOutput[];
  private outputs: TNodeInputOutput[];

  constructor(config: TNodeConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;

    this.options = config.options;
    this.inputs = config.inputs;
    this.outputs = config.outputs;
  }

  abstract execute(input: TInput, options: TOptions): Promise<TOutput> | TOutput;

  serialize(): TSerializedNode {
    return {
      id: this.id,
      name: this.name,
      description: this.description,

      options: this.options.map(
        option => this.serializeOption(option)
      ),
      inputs: this.inputs.map(
        input => this.serializeInputOutput(input)
      ),
      outputs: this.outputs.map(
        output => this.serializeInputOutput(output)
      ),
    };
  }

  private serializeOption(option: TNodeOption): TSerializedNodeOption {
    const { id, name, type, dropDownOptions, } = option;

    return {
      id,
      name,
      type,
      dropDownOptions,
    };
  }

  private serializeInputOutput(io: TNodeInputOutput): TSerializedNodeInputOutput {
    return {
      id: io.id,
      name: io.name,
      type: this.serializeType(io.type),
    };
  }

  private serializeType(type: TType<any, any>): TSerializedType {
    return {
      name: type.name,
      fields: Object
        .entries(type.fields)
        .reduce(
          (acc, [ fieldKey, fieldType, ]) => {
            const isPrimitive = Object.values(EPrimitive).includes(fieldType as EPrimitive);

            return {
              ...acc,
              [fieldKey]: isPrimitive ? fieldType as EPrimitive : this.serializeType(fieldType as TType<any, any>),
            };
          },
          {}
        ),
    };
  }
}
export default BaseNode;
