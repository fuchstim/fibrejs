import { BaseNode, Types, WrappedTypes } from '@fibre/engine';
import { WDateType, WNumberType } from '@fibre/engine/src/common/wrapped-types';

type TNodeInputs = {
  userId: WrappedTypes.TStringType,
  age: WrappedTypes.TNumberType,
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
        { id: 'age', name: 'Age', type: WrappedTypes.WNumberType, },
      ],
      outputs: [
        { id: 'userId', name: 'User ID', type: WrappedTypes.WStringType, },
        { id: 'dateOfBirth', name: 'Date of Birth', type: WrappedTypes.WDateType, },
      ],
    });
  }

  execute(inputs: TNodeInputs): TNodeOutputs {
    const age = WNumberType.unwrap(inputs.age);

    const dateOfBirth = new Date();
    dateOfBirth.setFullYear(
      dateOfBirth.getFullYear() - age
    );

    return {
      userId: inputs.userId,
      dateOfBirth: WDateType.wrap(dateOfBirth),
    };
  }
}
