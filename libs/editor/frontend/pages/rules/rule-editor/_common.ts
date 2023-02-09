import { LinkModel } from '@projectstorm/react-diagrams';
import { TRuleStageWithNode } from './_types';
import client from '../../../common/client';

import EditorNodeModel from './graph-elements/node/model';

export async function fetchStages(ruleId: string): Promise<TRuleStageWithNode[]> {
  const stages = await Promise.all([
    client.getRule(ruleId),
    client.findNodes(),
  ])
    .then(
      ([ rule, nodes, ]) => rule.stages.map<TRuleStageWithNode>(
        stage => ({ ...stage, node: nodes.find(node => node.id === stage.nodeId)!, })
      )
    );

  return stages;
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
