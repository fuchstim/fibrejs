import { BaseNode, Types } from '@tripwire/engine';

type TNodeInput = {
  userId: Types.TStringType,
};
type TNodeOutput = {
  userId: Types.TStringType,
};

export default class EntryTestNode extends BaseNode<TNodeInput, TNodeOutput, never> {
  constructor() {
    super({
      id: 'entryTest',
      name: 'Test Entry Node',

      options: [],
      inputs: [],
      outputs: [
        { id: 'userId', name: 'User ID', type: Types.CStringType, },
      ],
    });
  }

  execute(input: TNodeInput): TNodeOutput {
    return input;
  }
}
