import z, { ZodSchema } from 'zod';
import { BaseNode } from '../common/base-node';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';
import { validateAgainstSchema } from '../common/util';

const INPUT_SCHEMA = z.object({});

const OUTPUT_SCHEMA = z.object({
  value: z
    .union([
      z.string(),
      z.string().array(),
      z.number(),
      z.number().array(),
      z.boolean(),
      z.boolean().array(),
    ])
    .describe('Value'),
});

type TNodeInputs = z.infer<typeof INPUT_SCHEMA>;
type TNodeOutputs = z.infer<typeof OUTPUT_SCHEMA>;

enum EValueType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
}

type TNodeOptions = {
  valueType: EValueType,
  isCollection: boolean,
  value: string | number | boolean,
};

export default class StaticValueNode extends BaseNode<TNodeInputs, TNodeOutputs, TNodeOptions> {
  constructor() {
    super({
      id: 'staticValue',
      name: 'Static Value',
      description: 'Define a static value',

      defaultOptions: {
        valueType: EValueType.STRING,
        isCollection: false,
        value: '',
      },
      options: context => ([
        {
          id: 'valueType',
          name: 'Value Type',
          type: ENodeMetadataOptionType.DROP_DOWN,
          dropDownOptions: [
            { id: EValueType.STRING, name: 'String', },
            { id: EValueType.NUMBER, name: 'Number', },
            { id: EValueType.BOOLEAN, name: 'Boolean', },
          ],
          validate: v => {
            if (!Object.values(EValueType).includes(v)) {
              return { valid: false, reason: `${v} is not a valid option`, };
            }

            return { valid: true, reason: null, };
          },
        },
        {
          id: 'isCollection',
          name: 'Is Collection',
          type: ENodeMetadataOptionType.INPUT,
          inputOptions: { schema: z.boolean(), },
          validate: v => validateAgainstSchema(z.boolean(), v),
        },
        {
          id: 'value',
          name: 'Value',
          type: ENodeMetadataOptionType.INPUT,
          inputOptions: { schema: this.getValueSchema(context.nodeOptions), },
          validate: v => validateAgainstSchema(this.getValueSchema(context.nodeOptions), v), // TODO: Fix collection support
        },
      ]),
      inputSchema: z.object({}),
      outputSchema: context => z.object({
        value: this.getValueSchema(context.nodeOptions).describe('Value'),
      }),
    });
  }

  private getValueSchema(nodeOptions: TNodeOptions): ZodSchema {
    const { valueType, isCollection, } = nodeOptions;

    const baseSchema = {
      [EValueType.STRING]: z.string(),
      [EValueType.NUMBER]: z.number(),
      [EValueType.BOOLEAN]: z.boolean(),
    }[valueType];

    if (!isCollection) {
      return baseSchema;
    }

    return baseSchema.array();
  }

  execute(_: never, context: TNodeExecutorContext<TNodeOptions>) {
    return { value: context.nodeOptions.value, };
  }
}
