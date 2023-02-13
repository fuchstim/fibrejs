import { BaseNode } from '../common/base-node';
import { WBooleanType, TBooleanType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

type TNodeInputs = {
  inputA: TBooleanType,
  inputB: TBooleanType,
};

type TNodeOutputs = {
  result: TBooleanType,
};

enum EOperation {
  NEITHER = 'NEITHER',
  EITHER = 'EITHER',
  BOTH = 'BOTH'
}
type TNodeOptions = {
  operation: EOperation
};

export default class CompareBooleans extends BaseNode<TNodeInputs, TNodeOutputs, TNodeOptions> {
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
          validate: v => Object.values(EOperation).includes(v),
        },
      ],
      inputs: [
        { id: 'inputA', name: 'Input A', type: WBooleanType, },
        { id: 'inputB', name: 'Input B', type: WBooleanType, },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: WBooleanType, },
      ],
    });
  }

  execute({ inputA, inputB, }: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>): TNodeOutputs {
    const result = {
      [EOperation.NEITHER]: !inputA.value && !inputB.value,
      [EOperation.EITHER]: inputA.value || inputB.value,
      [EOperation.BOTH]: inputA.value && inputB.value,
    }[context.nodeOptions.operation];

    return {
      result: { value: result, },
    };
  }
}
