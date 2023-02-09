import { BaseNode } from '../common/base-node';
import { CBooleanType, TBooleanType } from '../common/wrapped-types';
import { ENodeType } from '../types/node';

type TNodeInput = {
  result: TBooleanType,
};

export default class ExitNode extends BaseNode<TNodeInput, TNodeInput, void> {
  constructor() {
    super({
      id: 'exit',
      name: 'Rule Result',
      type: ENodeType.EXIT,

      options: [],
      inputs: [
        { id: 'result', name: 'Rule Result', type: CBooleanType, },
      ],
      outputs: [],
    });
  }

  execute(input: TNodeInput): TNodeInput {
    return input;
  }
}
