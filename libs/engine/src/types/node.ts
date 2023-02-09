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
  type: TWrappedType<any, any>,
};

export type TNodeOptions = TKeyValue<string, any> | void;

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
