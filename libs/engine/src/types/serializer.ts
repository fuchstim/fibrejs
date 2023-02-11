import type { EPrimitive } from '../common/wrapped-types';
import type { TKeyValue } from './common';
import type { ENodeMetadataOptionType, ENodeType, TNodeMetadataDropDownOption, TNodeMetadataInputOptions } from './node';

interface ISerializedType {
  id: string,
  name: string,
}

interface ISerializedPrimitiveType extends ISerializedType {
  isComplex: false,
  fields: TKeyValue<string, EPrimitive>
}

interface ISerializedComplexType extends ISerializedType {
  isComplex: true,
  fields: TKeyValue<string, TSerializedType>
}

export type TSerializedType = ISerializedPrimitiveType | ISerializedComplexType;

interface ISerializedNodeOption {
  id: string,
  name: string,
}

interface ISerializedNodeInputOption extends ISerializedNodeOption {
  type: ENodeMetadataOptionType.INPUT,
  inputOptions: TNodeMetadataInputOptions,
}

interface ISerializedNodeDropDownOption extends ISerializedNodeOption {
  type: ENodeMetadataOptionType.DROP_DOWN,
  dropDownOptions: TNodeMetadataDropDownOption[],
}

export type TSerializedNodeOption = ISerializedNodeInputOption | ISerializedNodeDropDownOption;

export type TSerializedNodeInputOutput = {
  id: string,
  name: string,
  type: TSerializedType,
};

export type TSerializedNode = {
  id: string,
  name: string,
  type?: ENodeType,
  description?: string,

  options: TSerializedNodeOption[],
  inputs: TSerializedNodeInputOutput[],
  outputs: TSerializedNodeInputOutput[],
};
