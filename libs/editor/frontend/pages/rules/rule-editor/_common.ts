import { LinkModel } from '@projectstorm/react-diagrams';
import { TRuleStageWithNode } from './_types';
import client from '../../../common/client';

import EditorNodeModel from './graph-elements/node/model';
import { Types } from '@tripwire/engine';

export async function fetchStages(ruleId: string): Promise<TRuleStageWithNode[]> {
  const rule = await client.getRule(ruleId);

  const nodeOptions = rule.stages.reduce(
    (acc, { nodeId, nodeOptions, }) => ({ ...acc, [nodeId]: nodeOptions, }),
    {} as Types.Common.TKeyValue<string, Types.Node.TNodeOptions>
  );

  const nodes = await client.findNodes(nodeOptions);

  return rule.stages.map<TRuleStageWithNode>(
    stage => ({ ...stage, node: nodes.find(node => node.id === stage.nodeId)!, })
  );
}

export function createNodeLinks(nodes: EditorNodeModel[]): LinkModel[] {
  const links: LinkModel[] = nodes.flatMap(
    node => node.getOptions().ruleStage.inputs
      .flatMap(input => {
        const source = nodes.find(n => n.getID() === input.ruleStageId);
        if (!source) { return []; }

        const sourcePort = source.getOutputPort(input.outputId.split('.')[0]);
        const targetPort = node.getInputPort(input.inputId.split('.')[0]);
        if (!sourcePort || !targetPort) { return []; }

        const link = sourcePort.link(targetPort);

        return [ link, ];
      })
  );

  return links;
}
