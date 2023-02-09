import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { notification } from 'antd';

import createEngine, {
  DefaultLinkModel,
  DefaultNodeModel,
  DiagramModel,
  LinkModel,
  NodeModel,
  DagreEngine,
  PathFindingLinkFactory,
  DefaultPortModel
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget
} from '@projectstorm/react-canvas-core';

import './_style.css';

import client from '../../common/client';

import { TRuleStageWithNode } from './_types';

async function fetchStages(ruleId: string): Promise<TRuleStageWithNode[]> {
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

function parseStages(stages: TRuleStageWithNode[]): { nodes: NodeModel[], links: LinkModel[] } {
  const nodes = stages.map(stage => {
    const node = new DefaultNodeModel({
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

        console.log({ stage, target, source, sourcePort, targetPort, });

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

const diagramEngine = createEngine();
diagramEngine.setModel(new DiagramModel());

const dagreEngine = new DagreEngine({
  graph: {
    rankdir: 'LR',
    ranker: 'longest-path',
    align: 'DR',
    marginx: 100,
    marginy: 100,
  },
  includeLinks: true,
  nodeMargin: 100,
});

function distributeNodes(model: DiagramModel) {
  dagreEngine.redistribute(model);

  diagramEngine.repaintCanvas();
}

function rerouteLinks(model: DiagramModel) {
  dagreEngine.refreshLinks(model);

  diagramEngine
    .getLinkFactories()
    .getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME)
    .calculateRoutingMatrix();

  diagramEngine.repaintCanvas();
}

export default function RuleEditor() {
  const [ loading, setLoading, ] = useState(false);
  const [ nodes, setNodes, ] = useState<NodeModel[]>([]);
  const [ links, setLinks, ] = useState<LinkModel[]>([]);

  const { ruleId, } = useParams();

  useEffect(
    () => {
      if (!ruleId) { return; }

      setLoading(true);

      fetchStages(ruleId)
        .then(stages => parseStages(stages))
        .then(data => { setNodes(data.nodes); setLinks(data.links); })
        .catch(e => notification.error({ message: e.message, }))
        .finally(() => setLoading(false));
    },
    [ ruleId, ]
  );

  useEffect(
    () => {
      const model = new DiagramModel();

      model.addAll(...nodes, ...links);

      diagramEngine.setModel(model);

      setTimeout(
        () => {
          distributeNodes(model);
          rerouteLinks(model);

          diagramEngine.zoomToFitNodes({ margin: 200, });
        },
        1000
      );
    },
    [ nodes, links, ]
  );

  // const model = new DiagramModel();

  // const node1 = new DefaultNodeModel({
  //   name: 'Node 1',
  //   color: 'rgb(0,192,255)',
  // });
  // node1.setPosition(100, 100);
  // const port1 = node1.addOutPort('Out');

  // const node2 = new DefaultNodeModel({
  //   name: 'Node 2',
  //   color: 'rgb(0,192,255)',
  // });
  // node2.setPosition(100, 200);
  // const port2 = node2.addInPort('In');

  // const link = port1.link<DefaultLinkModel>(port2);
  // link.addLabel('Hello World!');

  // model.addAll(node1, node2, link);
  // diagramEngine.setModel(model);

  return (
    <>
      <CanvasWidget
        className="editor-canvas"
        engine={diagramEngine}
      />
    </>
  );
}
