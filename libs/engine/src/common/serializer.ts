import { BaseNode } from '../common/base-node';
import { TNodeContext, TNodeMetadataOption, TNodeMetadataInputOutput, ENodeMetadataOptionType } from '../types/node';
import { TSerializedNode, TSerializedNodeOption, TSerializedNodeInputOutput, TSerializedType } from '../types/serializer';
import { TWrappedType, EPrimitive } from './wrapped-types';

class Serializer {
  serializeNode(node: BaseNode<any, any, any>, context: TNodeContext<any>): TSerializedNode {
    const { options, inputs, outputs, } = node.getMetadata(context);

    return {
      id: node.id,
      name: node.name,
      type: node.type,
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
    if (option.type === ENodeMetadataOptionType.DROP_DOWN) {
      const { id, name, type, dropDownOptions, } = option;

      return {
        id,
        name,
        type,
        dropDownOptions,
      };
    }

    const { id, name, type, inputOptions, } = option;

    return {
      id,
      name,
      type,
      inputOptions,
    };
  }

  private serializeInputOutput(io: TNodeMetadataInputOutput): TSerializedNodeInputOutput {
    return {
      id: io.id,
      name: io.name,
      type: this.serializeType(io.type),
    };
  }

  private serializeType(type: TWrappedType<any, any>): TSerializedType {
    const isPrimitive = Object.values(EPrimitive).includes(type.id as EPrimitive);

    if (isPrimitive) {
      return {
        id: type.id,
        name: type.name,
        isComplex: false,
        fields: Object
          .entries(type.fields)
          .reduce(
            (acc, [ key, type, ]) => ({ ...acc, [key]: type as EPrimitive, }),
            {}
          ),
      };
    }

    return {
      id: type.id,
      name: type.name,
      isComplex: true,
      fields: Object
        .entries(type.fields)
        .reduce(
          (acc, [ fieldKey, fieldType, ]) => {
            return {
              ...acc,
              [fieldKey]: this.serializeType(fieldType as TWrappedType<any, any>),
            };
          },
          {}
        ),
    };
  }
}

export default new Serializer();
