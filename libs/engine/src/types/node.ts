import { TType } from '../common/types';
import Rule from '../rule/rule';
import { TOptionalGetter } from './common';

export type TNodeOptions = { [key: string]: string | number | boolean };

export enum ENodeMetadataOptionType {
  DROP_DOWN = 'DROP_DOWN',
  INPUT = 'INPUT',
}

export type TNodeMetadataOption = {
  id: string,
  name: string,
  type: ENodeMetadataOptionType,
  dropDownOptions?: { id: string, name: string }[],
  validate: (optionValue: any) => boolean,
};

export type TNodeMetadataInputOutput = {
  id: string,
  name: string,
  type: TType<any, any>,
};

export type TNodeContext = {
  rules: Rule[],
  nodeOptions: TNodeOptions
};

export type TNodeMetadata = {
  options: TOptionalGetter<TNodeContext, TNodeMetadataOption[]>,
  inputs: TOptionalGetter<TNodeContext, TNodeMetadataInputOutput[]>,
  outputs: TOptionalGetter<TNodeContext, TNodeMetadataInputOutput[]>,
};

export type TNodeConfig = TNodeMetadata & {
  id: string,
  name: string,
  description?: string,
};
