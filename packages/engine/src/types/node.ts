import { AnyZodObject, ZodSchema } from 'zod';
import type RuleStage from '../executors/rule-stage';
import { TOptional, TOptionalGetter } from './common';
import type { TRuleStageExecutorContext } from './rule-stage';

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

interface INodeMetadataOption<T> {
  name: string,
  defaultValue: T,
}

interface INodeMetadataInputOption<T> extends INodeMetadataOption<T> {
  type: ENodeMetadataOptionType.INPUT,
  inputSchema: ZodSchema
}

interface INodeMetadataDropDownOption<T> extends INodeMetadataOption<T> {
  type: ENodeMetadataOptionType.DROP_DOWN,
  dropDownOptions: TNodeMetadataDropDownOption[],
}

export type TNodeMetadataOptions<T extends TNodeOptions> = {
  [K in keyof T]: INodeMetadataInputOption<T[K]> | INodeMetadataDropDownOption<T[K]>
};

export type TNodeOption = string | number | boolean;
export type TNodeOptions = Record<string, TNodeOption | never>;

export type TNodeExecutorContext<T extends TNodeOptions> = TRuleStageExecutorContext & { ruleStage?: RuleStage, nodeOptions: T };

export type TNodeConfig<T extends TNodeOptions> = {
  id: string,
  name: string,
  type?: ENodeType,
  description: string,
  options: TOptionalGetter<TOptional<TNodeExecutorContext<T>, 'nodeOptions'>, TNodeMetadataOptions<T>>,
  inputSchema: TOptionalGetter<TNodeExecutorContext<T>, AnyZodObject>,
  outputSchema: TOptionalGetter<TNodeExecutorContext<T>, AnyZodObject>,
};
