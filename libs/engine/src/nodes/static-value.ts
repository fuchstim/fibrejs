import BaseNode, { ENodeOptionType } from './base';
import { CAnyType } from '../constants/types';

type TNodeOutput = {
  value: string | number | boolean,
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

      options: [
        {
          id: 'valueType',
          name: 'Value Type',
          type: ENodeOptionType.DROP_DOWN,
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
          type: ENodeOptionType.INPUT,
          validate: (optionValue, otherOptions) => {
            switch (otherOptions.valueType as EValueType) {
              case EValueType.STRING:
                return typeof optionValue === 'string';
              case EValueType.NUMBER:
                return typeof optionValue === 'number';
              case EValueType.BOOLEAN:
                return typeof optionValue === 'boolean';

              default:
                return false;
            }
          },
        },
      ],
      inputs: [],
      outputs: [
        { id: 'value', name: 'Value', type: CAnyType, },
      ],
    });
  }

  execute(_: never, { valueType, value, }: TNodeOptions): TNodeOutput {
    switch (valueType) {
      case EValueType.STRING:
        return { value: String(value), };
      case EValueType.NUMBER:
        return { value: Number(value), };
      case EValueType.BOOLEAN:
        return { value: Boolean(value), };

      default: throw new Error(`Invalid valueType specified: ${valueType}`);
    }
  }
}
