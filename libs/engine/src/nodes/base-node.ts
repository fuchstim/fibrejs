import { EPrimitive, TSerializedType, TType } from '../constants/types';

type TNodeInputOutput = {
  id: string,
  name: string,
  type: TType<any, any>,
};

type TNodeConfig = {
  id: string,
  name: string,
  description?: string,
  inputs: TNodeInputOutput[],
  outputs: TNodeInputOutput[],
};

type TSerializedNodeInputOutput = {
  id: string,
  name: string,
  type: TSerializedType,
};

type TSerializedNode = {
  id: string,
  name: string,
  description?: string,
  inputs: TSerializedNodeInputOutput[],
  outputs: TSerializedNodeInputOutput[],
};

export abstract class BaseNode<TInput, TOutput> {
  readonly id: string;
  private name: string;
  private description?: string;
  private inputs: TNodeInputOutput[];
  private outputs: TNodeInputOutput[];

  constructor(options: TNodeConfig) {
    this.id = options.id;
    this.name = options.name;
    this.description = options.description;
    this.inputs = options.inputs;
    this.outputs = options.outputs;
  }

  abstract execute(input: TInput): Promise<TOutput> | TOutput;

  serialize(): TSerializedNode {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      inputs: this.inputs.map(
        input => this.serializeInputOutput(input)
      ),
      outputs: this.outputs.map(
        output => this.serializeInputOutput(output)
      ),
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
