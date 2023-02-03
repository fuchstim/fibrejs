import BaseNode from './base-node';
import { EPrimitive } from '../constants/types';

type TNodeInput = {
  result: boolean,
};

export default class RuleResultNode extends BaseNode<TNodeInput, TNodeInput> {
  constructor() {
    super({
      id: 'ruleResult',
      title: 'Rule Result',

      inputs: {
        result: { title: 'Rule Result', type: EPrimitive.BOOLEAN, },
      },
      outputs: {},
    });
  }

  execute(input: TNodeInput): TNodeInput {
    return input;
  }
}
