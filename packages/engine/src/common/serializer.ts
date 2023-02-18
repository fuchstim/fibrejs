import { BaseNode } from '../common/base-node';
import { TNodeExecutorContext, TNodeMetadataOption, TNodeMetadataInputOutput, ENodeMetadataOptionType } from '../types/node';
import { TSerializedNode, TSerializedNodeOption, TSerializedNodeInputOutput, TSerializedType } from '../types/serializer';
import { TWrappedType, EPrimitive, TWrappedPrimitive } from './wrapped-types';

class Serializer {
  serializeNode(node: BaseNode<any, any, any>, context: TNodeExecutorContext<any>): TSerializedNode {
    const { defaultOptions, options, inputs, outputs, } = node.getMetadata(context);

    return {
      id: node.id,
      name: node.name,
      type: node.type,
      description: node.description,

      defaultOptions,
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

  private serializeType(type: TWrappedType<any, any> | TWrappedPrimitive<any, any>): TSerializedType {
    const isPrimitive = (type: TWrappedType<any, any> | TWrappedPrimitive<any, any>): type is TWrappedPrimitive<any, any> => (
      Object.values(EPrimitive).includes(type.id as EPrimitive)
    );

    if (isPrimitive(type)) {
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
              [fieldKey]: this.serializeType(fieldType),
            };
          },
          {}
        ),
    };
  }
}

export default new Serializer();
