import { BaseNode, Types } from '@tripwire/lib-engine';

import { CUserType, TUserType } from '../input-output-types/user';
import { CStringType } from '@tripwire/lib-engine/dist/constants/types';

type TNodeInput = {
  userId: string,
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
        { id: 'userId', name: 'User ID', type: CStringType, },
      ],
      outputs: [
        { id: 'user', name: 'User', type: CUserType, },
      ],
    });
  }

  execute(input: TNodeInput): TNodeOutput {
    return {
      user: {
        id: input.userId,
        username: 'username',
        age: 21,
        createdAt: Types.CDateType.fromNative(new Date()),
      },
    };
  }
}
