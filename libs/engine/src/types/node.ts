import type { TWrappedType } from '../common/wrapped-types';
import type { TKeyValue, TOptionalGetter } from './common';
import type { TRuleContext } from './rule';

export enum ENodeMetadataOptionType {
  DROP_DOWN = 'DROP_DOWN',
  INPUT = 'INPUT',
}

export enum ENodeType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
}

export type TNodeMetadataDropDownOption = {
  id: string,
  name: string
};

export type TNodeMetadataOption = {
  id: string,
  name: string,
  type: ENodeMetadataOptionType,
  dropDownOptions?: TNodeMetadataDropDownOption[],
  validate: (optionValue: any) => boolean,
};

export type TNodeMetadataInputOutput = {
  id: string,
  name: string,
  type: TWrappedType<any, any>,
};

export type TNodeOption = string | number | boolean;
export type TNodeOptions = TKeyValue<string, TNodeOption> | void;

export type TNodeContext<T extends TNodeOptions> = TRuleContext & {
  nodeOptions: T
};

export type TNodeMetadata<T extends TNodeOptions> = {
  options: TOptionalGetter<TNodeContext<T>, TNodeMetadataOption[]>,
  inputs: TOptionalGetter<TNodeContext<T>, TNodeMetadataInputOutput[]>,
  outputs: TOptionalGetter<TNodeContext<T>, TNodeMetadataInputOutput[]>,
};

export type TNodeConfig<T extends TNodeOptions> = TNodeMetadata<T> & {
  id: string,
  name: string,
  type?: ENodeType,
  description?: string,
};
