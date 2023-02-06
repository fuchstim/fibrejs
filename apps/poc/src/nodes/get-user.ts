import { BaseNode, Types } from '@tripwire/engine';

import { CUserType, TUserType } from '../input-output-types/user';

type TNodeInput = {
  userId: Types.TStringType,
};
type TNodeOutput = {
  user: TUserType,
};

export default class GetUserNode extends BaseNode<TNodeInput, TNodeOutput, never> {
  constructor() {
    super({
      id: 'getUser',
      name: 'Get User',
      description: 'Retrieve details for a given user ID',

      options: [],
      inputs: [
        { id: 'userId', name: 'User ID', type: Types.CStringType, },
      ],
      outputs: [
        { id: 'user', name: 'User', type: CUserType, },
      ],
    });
  }

  execute(input: TNodeInput): TNodeOutput {
    return {
      user: {
        id: input.userId.value,
        username: 'username',
        age: 21,
        createdAt: Types.CDateType.fromNative(new Date()),
      },
    };
  }
}
