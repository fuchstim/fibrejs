import { BaseNode, Types, WrappedTypes } from '@tripwire/engine';

type TNodeInputs = {
  userId: WrappedTypes.TStringType,
  dateOfBirth: WrappedTypes.TDateType,
};
type TNodeOutputs = {
  userId: WrappedTypes.TStringType,
  dateOfBirth: WrappedTypes.TDateType,
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
        { id: 'dateOfBirth', name: 'Date of Birth', type: WrappedTypes.WDateType, },
      ],
      outputs: [
        { id: 'userId', name: 'User ID', type: WrappedTypes.WStringType, },
        { id: 'dateOfBirth', name: 'Date of Birth', type: WrappedTypes.WDateType, },
      ],
    });
  }

  execute(inputs: TNodeInputs): TNodeOutputs {
    return inputs;
  }
}
