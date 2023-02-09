import { BaseNode, Types, WrappedTypes } from '@tripwire/engine';

type TNodeInput = {
  userId: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
};
type TNodeOutput = {
  userId: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
};

export default class EntryTestNode extends BaseNode<TNodeInput, TNodeOutput, void> {
  constructor() {
    super({
      id: 'entryTest',
      name: 'Test Entry Node',
      type: Types.Node.ENodeType.ENTRY,

      options: [],
      inputs: [],
      outputs: [
        { id: 'userId', name: 'User ID', type: WrappedTypes.CStringType, },
        { id: 'age', name: 'Age', type: WrappedTypes.CNumberType, },
      ],
    });
  }

  execute(input: TNodeInput): TNodeOutput {
    return input;
  }
}
