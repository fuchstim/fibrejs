import { BaseNode } from '../common/base-node';
import { WBooleanType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

type TNodeInputs = {
  inputA: boolean | null,
  inputB: boolean | null,
};

type TNodeOutputs = {
  result: boolean,
};

export enum EOperation {
  NEITHER = 'NEITHER',
  EITHER = 'EITHER',
  BOTH = 'BOTH'
}
type TNodeOptions = {
  operation: EOperation
};

export default class CompareBooleansNode extends BaseNode<TNodeInputs, TNodeOutputs, TNodeOptions> {
  constructor() {
    super({
      id: 'compareBooleans',
      name: 'Compare Booleans',
      description: 'Compare boolean input A to input B',

      defaultOptions: {
        operation: EOperation.BOTH,
      },
      options: [
        {
          id: 'operation',
          name: 'Operation',
          type: ENodeMetadataOptionType.DROP_DOWN,
          dropDownOptions: [
            { id: EOperation.NEITHER, name: 'Neither', },
            { id: EOperation.EITHER, name: 'Either', },
            { id: EOperation.BOTH, name: 'Both', },
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
        { id: 'inputA', name: 'Input A', type: WBooleanType.nullable, },
        { id: 'inputB', name: 'Input B', type: WBooleanType.nullable, },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: WBooleanType, },
      ],
    });
  }

  execute({ inputA, inputB, }: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>): TNodeOutputs {
    if (inputA === null || inputB === null) {
      return { result: false, };
    }

    const result = {
      [EOperation.NEITHER]: !inputA && !inputB,
      [EOperation.EITHER]: inputA || inputB,
      [EOperation.BOTH]: inputA && inputB,
    }[context.nodeOptions.operation];

    return { result, };
  }
}
