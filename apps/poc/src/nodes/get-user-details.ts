import { Decorators, Types } from '@fraud-tool/lib-nodes';

import { CUserType, TUserType } from '../input-output-types/user';
import { CDateType } from '@fraud-tool/lib-nodes/dist/constants/types';

type TNodeInput = {
  userId: string,
};
type TNodeOutput = {
  user: TUserType,
};

@Decorators.Node<TNodeInput, TNodeOutput>({
  id: 'getUser',
  title: 'Get User',
  description: 'Retrieve details for a given user ID',

  inputs: {
    userId: { title: 'User ID', type: Types.EPrimitive.STRING, },
  },
  outputs: {
    user: { title: 'User', type: CUserType, },
  },
})
export default class GetUserNode extends Decorators.ANode<TNodeInput, TNodeOutput> {
  executor(input: TNodeInput): TNodeOutput {
    return {
      user: {
        id: input.userId,
        username: 'username',
        createdAt: CDateType.fromNative(new Date()),
      },
    };
  }
}
