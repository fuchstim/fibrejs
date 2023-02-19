import { BaseNode } from '../common/base-node';
import { WBooleanType, WNumberType, WStringType, EPrimitive, WrappedType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeExecutorContext } from '../types/node';

type TNodeOutputs = {
  value: string | number | boolean | string[] | number[],
};

type TNodeOptions = {
  valueType: EPrimitive,
  isCollection: boolean,
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
        isCollection: false,
        value: '',
      },
      options: context => ([
        {
          id: 'valueType',
          name: 'Value Type',
          type: ENodeMetadataOptionType.DROP_DOWN,
          dropDownOptions: this.getDropDownOptions(context.nodeOptions),
          validate: v => this.getDropDownOptions(context.nodeOptions).map(o => o.id).includes(v),
        },
        {
          id: 'isCollection',
          name: 'Is Collection',
          type: ENodeMetadataOptionType.INPUT,
          inputOptions: {
            type: EPrimitive.BOOLEAN,
          },
          validate: v => typeof v === 'boolean',
        },
        {
          id: 'value',
          name: 'Value',
          type: ENodeMetadataOptionType.INPUT,
          inputOptions: {
            type: context.nodeOptions.isCollection ? EPrimitive.STRING : context.nodeOptions.valueType,
          },
          validate: value => this.validateValue(value, context.nodeOptions),
        },
      ]),
      inputs: [],
      outputs: context => ([
        { id: 'value', name: 'Value', type: this.getWrappedValueType(context.nodeOptions), },
      ]),
    });
  }

  private getDropDownOptions(nodeOptions: TNodeOptions) {
    if (nodeOptions.isCollection) {
      return [
        { id: EPrimitive.STRING, name: 'String', },
        { id: EPrimitive.NUMBER, name: 'Number', },
      ];
    }

    return [
      { id: EPrimitive.STRING, name: 'String', },
      { id: EPrimitive.NUMBER, name: 'Number', },
      { id: EPrimitive.BOOLEAN, name: 'Boolean', },
    ];
  }

  private validateValue(value: any, nodeOptions: TNodeOptions): boolean {
    const { valueType, } = nodeOptions;

    const nativeValueType = {
      [EPrimitive.STRING]: 'string',
      [EPrimitive.NUMBER]: 'number',
      [EPrimitive.BOOLEAN]: 'boolean',
    }[valueType];

    const wrappedOutputValue = this.getWrappedOutputValue({ ...nodeOptions, value, });
    if (!Array.isArray(wrappedOutputValue)) {
      return typeof wrappedOutputValue === nativeValueType;
    }

    const validCollectionInput = (wrappedOutputValue as (string | number)[])
      .every(entry => {
        if (valueType === EPrimitive.STRING) {
          return typeof entry === nativeValueType;
        }

        if (valueType === EPrimitive.NUMBER) {
          return typeof entry === nativeValueType && !Number.isNaN(entry);
        }

        return false;
      });

    return validCollectionInput;
  }

  private getWrappedValueType(nodeOptions: TNodeOptions): WrappedType<any, any> {
    const wrappedType = {
      [EPrimitive.STRING]: WStringType,
      [EPrimitive.NUMBER]: WNumberType,
      [EPrimitive.BOOLEAN]: WBooleanType,
    }[nodeOptions.valueType];

    if (!nodeOptions.isCollection) {
      return wrappedType;
    }

    return wrappedType.collection;
  }

  execute(_: never, context: TNodeExecutorContext<TNodeOptions>) {
    const value = this.getWrappedOutputValue(context.nodeOptions);

    return { value, };
  }

  private getWrappedOutputValue(nodeOptions: TNodeOptions): TNodeOutputs['value'] {
    const { valueType, isCollection, value, } = nodeOptions;

    if (!isCollection) {
      switch (valueType) {
        case EPrimitive.STRING: return WStringType.wrap(value as string);
        case EPrimitive.NUMBER: return WNumberType.wrap(value as number);
        case EPrimitive.BOOLEAN: return WBooleanType.wrap(value as boolean);
      }
    }

    const entries = (value as string).split(',').map(p => p.trim());

    switch (valueType) {
      case EPrimitive.STRING: return WStringType.collection.wrap(entries);
      case EPrimitive.NUMBER: return WNumberType.collection.wrap(entries.map(Number));
    }

    throw new Error(`Invalid value type: ${valueType}`);
  }
}
