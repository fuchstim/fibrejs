import { BaseNode } from '../common/base-node';
import { WBooleanType } from '../common/wrapped-types';
import { ENodeType } from '../types/node';

type TNodeInputs = {
  result: boolean,
};

export default class ExitNode extends BaseNode<TNodeInputs, TNodeInputs, Record<string, never>> {
  constructor() {
    super({
      id: 'exit',
      name: 'Rule Result',
      type: ENodeType.EXIT,
      description: 'Return final rule result',

      defaultOptions: {},
      options: [],
      inputs: [
        { id: 'result', name: 'Rule Result', type: WBooleanType, },
      ],
      outputs: [
        { id: 'result', name: 'Rule Result', type: WBooleanType, },
      ],
    });
  }

  execute(inputs: TNodeInputs): TNodeInputs {
    return inputs;
  }
}
