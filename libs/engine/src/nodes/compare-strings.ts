import { BaseNode, ENodeOptionType } from '../common/base-node';
import { CBooleanType, CStringType, TBooleanType, TStringType } from '../common/types';

type TNodeInput = {
  inputA: TStringType,
  inputB: TStringType,
};

type TNodeOutput = {
  result: TBooleanType,
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
      [EOperation.EQUAL]: inputA.value === inputB.value,
      [EOperation.NOT_EQUAL]: inputA.value !== inputB.value,
    }[operation];

    return {
      result: { value: result, },
    };
  }
}
