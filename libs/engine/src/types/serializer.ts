import type { EPrimitive } from '../common/wrapped-types';
import type { ENodeMetadataOptionType, ENodeType } from './node';

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
  dropDownOptions?: { id: string, name: string }[],
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
