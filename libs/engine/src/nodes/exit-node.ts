import BaseNode from './base-node';
import { CBooleanType } from '../constants/types';

type TNodeInput = {
  result: boolean,
};

export default class ExitNode extends BaseNode<TNodeInput, TNodeInput, never> {
  constructor() {
    super({
      id: 'ruleResult',
      name: 'Rule Result',

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
