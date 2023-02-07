import { WrappedTypes } from '@tripwire/engine';

export type TUserType = {
  id: string,
  username: string,
  age: number,
  createdAt: Date,
};
export type TWrappedUserType = {
  id: WrappedTypes.TStringType,
  username: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
  createdAt: WrappedTypes.TDateType,
};
export const CUserType: WrappedTypes.TWrappedType<TUserType, TWrappedUserType> = {
  id: 'USER',
  name: 'User',
  fields: {
    id: WrappedTypes.CStringType,
    username: WrappedTypes.CStringType,
    age: WrappedTypes.CNumberType,
    createdAt: WrappedTypes.CDateType,
  },
  toNative: user => ({
    id: user.id.value,
    username: user.username.value,
    age: user.age.value,
    createdAt: WrappedTypes.CDateType.toNative(user.createdAt),
  }),
  fromNative: user => ({
    id: WrappedTypes.CStringType.fromNative(user.id),
    username: WrappedTypes.CStringType.fromNative(user.username),
    age: WrappedTypes.CNumberType.fromNative(user.age),
    createdAt: WrappedTypes.CDateType.fromNative(user.createdAt),
  }),
};
