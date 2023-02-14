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
  validate: wrappedUser => {
    const validationErrors: string[] = [];

    Object
      .keys(WUserType.fields)
      .forEach(key => {
        const { valid, reason, } = WUserType.fields[key as keyof TUserType].validate(wrappedUser[key as keyof TUserType]);
        if (!valid) {
          validationErrors.push(
            `Invalid ${key} (${reason})`
          );
        }
      });

    if (validationErrors.length === 0) { return { valid: true, reason: null, }; }

    return {
      valid: false,
      reason: validationErrors.join(', '),
    };
  },
  unwrap: user => ({
    id: WrappedTypes.WStringType.unwrap(user.id),
    username: WrappedTypes.WStringType.unwrap(user.username),
    age: WrappedTypes.WNumberType.unwrap(user.age),
    createdAt: WrappedTypes.WDateType.unwrap(user.createdAt),
  }),
  wrap: user => ({
    id: WrappedTypes.WStringType.wrap(user.id),
    username: WrappedTypes.WStringType.wrap(user.username),
    age: WrappedTypes.WNumberType.wrap(user.age),
    createdAt: WrappedTypes.WDateType.wrap(user.createdAt),
  }),
};
