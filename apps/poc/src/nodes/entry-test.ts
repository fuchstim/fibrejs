import { BaseNode, Types, WrappedTypes } from '@tripwire/engine';

type TNodeInputs = {
  userId: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
};
type TNodeOutputs = {
  userId: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
};

export default class EntryTestNode extends BaseNode<TNodeInputs, TNodeOutputs, Record<string, never>> {
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

  execute(inputs: TNodeInputs): TNodeOutputs {
    return inputs;
  }
}
