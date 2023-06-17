import z from 'zod';
import { BaseNode } from '../common/base-node';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

const INPUT_SCHEMA = z.object({
  inputA: z.number().nullable().describe('Input A'),
  inputB: z.number().nullable().describe('Input B'),
  inputC: z.number().nullable().describe('Input C'),
});
const OUTPUT_SCHEMA = z.object({
  result: z.boolean().describe('Result'),
});

type TNodeInputs = z.infer<typeof INPUT_SCHEMA>;
type TNodeOutputs = z.infer<typeof OUTPUT_SCHEMA>;

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

      options: {
        operation: {
          name: 'Operation',
          type: ENodeMetadataOptionType.DROP_DOWN,
          defaultValue: EOperation.EQUAL,
          dropDownOptions: [
            { id: EOperation.EQUAL, name: 'Equal', },
            { id: EOperation.NOT_EQUAL, name: 'Not Equal', },
            { id: EOperation.GREATER, name: 'Greater', },
            { id: EOperation.GREATER_EQUAL, name: 'Greater or Equal', },
            { id: EOperation.LESS, name: 'Less', },
            { id: EOperation.LESS_EQUAL, name: 'Less or Equal', },
            { id: EOperation.BETWEEN, name: 'Between (exclusive)', },
          ],
        },
      },
      inputSchema: context => INPUT_SCHEMA.omit({
        inputC: context.nodeOptions.operation !== EOperation.BETWEEN || undefined,
      }),
      outputSchema: OUTPUT_SCHEMA,
    });
  }

  execute({ inputA, inputB, inputC, }: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>): TNodeOutputs {
    if (inputA === null || inputB === null || inputC === null) {
      return { result: false, };
    }

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
