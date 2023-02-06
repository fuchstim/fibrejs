import { BaseNode, ENodeMetadataOptionType } from '../common/base-node';
import { CBooleanType, CNumberType, CStringType, TBooleanType, TNumberType, TStringType } from '../common/types';

type TNodeOutput = {
  value: TStringType | TNumberType | TBooleanType,
};

enum EValueType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
}
type TNodeOptions = {
  valueType: EValueType,
  value: string | number | boolean,
};

export default class StaticValueNode extends BaseNode<never, TNodeOutput, TNodeOptions> {
  constructor() {
    super({
      id: 'staticValue',
      name: 'Static Value',

      options: context => ([
        {
          id: 'valueType',
          name: 'Value Type',
          type: ENodeMetadataOptionType.DROP_DOWN,
          dropDownOptions: [
            { id: EValueType.STRING, name: 'String', },
            { id: EValueType.NUMBER, name: 'Number', },
            { id: EValueType.BOOLEAN, name: 'boolean', },
          ],
          validate: v => Object.values(EValueType).includes(v),
        },
        {
          id: 'value',
          name: 'Value',
          type: ENodeMetadataOptionType.INPUT,
          validate: value => {
            switch (context.nodeOptions.valueType as EValueType) {
              case EValueType.STRING:
                return typeof value === 'string';
              case EValueType.NUMBER:
                return typeof value === 'number';
              case EValueType.BOOLEAN:
                return typeof value === 'boolean';

              default:
                return false;
            }
          },
        },
      ]),
      inputs: [],
      outputs: context => {
        const valueType = {
          [EValueType.STRING]: CStringType,
          [EValueType.NUMBER]: CNumberType,
          [EValueType.BOOLEAN]: CBooleanType,
        }[context.nodeOptions.valueType as string];

        return [
          { id: 'value', name: 'Value', type: valueType!, },
        ];
      },
    });
  }

  execute(_: never, { valueType, value, }: TNodeOptions): TNodeOutput {
    switch (valueType) {
      case EValueType.STRING:
        return { value: { value: String(value), }, };
      case EValueType.NUMBER:
        return { value: { value: Number(value), }, };
      case EValueType.BOOLEAN:
        return { value: { value: Boolean(value), }, };

      default: throw new Error(`Invalid valueType specified: ${valueType}`);
    }
  }
}
