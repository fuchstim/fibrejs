import { BaseNode } from '../common/base-node';
import { WBooleanType, WNumberType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

type TNodeInputs = {
  inputA: number,
  inputB: number,
  inputC: number,
};

type TNodeOutputs = {
  result: boolean,
};

enum EOperation {
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  GREATER = 'GREATER',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS = 'LESS',
  LESS_EQUAL = 'LESS_EQUAL',
  BETWEEN = 'BETWEEN',
}
type TNodeOptions = {
  operation: EOperation
};

export default class CompareNumbersNode extends BaseNode<TNodeInputs, TNodeOutputs, TNodeOptions> {
  constructor() {
    super({
      id: 'compareNumbers',
      name: 'Compare Numbers',
      description: 'Compare number input A to input B',

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
            { id: EOperation.GREATER, name: 'Greater', },
            { id: EOperation.GREATER_EQUAL, name: 'Greater or Equal', },
            { id: EOperation.LESS, name: 'Less', },
            { id: EOperation.LESS_EQUAL, name: 'Less or Equal', },
            { id: EOperation.BETWEEN, name: 'Between (exclusive)', },
          ],
          validate: v => {
            if (!Object.values(EOperation).includes(v)) {
              return { valid: false, reason: `${v} is not a valid option`, };
            }

            return { valid: true, reason: null, };
          },
        },
      ],
      inputs: context => {
        const inputs = [
          { id: 'inputA', name: 'Input A', type: WNumberType, },
          { id: 'inputB', name: 'Input B', type: WNumberType, },
        ];

        if (context.nodeOptions.operation === EOperation.BETWEEN) {
          inputs.push({ id: 'inputC', name: 'Input C', type: WNumberType, });
        }

        return inputs;
      },
      outputs: [
        { id: 'result', name: 'Result', type: WBooleanType, },
      ],
    });
  }

  execute({ inputA, inputB, inputC, }: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>): TNodeOutputs {
    const result = {
      [EOperation.EQUAL]: inputA === inputB,
      [EOperation.NOT_EQUAL]: inputA !== inputB,
      [EOperation.GREATER]: inputA > inputB,
      [EOperation.GREATER_EQUAL]: inputA >= inputB,
      [EOperation.LESS]: inputA < inputB,
      [EOperation.LESS_EQUAL]: inputA <= inputB,
      [EOperation.BETWEEN]: inputA > inputB && inputA < inputC,
    }[context.nodeOptions.operation];

    return { result, };
  }
}
