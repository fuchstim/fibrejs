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
export const WStringType: TWrappedType<string, TStringType> = {
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
export const WNumberType: TWrappedType<number, TNumberType> = {
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
export const WBooleanType: TWrappedType<boolean, TBooleanType> = {
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
export const WDateType: TWrappedType<Date, TDateType> = {
  id: 'DATE',
  name: 'Date',
  fields: {
    milliseconds: WNumberType,
    seconds: WNumberType,
    minutes: WNumberType,
    hours: WNumberType,
    days: WNumberType,
    months: WNumberType,
    years: WNumberType,
    timestamp: WStringType,
  },
  toNative: ({ timestamp, }) => new Date(WStringType.toNative(timestamp)),
  fromNative: date => ({
    milliseconds: WNumberType.fromNative(date.getMilliseconds()),
    seconds: WNumberType.fromNative(date.getSeconds()),
    minutes: WNumberType.fromNative(date.getMinutes()),
    hours: WNumberType.fromNative(date.getHours()),
    days: WNumberType.fromNative(date.getDate()),
    months: WNumberType.fromNative(date.getMonth() + 1),
    years: WNumberType.fromNative(date.getFullYear()),
    timestamp: WStringType.fromNative(date.toISOString()),
  }),
};
