import fs from 'fs';
import Engine from '@tripwire/lib-engine';

import GetUserNode from './nodes/get-user';
import { ERuleSeverity } from '@tripwire/lib-engine/dist/constants/severities';
import EntryTestNode from './nodes/entry-test';
import { ERuleStageType } from '@tripwire/lib-engine/dist/rule/rule-stage';

const engine = new Engine({
  customNodes: [
    new GetUserNode(),
    new EntryTestNode(),
  ],
});

const config = {
  version: 1,
  ruleSets: [
    {
      id: 'testRuleSet',
      name: 'Test Rule Set',
      rules: [
        {
          id: 'rule-1',
          name: 'Rule 1',
          severity: ERuleSeverity.CRITICAL,
          stages: [
            {
              id: 'stage-1',
              type: ERuleStageType.ENTRY,
              nodeId: 'entryTest',
              inputs: [],
              nodeOptions: {},
            },
            {
              id: 'stage-2',
              nodeId: 'getUser',
              inputs: [
                { ruleStageId: 'stage-1', outputId: 'userId', inputId: 'userId', },
              ],
              nodeOptions: {},
            },
            {
              id: 'stage-3',
              nodeId: 'compareNumbers',
              inputs: [
                { ruleStageId: 'stage-2', outputId: 'user.age', inputId: 'inputA', },
                { ruleStageId: 'stage-4', outputId: 'value', inputId: 'inputB', },
              ],
              nodeOptions: {
                operation: 'LESS',
              },
            },
            {
              id: 'stage-4',
              nodeId: 'staticValue',
              inputs: [],
              nodeOptions: {
                valueType: 'NUMBER',
                value: 50,
              },
            },
            {
              id: 'stage-5',
              nodeId: 'exit',
              type: ERuleStageType.EXIT,
              inputs: [
                { ruleStageId: 'stage-3', outputId: 'result', inputId: 'result', },
              ],
              nodeOptions: {},
            },
          ],
        },
      ],
    },
  ],
};

engine.loadConfig(config);

fs.writeFileSync(
  'config.json',
  JSON.stringify(engine.exportConfig(), null, 2)
);
