import { BaseNode, WrappedTypes } from '@tripwire/engine';

import { WUserType, TWrappedUserType } from '../input-output-types/user';

type TNodeInputs = {
  userId: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
};
type TNodeOutputs = {
  user: TWrappedUserType,
};

export default class GetUserNode extends BaseNode<TNodeInputs, TNodeOutputs, Record<string, never>> {
  constructor() {
    super({
      id: 'getUser',
      name: 'Get User',
      description: 'Retrieve details for a user ID',

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

  async execute(inputs: TNodeInputs): Promise<TNodeOutputs> {
    return {
      user: WUserType.fromNative({
        id: inputs.userId.value,
        username: 'username',
        age: inputs.age.value,
        createdAt: new Date(),
      }),
    };
  }
}
