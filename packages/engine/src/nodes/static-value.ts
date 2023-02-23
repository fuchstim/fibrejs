import { BaseNode } from '../common/base-node';
import { WBooleanType, WNumberType, WStringType, EPrimitive, IWrappable } from '../common/wrapped-types';
import { TValidationResult } from '../types/common';
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
          validate: v => {
            if (!this.getDropDownOptions(context.nodeOptions).map(o => o.id).includes(v)) {
              return { valid: false, reason: `${v} is not a valid option`, };
            }

            return { valid: true, reason: null, };
          },
        },
        {
          id: 'isCollection',
          name: 'Is Collection',
          type: ENodeMetadataOptionType.INPUT,
          inputOptions: {
            type: EPrimitive.BOOLEAN,
          },
          validate: v => {
            if (!(typeof v === 'boolean')) {
              return { valid: false, reason: `Value ${v} is not a boolean`, };
            }

            return { valid: true, reason: null, };
          },
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

  private validateValue(value: any, nodeOptions: TNodeOptions): TValidationResult {
    const { valueType, } = nodeOptions;

    const nativeValueType = {
      [EPrimitive.STRING]: 'string',
      [EPrimitive.NUMBER]: 'number',
      [EPrimitive.BOOLEAN]: 'boolean',
    }[valueType];

    const wrappedOutputValue = this.getWrappedOutputValue({ ...nodeOptions, value, });
    if (!Array.isArray(wrappedOutputValue)) {
      const valid = typeof wrappedOutputValue === nativeValueType;
      if (!valid) {
        return { valid, reason: `Value must be ${nativeValueType} but is ${typeof wrappedOutputValue}`, };
      }

      return { valid, reason: null, };
    }

    const invalidInputValidationResults = (wrappedOutputValue as (string | number)[])
      .map((entry, index) => {
        if (valueType === EPrimitive.STRING) {
          const valid = typeof entry === nativeValueType;

          return { index, valid, reason: `Value must be ${nativeValueType} but is ${typeof entry}`, };
        }

        if (valueType === EPrimitive.NUMBER) {
          if (Number.isNaN(entry)) {
            return { index, valid: false, reason: 'Value is not a number', };
          }

          const valid = typeof entry === nativeValueType;
          return { index, valid, reason: `Value must be ${nativeValueType} but is ${typeof entry}`, };
        }

        return { index, valid: false, reason: `Invalid value type: ${valueType}`, };
      })
      .filter(r => !r.valid);

    if (invalidInputValidationResults.length) {
      const reasons = invalidInputValidationResults.map(
        r => `Index ${r.index + 1} (${r.reason})`
      );

      return {
        valid: false,
        reason: `One or more collection items are invalid: ${reasons.join(', ')}`,
      };
    }

    return { valid: true, reason: null, };
  }

  private getWrappedValueType(nodeOptions: TNodeOptions): IWrappable<any, any> {
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
