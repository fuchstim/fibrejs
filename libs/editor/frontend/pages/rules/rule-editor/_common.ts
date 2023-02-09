import { DefaultLinkModel, DefaultPortModel, LinkModel, NodeModel } from '@projectstorm/react-diagrams';
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
  const nodes = stages.map(stage => {
    const node = new EditorNodeModel({
      id: stage.id,
      name: stage.node.name,
      color: 'rgb(0,192,255)',
    });

    stage.node.inputs.forEach(
      input => node.addPort(
        new DefaultPortModel({
          id: `${stage.id}-${input.id}`,
          in: true,
          name: input.name,
        })
      )
    );

    stage.node.outputs.forEach(
      output => node.addPort(
        new DefaultPortModel({
          id: `${stage.id}-${output.id}`,
          in: false,
          name: output.name,
        })
      )
    );

    return node;
  });

  const links: LinkModel[] = stages.flatMap(stage => {
    const target = nodes.find(n => n.getID() === stage.id);
    if (!target) { return []; }

    const links = stage.inputs
      .flatMap(input => {
        const source = nodes.find(n => n.getID() === input.ruleStageId);
        if (!source) { return []; }

        const sourcePortId = `${source.getID()}-${input.outputId.split('.')[0]}`;
        const targetPortId = `${target.getID()}-${input.inputId.split('.')[0]}`;

        const sourcePort = source.getOutPorts().find(p => p.getID() === sourcePortId);
        const targetPort = target.getInPorts().find(p => p.getID() === targetPortId);
        if (!sourcePort || !targetPort) { return []; }

        const link = sourcePort.link<DefaultLinkModel>(targetPort);

        return [ link, ];
      });

    return links;
  });

  return {
    nodes,
    links,
  };
}
