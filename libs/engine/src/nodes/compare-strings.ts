import { BaseNode } from '../common/base-node';
import { WBooleanType, WStringType, TBooleanType, TStringType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

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

      options: [
        {
          id: 'operation',
          name: 'Operation',
          type: ENodeMetadataOptionType.DROP_DOWN,
          dropDownOptions: [
            { id: EOperation.EQUAL, name: 'Equal', },
            { id: EOperation.NOT_EQUAL, name: 'Not Equal', },
          ],
          validate: v => Object.values(EOperation).includes(v),
        },
      ],
      inputs: [
        { id: 'inputA', name: 'Input A', type: WStringType, },
        { id: 'inputB', name: 'Input B', type: WStringType, },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: WBooleanType, },
      ],
    });
  }

  execute({ inputA, inputB, }: TNodeInput, context: TNodeExecutorContext<TNodeOptions>): TNodeOutput {
    const result = {
      [EOperation.EQUAL]: inputA.value === inputB.value,
      [EOperation.NOT_EQUAL]: inputA.value !== inputB.value,
    }[context.nodeOptions.operation];

    return {
      result: { value: result, },
    };
  }
}
