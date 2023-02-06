import { Types } from '@fraud-tool/lib-engine';

export type TUserType = {
  id: string,
  username: string,
  age: number,
  createdAt: Types.TDateType,
};
export const CUserType: Types.TType<TUserType, TUserType> = {
  id: 'USER',
  name: 'User',
  fields: {
    id: Types.EPrimitive.STRING,
    username: Types.EPrimitive.STRING,
    age: Types.EPrimitive.NUMBER,
    createdAt: Types.CDateType,
  },
  toNative: user => user,
  fromNative: user => user,
};
