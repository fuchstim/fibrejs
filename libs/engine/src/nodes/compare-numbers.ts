import { BaseNode } from '../common/base-node';
import { CBooleanType, CNumberType, TBooleanType, TNumberType } from '../common/types';
import { ENodeMetadataOptionType } from '../types/node';

type TNodeInput = {
  inputA: TNumberType,
  inputB: TNumberType,
};

type TNodeOutput = {
  result: TBooleanType,
};

enum EOperation {
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  GREATER = 'GREATER',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS = 'LESS',
  LESS_EQUAL = 'LESS_EQUAL',
}
type TNodeOptions = {
  operation: EOperation
};

export default class CompareNumbersNode extends BaseNode<TNodeInput, TNodeOutput, TNodeOptions> {
  constructor() {
    super({
      id: 'compareNumbers',
      name: 'Compare Numbers',

      options: [
        {
          id: 'operation',
          name: 'Operation',
          type: ENodeMetadataOptionType.DROP_DOWN,
          dropDownOptions: [
          { id: EOperation.EQUAL, name: 'Equal', },
          { id: EOperation.NOT_EQUAL, name: 'Not Equal', },
          { id: EOperation.GREATER, name: 'Greater', },
          { id: EOperation.GREATER_EQUAL, name: 'Greater or Equal', },
          { id: EOperation.LESS, name: 'Less', },
          { id: EOperation.LESS_EQUAL, name: 'Less or Equal', },
          ],
          validate: v => Object.values(EOperation).includes(v),
        },
      ],
      inputs: [
        { id: 'inputA', name: 'Input A', type: CNumberType, },
        { id: 'inputB', name: 'Input B', type: CNumberType, },
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
      [EOperation.GREATER]: inputA.value > inputB.value,
      [EOperation.GREATER_EQUAL]: inputA.value >= inputB.value,
      [EOperation.LESS]: inputA.value < inputB.value,
      [EOperation.LESS_EQUAL]: inputA.value <= inputB.value,
    }[operation];

    return {
      result: { value: result, },
    };
  }
}
