import Logger from '@fibrejs/logger';
import assert from 'assert';

import CompareBooleansNode, { EOperation } from '../../src/nodes/compare-booleans';

const node = new CompareBooleansNode();

describe('Compare Booleans Node', () => {
  const executeNode = async (inputA: any, inputB: any, operation: string) => {
    const context = {
      executionId: 'test',
      logger: new Logger().ns('compare-booleans.test'),
      rules: [],
      ruleSets: [],
      nodeOptions: { operation: operation as EOperation, },
    };

    const result = await node.run({ inputA, inputB, }, context);

    return result.outputs.result;
  };

  const assertResult = async (inputA: boolean, inputB: boolean, operation: EOperation, expected: boolean) => {
    const actual = await executeNode(inputA, inputB, operation);

    assert.strictEqual(actual, expected, 'Node output does not match expected result');
  };

  it('Produces valid results for all configurations', async () => {
    await Promise.all([
      assertResult(false, false, EOperation.NEITHER, true),
      assertResult(false, true, EOperation.NEITHER, false),
      assertResult(true, false, EOperation.NEITHER, false),
      assertResult(true, true, EOperation.NEITHER, false),

      assertResult(false, false, EOperation.EITHER, false),
      assertResult(false, true, EOperation.EITHER, true),
      assertResult(true, false, EOperation.EITHER, true),
      assertResult(true, true, EOperation.EITHER, true),

      assertResult(false, false, EOperation.BOTH, false),
      assertResult(false, true, EOperation.BOTH, false),
      assertResult(true, false, EOperation.BOTH, false),
      assertResult(true, true, EOperation.BOTH, true),
    ]);
  });

  it('fails if an invalid operation is specified', async () => {
    const invalidOperation = 'INVALID';
    await assert.rejects(
      executeNode(true, true, invalidOperation),
      { message: `Failed to execute node compareBooleans with invalid context (Invalid option configs: Operation (${invalidOperation} is not a valid option))`, }
    );
  });

  it('fails if an invalid input is specified', async () => {
    const inputA = 3;
    const inputB = 'hello!';

    await assert.rejects(
      executeNode(inputA, inputB, EOperation.BOTH),
      { message: `Failed to execute node compareBooleans with invalid inputs (Invalid inputs for values: inputA (\`${inputA}\` is not a boolean), inputB (\`"${inputB}"\` is not a boolean)})`, }
    );
  });
});
