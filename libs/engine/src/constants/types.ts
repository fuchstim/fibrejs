export enum EPrimitive {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
}

export type TComplexType<TCustomType, TNativeType> = {
  name: string,
  fields: { [key: string]: EPrimitive | TComplexType<any, any> },
  toNative: (input: TCustomType) => TNativeType,
  fromNative: (input: TNativeType) => TCustomType
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
export const CDateType: TComplexType<TDateType, Date> = {
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
