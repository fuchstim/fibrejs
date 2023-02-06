import { BaseNode, Types } from '@fraud-tool/lib-engine';

import { CUserType, TUserType } from '../input-output-types/user';
import { CStringType } from '@fraud-tool/lib-engine/dist/constants/types';

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
        createdAt: Types.CDateType.fromNative(new Date()),
      },
    };
  }
}
