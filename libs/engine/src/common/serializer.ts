import { BaseNode } from '../common/base-node';
import { TNodeContext, TNodeMetadataOption, TNodeMetadataInputOutput } from '../types/node';
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

  private serializeType(type: TWrappedType<any, any>): TSerializedType {
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
              [fieldKey]: isPrimitive ? fieldType as EPrimitive : this.serializeType(fieldType as TWrappedType<any, any>),
            };
          },
          {}
        ),
    };
  }
}

export default new Serializer();
