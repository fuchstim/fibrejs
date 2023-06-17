import { BaseNode } from '../common/base-node';
import { TNodeExecutorContext, TNodeMetadataOption, ENodeMetadataOptionType } from '../types/node';
import { TSerializedNode, TSerializedNodeOption } from '../types/serializer';
import { serializeSchema } from './util';

class Serializer {
  serializeNode(node: BaseNode<any, any, any>, context: TNodeExecutorContext<any>): TSerializedNode {
    const { defaultOptions, options, inputSchema, outputSchema, } = node.getMetadata(context);

    return {
      id: node.id,
      name: node.name,
      type: node.type,
      description: node.description,

      defaultOptions,
      options: options.map(option => this.serializeOption(option)),
      inputSchema: serializeSchema(inputSchema),
      outputSchema: serializeSchema(outputSchema),
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

    const { id, name, type, inputSchema, } = option;

    return {
      id,
      name,
      type,
      inputSchema: serializeSchema(inputSchema),
    };
  }
}

export default new Serializer();
