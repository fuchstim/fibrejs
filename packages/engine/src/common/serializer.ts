import { BaseNode } from '../common/base-node';
import { TNodeExecutorContext, TNodeMetadataOptions, ENodeMetadataOptionType } from '../types/node';
import { TSerializedNode, TSerializedNodeOption } from '../types/serializer';
import { serializeSchema } from './util';

class Serializer {
  serializeNode(node: BaseNode<any, any, any>, context: TNodeExecutorContext<any>): TSerializedNode {
    const options = node.getOptions(context);
    const { inputSchema, outputSchema, } = node.getSchemas(context);

    return {
      id: node.id,
      name: node.name,
      type: node.type,
      description: node.description,

      options: Object.entries(options).map(([ id, option, ]) => this.serializeOption(id, option)),
      inputSchema: serializeSchema(inputSchema),
      outputSchema: serializeSchema(outputSchema),
    };
  }

  private serializeOption(id: string, option: TNodeMetadataOptions<any>[string]): TSerializedNodeOption {
    const { name, type, } = option;

    if (type === ENodeMetadataOptionType.DROP_DOWN) {
      return {
        id,
        name,
        type,
        dropDownOptions: option.dropDownOptions,
      };
    }

    return {
      id,
      name,
      type,
      inputSchema: serializeSchema(option.inputSchema),
    };
  }
}

export default new Serializer();
