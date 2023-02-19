import { BaseNode } from '../common/base-node';
import { TNodeExecutorContext, TNodeMetadataOption, TNodeMetadataInputOutput, ENodeMetadataOptionType } from '../types/node';
import { TSerializedNode, TSerializedNodeOption, TSerializedNodeInputOutput, TSerializedType } from '../types/serializer';
import { WrappedType, ETypeCategory, WrappedComplex } from './wrapped-types';

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

  private serializeType(type: WrappedType<any, any>): TSerializedType {
    if (!(type instanceof WrappedComplex<any, any>)) {
      return {
        id: type.id,
        name: type.name,
        category: type.category as ETypeCategory.PRIMITIVE | ETypeCategory.COLLECTION,
      };
    }

    return {
      id: type.id,
      name: type.name,
      category: ETypeCategory.COMPLEX,
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
