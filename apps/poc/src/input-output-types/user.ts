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
export const WUserType: WrappedTypes.TWrappedType<TUserType, TWrappedUserType> = {
  id: 'USER',
  name: 'User',
  fields: {
    id: WrappedTypes.WStringType,
    username: WrappedTypes.WStringType,
    age: WrappedTypes.WNumberType,
    createdAt: WrappedTypes.WDateType,
  },
  toNative: user => ({
    id: user.id.value,
    username: user.username.value,
    age: user.age.value,
    createdAt: WrappedTypes.WDateType.toNative(user.createdAt),
  }),
  fromNative: user => ({
    id: WrappedTypes.WStringType.fromNative(user.id),
    username: WrappedTypes.WStringType.fromNative(user.username),
    age: WrappedTypes.WNumberType.fromNative(user.age),
    createdAt: WrappedTypes.WDateType.fromNative(user.createdAt),
  }),
};
