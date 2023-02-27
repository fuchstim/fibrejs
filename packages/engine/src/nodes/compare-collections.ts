import { BaseNode } from '../common/base-node';
import { WBooleanType, WStringType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

type TNodeInputs = {
  inputA: string[],
  inputB: string | null,
};

type TNodeOutputs = {
  result: boolean,
};

export enum EOperation {
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
          validate: v => {
            if (!Object.values(EOperation).includes(v)) {
              return { valid: false, reason: `${v} is not a valid option`, };
            }

            return { valid: true, reason: null, };
          },
        },
      ],
      inputs: [
        { id: 'inputA', name: 'Input A', type: WStringType.collection, },
        { id: 'inputB', name: 'Input B', type: WStringType.nullable, },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: WBooleanType, },
      ],
    });
  }

  execute({ inputA, inputB, }: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>): TNodeOutputs {
    if (inputB === null) {
      return { result: false, };
    }

    const result = {
      [EOperation.INCLUDES]: inputA.includes(inputB),
      [EOperation.NOT_INCLUDES]: !inputA.includes(inputB),
    }[context.nodeOptions.operation];

    return { result, };
  }
}
