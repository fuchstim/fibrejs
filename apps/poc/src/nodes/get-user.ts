import { BaseNode, WrappedTypes } from '@tripwire/engine';

import { WUserType, TWrappedUserType } from '../input-output-types/user';

type TNodeInput = {
  userId: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
};
type TNodeOutput = {
  user: TWrappedUserType,
};

export default class GetUserNode extends BaseNode<TNodeInput, TNodeOutput, Record<string, never>> {
  constructor() {
    super({
      id: 'getUser',
      name: 'Get User',
      description: 'Retrieve details for a given user ID',

      defaultOptions: {},
      options: [],
      inputs: [
        { id: 'userId', name: 'User ID', type: WrappedTypes.WStringType, },
        { id: 'age', name: 'Age', type: WrappedTypes.WNumberType, },
      ],
      outputs: [
        { id: 'user', name: 'User', type: WUserType, },
      ],
    });
  }

  async execute(input: TNodeInput): Promise<TNodeOutput> {
    return {
      user: WUserType.fromNative({
        id: input.userId.value,
        username: 'username',
        age: input.age.value,
        createdAt: new Date(),
      }),
    };
  }
}
