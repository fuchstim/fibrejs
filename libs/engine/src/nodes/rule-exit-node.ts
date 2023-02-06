import BaseNode from './base-node';
import { EPrimitive } from '../constants/types';

type TNodeInput = {
  result: boolean,
};

export default class RuleExitNode extends BaseNode<TNodeInput, TNodeInput> {
  constructor() {
    super({
      id: 'ruleResult',
      name: 'Rule Result',

      inputs: {
        result: { name: 'Rule Result', type: EPrimitive.BOOLEAN, },
      },
      outputs: {},
    });
  }

  execute(input: TNodeInput): TNodeInput {
    return input;
  }
}
