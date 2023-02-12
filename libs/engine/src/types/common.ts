import { TWrappedPrimitive, TWrappedType } from '../common/wrapped-types';
import type Rule from '../executors/rule';
import type RuleSet from '../executors/rule-set';

export type TGetter<TContext, TReturnType> = (context: TContext) => TReturnType;
export type TOptionalGetter<TContext, TReturnType> = TReturnType | TGetter<TContext, TReturnType>;

export type TExecutorResult<TOutput> = {
  executionTimeMs: number,
  output: TOutput
};

export type TExecutorValidationResult<T> = {
  valid: boolean,
  actual: T,
  expected: Record<string, TWrappedType<any, any> | TWrappedPrimitive<any, any>>,
};

export interface IExecutorLogger {
  ns: (...namespaces: string[]) => IExecutorLogger;
  namespace: (...namespaces: string[]) => IExecutorLogger;

  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  verbose: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  silly: (...args: unknown[]) => void;
}

export type TExecutorContext = {
  executionId: string,
  logger: IExecutorLogger,
  rules: Rule[],
  ruleSets: RuleSet[],
};
