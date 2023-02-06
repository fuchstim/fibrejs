export enum EPrimitive {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
}

export type TType<TCustomType, TNativeType> = {
  name: string,
  fields: { [key: string]: EPrimitive | TType<any, any> },
  toNative: (input: TCustomType) => TNativeType,
  fromNative: (input: TNativeType) => TCustomType
};

export type TSerializedType = {
  name: string,
  fields: { [key: string]: EPrimitive | TSerializedType, },
};

export type TStringType = {
  value: string,
};
export const CStringType: TType<TStringType, string> = {
  name: EPrimitive.STRING,
  fields: {
    value: EPrimitive.STRING,
  },
  toNative: ({ value, }) => String(value),
  fromNative: value => ({ value, }),
};

export type TNumberType = {
  value: number,
};
export const CNumberType: TType<TNumberType, number> = {
  name: EPrimitive.NUMBER,
  fields: {
    value: EPrimitive.NUMBER,
  },
  toNative: ({ value, }) => Number(value),
  fromNative: value => ({ value, }),
};

export type TBooleanType = {
  value: boolean,
};
export const CBooleanType: TType<TBooleanType, boolean> = {
  name: EPrimitive.BOOLEAN,
  fields: {
    value: EPrimitive.BOOLEAN,
  },
  toNative: ({ value, }) => Boolean(value),
  fromNative: value => ({ value, }),
};

export type TDateType = {
  milliseconds: number,
  seconds: number,
  minutes: number,
  hours: number,
  days: number,
  months: number,
  years: number,
  timestamp: string,
};
export const CDateType: TType<TDateType, Date> = {
  name: 'DATE',
  fields: {
    milliseconds: EPrimitive.NUMBER,
    seconds: EPrimitive.NUMBER,
    minutes: EPrimitive.NUMBER,
    hours: EPrimitive.NUMBER,
    days: EPrimitive.NUMBER,
    months: EPrimitive.NUMBER,
    years: EPrimitive.NUMBER,
    timestamp: EPrimitive.STRING,
  },
  toNative: ({ timestamp, }) => new Date(timestamp),
  fromNative: date => ({
    milliseconds: date.getMilliseconds(),
    seconds: date.getSeconds(),
    minutes: date.getMinutes(),
    hours: date.getHours(),
    days: date.getDate(),
    months: date.getMonth() + 1,
    years: date.getFullYear(),
    timestamp: date.toISOString(),
  }),
};
