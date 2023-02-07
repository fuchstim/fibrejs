import { BaseNode, WrappedTypes } from '@tripwire/engine';

import { CUserType, TWrappedUserType } from '../input-output-types/user';

type TNodeInput = {
  userId: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
};
type TNodeOutput = {
  user: TWrappedUserType,
};

export default class GetUserNode extends BaseNode<TNodeInput, TNodeOutput, void> {
  constructor() {
    super({
      id: 'getUser',
      name: 'Get User',
      description: 'Retrieve details for a given user ID',

      options: [],
      inputs: [
        { id: 'userId', name: 'User ID', type: WrappedTypes.CStringType, },
        { id: 'age', name: 'Age', type: WrappedTypes.CNumberType, },
      ],
      outputs: [
        { id: 'user', name: 'User', type: CUserType, },
      ],
    });
  }

  execute(input: TNodeInput): TNodeOutput {
    return {
      user: CUserType.fromNative({
        id: input.userId.value,
        username: 'username',
        age: input.age.value,
        createdAt: new Date(),
      }),
    };
  }
}
