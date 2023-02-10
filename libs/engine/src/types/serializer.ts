import type { EPrimitive } from '../common/wrapped-types';
import type { ENodeMetadataOptionType, ENodeType, TNodeMetadataDropDownOption, TNodeMetadataInputOptions } from './node';

export type TSerializedType = {
  id: string,
  name: string,
  isComplex: boolean,
  fields: { [key: string]: EPrimitive | TSerializedType, },
};

export type TSerializedNodeOption = {
  id: string,
  name: string,
  type: ENodeMetadataOptionType,
  inputOptions?: TNodeMetadataInputOptions,
  dropDownOptions?: TNodeMetadataDropDownOption[],
};

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
