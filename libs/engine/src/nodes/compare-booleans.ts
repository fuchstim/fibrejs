import BaseNode, { ENodeOptionType } from './base';
import { CBooleanType } from '../constants/types';

type TNodeInput = {
  inputA: boolean,
  inputB: boolean,
};

type TNodeOutput = {
  result: boolean,
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

      options: [ {
        id: 'operation',
        name: 'Operation',
        type: ENodeOptionType.DROP_DOWN,
        dropDownOptions: [
          { id: EOperation.NEITHER, name: 'Neither', },
          { id: EOperation.EITHER, name: 'Either', },
          { id: EOperation.BOTH, name: 'Both', },
        ],
        validate: v => Object.values(EOperation).includes(v),
      }, ],
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
      [EOperation.NEITHER]: !inputA && !inputB,
      [EOperation.EITHER]: inputA || inputB,
      [EOperation.BOTH]: inputA && inputB,
    }[operation];

    return { result, };
  }
}
