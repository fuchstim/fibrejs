import { TType } from '../common/types';
import { TKeyValue, TOptionalGetter } from './common';
import { TRuleContext } from './rule';

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

export type TBaseNodeOptions = TKeyValue<string, any> | void;

export type TNodeContext<TNodeOptions extends TBaseNodeOptions> = TRuleContext & {
  nodeOptions: TNodeOptions
};

export type TNodeMetadata<TNodeOptions extends TBaseNodeOptions> = {
  options: TOptionalGetter<TNodeContext<TNodeOptions>, TNodeMetadataOption[]>,
  inputs: TOptionalGetter<TNodeContext<TNodeOptions>, TNodeMetadataInputOutput[]>,
  outputs: TOptionalGetter<TNodeContext<TNodeOptions>, TNodeMetadataInputOutput[]>,
};

export type TNodeConfig<TNodeOptions extends TBaseNodeOptions> = TNodeMetadata<TNodeOptions> & {
  id: string,
  name: string,
  description?: string,
};
