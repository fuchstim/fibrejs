export type TGetter<TContext, TReturnType> = (context: TContext) => TReturnType;
export type TOptionalGetter<TContext, TReturnType> = TReturnType | TGetter<TContext, TReturnType>;

export type TKeyValue<TKeyType extends string | number | symbol, TValueType> = {
  [key in TKeyType]: TValueType;
};
