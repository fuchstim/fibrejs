import z from 'zod';
import { BaseNode } from '../common/base-node';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

const INPUT_SCHEMA = z.object({
  inputA: z.string().nullable().describe('Input A'),
  inputB: z.string().nullable().describe('Input B'),
});
const OUTPUT_SCHEMA = z.object({
  result: z.boolean().describe('Result'),
});

type TNodeInputs = z.infer<typeof INPUT_SCHEMA>;
type TNodeOutputs = z.infer<typeof OUTPUT_SCHEMA>;

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
        },
      ],
      inputSchema: INPUT_SCHEMA,
      outputSchema: OUTPUT_SCHEMA,
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
