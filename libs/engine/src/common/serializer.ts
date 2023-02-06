import { BaseNode, ENodeMetadataOptionType, TNodeContext, TNodeMetadataInputOutput, TNodeMetadataOption } from './base-node';
import { EPrimitive, TType } from './types';

type TSerializedType = {
  id: string,
  name: string,
  fields: { [key: string]: EPrimitive | TSerializedType, },
};

type TSerializedNodeOption = {
  id: string,
  name: string,
  type: ENodeMetadataOptionType,
  dropDownOptions?: { id: string, name: string }[],
};

type TSerializedNodeInputOutput = {
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

class Serializer {
  serializeNode(node: BaseNode<any, any, any>, context: TNodeContext): TSerializedNode {
    const { options, inputs, outputs, } = node.getMetadata(context);

    return {
      id: node.id,
      name: node.name,
      description: node.description,

      options: options.map(
        option => this.serializeOption(option)
      ),
      inputs: inputs.map(
        input => this.serializeInputOutput(input)
      ),
      outputs: outputs.map(
        output => this.serializeInputOutput(output)
      ),
    };
  }

  private serializeOption(option: TNodeMetadataOption): TSerializedNodeOption {
    const { id, name, type, dropDownOptions, } = option;

    return {
      id,
      name,
      type,
      dropDownOptions,
    };
  }

  private serializeInputOutput(io: TNodeMetadataInputOutput): TSerializedNodeInputOutput {
    return {
      id: io.id,
      name: io.name,
      type: this.serializeType(io.type),
    };
  }

  private serializeType(type: TType<any, any>): TSerializedType {
    return {
      id: type.id,
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

export default new Serializer();
