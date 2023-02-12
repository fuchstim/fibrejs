import type { EPrimitive } from '../common/wrapped-types';
import type { ENodeMetadataOptionType, ENodeType, TNodeMetadataDropDownOption, TNodeMetadataInputOptions, TNodeOptions } from './node';

interface ISerializedType {
  id: string,
  name: string,
}

interface ISerializedPrimitiveType extends ISerializedType {
  isComplex: false,
  fields: Record<string, EPrimitive>
}

interface ISerializedComplexType extends ISerializedType {
  isComplex: true,
  fields: Record<string, TSerializedType>
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

  defaultOptions: Record<string, any>,
  options: TSerializedNodeOption[],
  inputs: TSerializedNodeInputOutput[],
  outputs: TSerializedNodeInputOutput[],
};

export type TSerializationContext = {
  nodeOptions?: TNodeOptions,
  ruleId?: string,
  ruleSetId?: string,
};

export type TMultiSerializationContext = Omit<TSerializationContext, 'nodeOptions'> & { nodeOptions?: Record<string, TNodeOptions> };
