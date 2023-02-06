import BaseNode, { ENodeOptionType } from './base';
import { CBooleanType, CStringType } from '../constants/types';

type TNodeInput = {
  inputA: string,
  inputB: string,
};

type TNodeOutput = {
  result: boolean,
};

enum EOperation {
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
}
type TNodeOptions = {
  operation: EOperation
};

export default class CompareStringsNode extends BaseNode<TNodeInput, TNodeOutput, TNodeOptions> {
  constructor() {
    super({
      id: 'compareStrings',
      name: 'Compare Strings',

      options: [ {
        id: 'operation',
        name: 'Operation',
        type: ENodeOptionType.DROP_DOWN,
        dropDownOptions: [
          { id: EOperation.EQUAL, name: 'Equal', },
          { id: EOperation.NOT_EQUAL, name: 'Not Equal', },
        ],
        validate: v => Object.values(EOperation).includes(v),
      }, ],
      inputs: [
        { id: 'inputA', name: 'Input A', type: CStringType, },
        { id: 'inputB', name: 'Input B', type: CStringType, },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: CBooleanType, },
      ],
    });
  }

  execute({ inputA, inputB, }: TNodeInput, { operation, }: TNodeOptions): TNodeOutput {
    const result = {
      [EOperation.EQUAL]: inputA === inputB,
      [EOperation.NOT_EQUAL]: inputA !== inputB,
    }[operation];

    return { result, };
  }
}
