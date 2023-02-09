export enum EPrimitive {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
}

export type TWrappedType<TNativeType, TCustomType> = {
  id: string,
  name: string,
  fields: { [key: string]: EPrimitive | TWrappedType<any, any> },
  toNative: (input: TCustomType) => TNativeType,
  fromNative: (input: TNativeType) => TCustomType
};

export type TStringType = {
  value: string,
};
export const CStringType: TWrappedType<string, TStringType> = {
  id: EPrimitive.STRING,
  name: 'String',
  fields: {
    value: EPrimitive.STRING,
  },
  toNative: ({ value, }) => String(value),
  fromNative: value => ({ value, }),
};

export type TNumberType = {
  value: number,
};
export const CNumberType: TWrappedType<number, TNumberType> = {
  id: EPrimitive.NUMBER,
  name: 'Number',
  fields: {
    value: EPrimitive.NUMBER,
  },
  toNative: ({ value, }) => Number(value),
  fromNative: value => ({ value, }),
};

export type TBooleanType = {
  value: boolean,
};
export const CBooleanType: TWrappedType<boolean, TBooleanType> = {
  id: EPrimitive.BOOLEAN,
  name: 'Boolean',
  fields: {
    value: EPrimitive.BOOLEAN,
  },
  toNative: ({ value, }) => Boolean(value),
  fromNative: value => ({ value, }),
};

export type TDateType = {
  milliseconds: TNumberType,
  seconds: TNumberType,
  minutes: TNumberType,
  hours: TNumberType,
  days: TNumberType,
  months: TNumberType,
  years: TNumberType,
  timestamp: TStringType,
};
export const CDateType: TWrappedType<Date, TDateType> = {
  id: 'DATE',
  name: 'Date',
  fields: {
    milliseconds: CNumberType,
    seconds: CNumberType,
    minutes: CNumberType,
    hours: CNumberType,
    days: CNumberType,
    months: CNumberType,
    years: CNumberType,
    timestamp: CStringType,
  },
  toNative: ({ timestamp, }) => new Date(CStringType.toNative(timestamp)),
  fromNative: date => ({
    milliseconds: CNumberType.fromNative(date.getMilliseconds()),
    seconds: CNumberType.fromNative(date.getSeconds()),
    minutes: CNumberType.fromNative(date.getMinutes()),
    hours: CNumberType.fromNative(date.getHours()),
    days: CNumberType.fromNative(date.getDate()),
    months: CNumberType.fromNative(date.getMonth() + 1),
    years: CNumberType.fromNative(date.getFullYear()),
    timestamp: CStringType.fromNative(date.toISOString()),
  }),
};
