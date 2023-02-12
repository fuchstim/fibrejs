import { BaseNode, Types, WrappedTypes } from '@tripwire/engine';

type TNodeInput = {
  userId: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
};
type TNodeOutput = {
  userId: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
};

export default class EntryTestNode extends BaseNode<TNodeInput, TNodeOutput, Record<string, never>> {
  constructor() {
    super({
      id: 'entryTest',
      name: 'Test Entry Node',
      type: Types.Node.ENodeType.ENTRY,
      description: 'Test entry node',

      defaultOptions: {},
      options: [],
      inputs: [
        { id: 'userId', name: 'User ID', type: WrappedTypes.WStringType, },
        { id: 'age', name: 'Age', type: WrappedTypes.WNumberType, },
      ],
      outputs: [
        { id: 'userId', name: 'User ID', type: WrappedTypes.WStringType, },
        { id: 'age', name: 'Age', type: WrappedTypes.WNumberType, },
      ],
    });
  }

  execute(input: TNodeInput): TNodeOutput {
    return input;
  }
}
