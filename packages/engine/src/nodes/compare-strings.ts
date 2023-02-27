import { BaseNode } from '../common/base-node';
import { WBooleanType, WStringType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

type TNodeInputs = {
  inputA: string | null,
  inputB: string | null,
};

type TNodeOutputs = {
  result: boolean,
};

export enum EOperation {
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
          validate: v => {
            if (!Object.values(EOperation).includes(v)) {
              return { valid: false, reason: `${v} is not a valid option`, };
            }

            return { valid: true, reason: null, };
          },
        },
      ],
      inputs: [
        { id: 'inputA', name: 'Input A', type: WStringType.nullable, },
        { id: 'inputB', name: 'Input B', type: WStringType.nullable, },
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
      [EOperation.EQUAL]: inputA === inputB,
      [EOperation.NOT_EQUAL]: inputA !== inputB,
    }[context.nodeOptions.operation];

    return { result, };
  }
}
