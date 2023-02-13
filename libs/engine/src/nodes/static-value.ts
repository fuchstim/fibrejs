import { BaseNode } from '../common/base-node';
import { WBooleanType, WNumberType, WStringType, EPrimitive, TWrappedPrimitive, TStringType, TNumberType, TBooleanType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

type TNodeOutputs = {
  value: TStringType | TNumberType | TBooleanType,
};

type TNodeOptions = {
  valueType: EPrimitive,
  value: string | number | boolean,
};

export default class StaticValueNode extends BaseNode<never, TNodeOutputs, TNodeOptions> {
  constructor() {
    super({
      id: 'staticValue',
      name: 'Static Value',
      description: 'Define a static value',

      defaultOptions: {
        valueType: EPrimitive.STRING,
        value: '',
      },
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
            type: context.nodeOptions.valueType as EPrimitive,
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
    return {
      [EPrimitive.STRING]: 'string',
      [EPrimitive.NUMBER]: 'number',
      [EPrimitive.BOOLEAN]: 'boolean',
    }[type];
  }

  private getWrappedValueType(type: EPrimitive): TWrappedPrimitive<any, any> {
    return {
      [EPrimitive.STRING]: WStringType,
      [EPrimitive.NUMBER]: WNumberType,
      [EPrimitive.BOOLEAN]: WBooleanType,
    }[type];
  }

  execute(_: never, context: TNodeExecutorContext<TNodeOptions>) {
    const { valueType, value, } = context.nodeOptions;

    const wrappedType = {
      [EPrimitive.STRING]: WStringType.fromNative(value as string),
      [EPrimitive.NUMBER]: WNumberType.fromNative(value as number),
      [EPrimitive.BOOLEAN]: WBooleanType.fromNative(value as boolean),
    }[valueType];
    if (!wrappedType) {
      throw new Error(`Invalid valueType specified: ${valueType}`);
    }

    return { value: wrappedType, };
  }
}
