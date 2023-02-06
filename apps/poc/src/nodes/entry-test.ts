import { BaseNode } from '@fraud-tool/lib-engine';

import { CStringType } from '@fraud-tool/lib-engine/dist/constants/types';

type TNodeInput = {
  userId: string,
};
type TNodeOutput = {
  userId: string,
};

export default class EntryTestNode extends BaseNode<TNodeInput, TNodeOutput, never> {
  constructor() {
    super({
      id: 'entryTest',
      name: 'Test Entry Node',

      options: [],
      inputs: [],
      outputs: [
        { id: 'userId', name: 'User ID', type: CStringType, },
      ],
    });
  }

  execute(input: TNodeInput): TNodeOutput {
    return input;
  }
}
