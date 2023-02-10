import { BaseNode } from '../common/base-node';
import { WBooleanType, WNumberType, WStringType, EPrimitive, TBooleanType, TNumberType, TStringType, TWrappedType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeContext } from '../types/node';

type TNodeOutput = {
  value: TStringType | TNumberType | TBooleanType,
};

type TNodeOptions = {
  valueType: EPrimitive,
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
            { id: EPrimitive.STRING, name: 'String', },
            { id: EPrimitive.NUMBER, name: 'Number', },
            { id: EPrimitive.BOOLEAN, name: 'Boolean', },
          ],
          validate: v => Object.values(EPrimitive).includes(v),
        },
        {
          id: 'value',
          name: 'Value',
          type: ENodeMetadataOptionType.INPUT,
          inputOptions: {
            type: context.nodeOptions.valueType as EPrimitive ?? EPrimitive.STRING,
          },
          validate: value => (
            typeof value === this.getNativeValueType(context.nodeOptions.valueType as EPrimitive)
          ),
        },
      ]),
      inputs: [],
      outputs: context => ([
        { id: 'value', name: 'Value', type: this.getWrappedValueType(context.nodeOptions.valueType as EPrimitive), },
      ]),
    });
  }

  private getNativeValueType(type: EPrimitive): string {
    const nativeValueType = {
      [EPrimitive.STRING]: 'string',
      [EPrimitive.NUMBER]: 'number',
      [EPrimitive.BOOLEAN]: 'boolean',
    }[type];

    return nativeValueType ?? 'string';
  }

  private getWrappedValueType(type: EPrimitive): TWrappedType<any, any> {
    const wrappedValueType = {
      [EPrimitive.STRING]: WStringType,
      [EPrimitive.NUMBER]: WNumberType,
      [EPrimitive.BOOLEAN]: WBooleanType,
    }[type];

    return wrappedValueType ?? WStringType;
  }

  execute(_: never, context: TNodeContext<TNodeOptions>): TNodeOutput {
    const { valueType, value, } = context.nodeOptions;

    switch (valueType) {
      case EPrimitive.STRING:
        return { value: { value: String(value), }, };
      case EPrimitive.NUMBER:
        return { value: { value: Number(value), }, };
      case EPrimitive.BOOLEAN:
        return { value: { value: Boolean(value), }, };

      default: throw new Error(`Invalid valueType specified: ${valueType}`);
    }
  }
}
