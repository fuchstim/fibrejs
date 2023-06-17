import z from 'zod';
import { BaseNode } from '../common/base-node';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

const INPUT_SCHEMA = z.object({
  inputA: z.boolean().nullable().describe('Input A'),
  inputB: z.boolean().nullable().describe('Input B'),
});
const OUTPUT_SCHEMA = z.object({
  result: z.boolean().describe('Result'),
});

type TNodeInputs = z.infer<typeof INPUT_SCHEMA>;
type TNodeOutputs = z.infer<typeof OUTPUT_SCHEMA>;

enum EOperation {
  NEITHER = 'NEITHER',
  EITHER = 'EITHER',
  BOTH = 'BOTH'
}
type TNodeOptions = {
  operation: EOperation
};

export default class CompareBooleansNode extends BaseNode<TNodeInputs, TNodeOutputs, TNodeOptions> {
  constructor() {
    super({
      id: 'compareBooleans',
      name: 'Compare Booleans',
      description: 'Compare boolean input A to input B',

      options: {
        operation: {
          name: 'Operation',
          type: ENodeMetadataOptionType.DROP_DOWN,
          defaultValue: EOperation.BOTH,
          dropDownOptions: [
            { id: EOperation.NEITHER, name: 'Neither', },
            { id: EOperation.EITHER, name: 'Either', },
            { id: EOperation.BOTH, name: 'Both', },
          ],
        },
      },
      inputSchema: INPUT_SCHEMA,
      outputSchema: OUTPUT_SCHEMA,
    });
  }

  execute({ inputA, inputB, }: TNodeInputs, context: TNodeExecutorContext<TNodeOptions>) {
    if (inputA === null || inputB === null) {
      return { result: false, };
    }

    const result = {
      [EOperation.NEITHER]: !inputA && !inputB,
      [EOperation.EITHER]: inputA || inputB,
      [EOperation.BOTH]: inputA && inputB,
    }[context.nodeOptions.operation];

    return { result, };
  }
}
