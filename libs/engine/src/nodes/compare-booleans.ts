import { BaseNode } from '../common/base-node';
import { WBooleanType, TBooleanType } from '../common/wrapped-types';
import { ENodeMetadataOptionType, TNodeContext } from '../types/node';

type TNodeInput = {
  inputA: TBooleanType,
  inputB: TBooleanType,
};

type TNodeOutput = {
  result: TBooleanType,
};

enum EOperation {
  NEITHER = 'NEITHER',
  EITHER = 'EITHER',
  BOTH = 'BOTH'
}
type TNodeOptions = {
  operation: EOperation
};

export default class CompareBooleans extends BaseNode<TNodeInput, TNodeOutput, TNodeOptions> {
  constructor() {
    super({
      id: 'compareBooleans',
      name: 'Compare Booleans',

      options: [
        {
          id: 'operation',
          name: 'Operation',
          type: ENodeMetadataOptionType.DROP_DOWN,
          dropDownOptions: [
            { id: EOperation.NEITHER, name: 'Neither', },
            { id: EOperation.EITHER, name: 'Either', },
            { id: EOperation.BOTH, name: 'Both', },
          ],
          validate: v => Object.values(EOperation).includes(v),
        },
      ],
      inputs: [
        { id: 'inputA', name: 'Input A', type: WBooleanType, },
        { id: 'inputB', name: 'Input B', type: WBooleanType, },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: WBooleanType, },
      ],
    });
  }

  execute({ inputA, inputB, }: TNodeInput, context: TNodeContext<TNodeOptions>): TNodeOutput {
    const result = {
      [EOperation.NEITHER]: !inputA.value && !inputB.value,
      [EOperation.EITHER]: inputA.value || inputB.value,
      [EOperation.BOTH]: inputA.value && inputB.value,
    }[context.nodeOptions.operation];

    return {
      result: { value: result, },
    };
  }
}
