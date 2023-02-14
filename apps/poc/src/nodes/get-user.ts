import { BaseNode, WrappedTypes } from '@tripwire/engine';

import { WUserType, TWrappedUserType } from '../input-output-types/user';

type TNodeInputs = {
  userId: WrappedTypes.TStringType,
  dateOfBirth: WrappedTypes.TDateType,
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
        { id: 'dateOfBirth', name: 'Date of Birth', type: WrappedTypes.WDateType, },
      ],
      outputs: [
        { id: 'user', name: 'User', type: WUserType, },
      ],
    });
  }

  async execute(inputs: TNodeInputs): Promise<TNodeOutputs> {
    return {
      user: WUserType.wrap({
        id: WrappedTypes.WStringType.unwrap(inputs.userId),
        username: 'username',
        age: new Date().getFullYear() - WrappedTypes.WDateType.unwrap(inputs.dateOfBirth).getFullYear(),
        createdAt: new Date(),
      }),
    };
  }
}
