import { LinkModel, NodeModel } from '@projectstorm/react-diagrams';
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

export function parseStages(stages: TRuleStageWithNode[]): { nodes: NodeModel[], links: LinkModel[] } {
  const nodes = stages.map(stage => new EditorNodeModel({ ruleStage: stage, }));

  const links: LinkModel[] = stages.flatMap(stage => {
    const target = nodes.find(n => n.getID() === stage.id);
    if (!target) { return []; }

    const links = stage.inputs
      .flatMap(input => {
        const source = nodes.find(n => n.getID() === input.ruleStageId);
        if (!source) { return []; }

        const sourcePort = source.getOutputPort(input.outputId.split('.')[0]);
        const targetPort = target.getInputPort(input.inputId.split('.')[0]);
        if (!sourcePort || !targetPort) { return []; }

        const link = sourcePort.link(targetPort);

        return [ link, ];
      });

    return links;
  });

  return {
    nodes,
    links,
  };
}
