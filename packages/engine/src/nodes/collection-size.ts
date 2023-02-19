import { BaseNode } from '../common/base-node';
import { WNumberType, WStringType } from '../common/wrapped-types';

type TNodeInputs = {
  input: string[],
};

type TNodeOutputs = {
  size: number,
};

export default class CollectionSizeNode extends BaseNode<TNodeInputs, TNodeOutputs, Record<string, never>> {
  constructor() {
    super({
      id: 'collectionSize',
      name: 'Collection Size',
      description: 'Calculate size of collection',

      defaultOptions: {},
      options: [],
      inputs: [
        { id: 'input', name: 'Input', type: WStringType.collection, },
      ],
      outputs: [
        { id: 'size', name: 'Size', type: WNumberType, },
      ],
    });
  }

  execute({ input, }: TNodeInputs): TNodeOutputs {
    return { size: input.length, };
  }
}
