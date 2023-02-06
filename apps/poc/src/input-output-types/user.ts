import { Types } from '@fraud-tool/lib-engine';

export type TUserType = {
  id: string,
  username: string,
  createdAt: Types.TDateType,
};
export const CUserType: Types.TComplexType<TUserType, TUserType> = {
  name: 'USER',
  fields: {
    id: Types.EPrimitive.STRING,
    username: Types.EPrimitive.STRING,
    age: Types.EPrimitive.NUMBER,
    createdAt: Types.CDateType,
  },
  toNative: user => user,
  fromNative: user => user,
};
