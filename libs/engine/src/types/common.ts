import type { Logger } from '@tripwire/logger';

import type Rule from '../executors/rule';

export type TGetter<TContext, TReturnType> = (context: TContext) => TReturnType;
export type TOptionalGetter<TContext, TReturnType> = TReturnType | TGetter<TContext, TReturnType>;

export type TKeyValue<TKeyType extends string | number | symbol, TValueType> = {
  [key in TKeyType]: TValueType;
};

export type TExecutorResult<TOutput> = {
  executionTimeMs: number,
  output: TOutput
};

export type TExecutorContext = {
  executionId: string,
  logger: Logger,
  rules: Rule[],
};
