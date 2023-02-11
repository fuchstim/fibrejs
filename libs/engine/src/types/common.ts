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
};
