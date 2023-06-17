import z from 'zod';
import { BaseNode } from '../common/base-node';
import { ENodeType } from '../types/node';

const INPUT_SCHEMA = z.object({
  result: z.boolean().nullable().describe('Result'),
});
const OUTPUT_SCHEMA = z.object({
  result: z.boolean().describe('Result'),
});

type TNodeInputs = z.infer<typeof INPUT_SCHEMA>;
type TNodeOutputs = z.infer<typeof OUTPUT_SCHEMA>;

export default class ExitNode extends BaseNode<TNodeInputs, TNodeOutputs, Record<string, never>> {
  constructor() {
    super({
      id: 'exit',
      name: 'Rule Result',
      type: ENodeType.EXIT,
      description: 'Return final rule result',

      options: {},
      inputSchema: INPUT_SCHEMA,
      outputSchema: OUTPUT_SCHEMA,
    });
  }

  execute({ result, }: TNodeInputs): TNodeOutputs {
    return { result: Boolean(result), };
  }
}
