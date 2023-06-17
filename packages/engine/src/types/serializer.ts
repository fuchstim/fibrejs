import type { ENodeMetadataOptionType, ENodeType, TNodeMetadataDropDownOption, TNodeOptions } from './node';

interface ISerializedNodeOption {
  id: string,
  name: string,
}

interface ISerializedNodeInputOption extends ISerializedNodeOption {
  type: ENodeMetadataOptionType.INPUT,
  inputSchema: string,
}

interface ISerializedNodeDropDownOption extends ISerializedNodeOption {
  type: ENodeMetadataOptionType.DROP_DOWN,
  dropDownOptions: TNodeMetadataDropDownOption[],
}

export type TSerializedNodeOption = ISerializedNodeInputOption | ISerializedNodeDropDownOption;

export type TSerializedNode = {
  id: string,
  name: string,
  type?: ENodeType,
  description?: string,

  defaultOptions: Record<string, any>,
  options: TSerializedNodeOption[],
  inputSchema: string,
  outputSchema: string
};

export type TSerializationContext = {
  nodeOptions?: TNodeOptions,
  ruleId?: string,
  ruleSetId?: string,
};
