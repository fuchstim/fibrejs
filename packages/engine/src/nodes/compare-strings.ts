import { BaseNode } from '../common/base-node';
import { WBooleanType, WStringType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

type TNodeInputs = {
  inputA: string,
  inputB: string,
};

type TNodeOutputs = {
  result: boolean,
};

enum EOperation {
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
}
type TNodeOptions = {
  operation: EOperation
};

export default class CompareStringsNode extends BaseNode<TNodeInputs, TNodeOutputs, TNodeOptions> {
  constructor() {
    super({
      id: 'compareStrings',
      name: 'Compare Strings',
      description: 'Compare string input A to input B',

      defaultOptions: {
        operation: EOperation.EQUAL,
      },
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

  execute({ inputA, inputB, }: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>): TNodeOutputs {
    const result = {
      [EOperation.EQUAL]: inputA === inputB,
      [EOperation.NOT_EQUAL]: inputA !== inputB,
    }[context.nodeOptions.operation];

    return { result, };
  }
}
