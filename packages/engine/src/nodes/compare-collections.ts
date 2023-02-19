import { BaseNode } from '../common/base-node';
import { WBooleanType, WStringType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

type TNodeInputs = {
  inputA: string[],
  inputB: string,
};

type TNodeOutputs = {
  result: boolean,
};

enum EOperation {
  INCLUDES = 'INCLUDES',
  NOT_INCLUDES = 'NOT_INCLUDES',
}
type TNodeOptions = {
  operation: EOperation
};

export default class CompareCollectionsNode extends BaseNode<TNodeInputs, TNodeOutputs, TNodeOptions> {
  constructor() {
    super({
      id: 'compareCollections',
      name: 'Compare Collections',
      description: 'Compare collections A and B',

      defaultOptions: {
        operation: EOperation.INCLUDES,
      },
      options: [
        {
          id: 'operation',
          name: 'Operation',
          type: ENodeMetadataOptionType.DROP_DOWN,
          dropDownOptions: [
            { id: EOperation.INCLUDES, name: 'Includes', },
            { id: EOperation.NOT_INCLUDES, name: 'Does not include', },
          ],
          validate: v => Object.values(EOperation).includes(v),
        },
      ],
      inputs: [
        { id: 'inputA', name: 'Input A', type: WStringType.collection, },
        { id: 'inputB', name: 'Input B', type: WStringType, },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: WBooleanType, },
      ],
    });
  }

  execute({ inputA, inputB, }: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>): TNodeOutputs {
    const result = {
      [EOperation.INCLUDES]: inputA.includes(inputB),
      [EOperation.NOT_INCLUDES]: !inputA.includes(inputB),
    }[context.nodeOptions.operation];

    return { result, };
  }
}
