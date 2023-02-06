import { BaseNode, ENodeMetadataOptionType } from '../common/base-node';
import { CBooleanType, TBooleanType } from '../common/types';

type TNodeInput = {
  inputA: TBooleanType,
  inputB: TBooleanType,
};

type TNodeOutput = {
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

export default class CompareBooleans extends BaseNode<TNodeInput, TNodeOutput, TNodeOptions> {
  constructor() {
    super({
      id: 'compareBooleans',
      name: 'Compare Booleans',

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
        { id: 'inputA', name: 'Input A', type: CBooleanType, },
        { id: 'inputB', name: 'Input B', type: CBooleanType, },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: CBooleanType, },
      ],
    });
  }

  execute({ inputA, inputB, }: TNodeInput, { operation, }: TNodeOptions): TNodeOutput {
    const result = {
      [EOperation.NEITHER]: !inputA.value && !inputB.value,
      [EOperation.EITHER]: inputA.value || inputB.value,
      [EOperation.BOTH]: inputA.value && inputB.value,
    }[operation];

    return {
      result: { value: result, },
    };
  }
}
