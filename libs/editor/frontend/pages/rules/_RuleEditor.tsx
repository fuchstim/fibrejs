import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button, notification } from 'antd';

import createEngine, {
  DefaultLinkModel,
  DefaultNodeModel,
  DiagramModel,
  LinkModel,
  NodeModel,
  DagreEngine,
  PathFindingLinkFactory,
  DiagramEngine
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget
} from '@projectstorm/react-canvas-core';

import './_style.css';

import client from '../../common/client';

import { TRuleStageWithNode } from './_types';

async function fetchData(ruleId: string): Promise<{ nodes: NodeModel[], links: LinkModel[] }> {
  const stages = await Promise.all([
    client.getRule(ruleId),
    client.findNodes(),
  ])
    .then(
      ([ rule, nodes, ]) => rule.stages.map<TRuleStageWithNode>(
        stage => ({ ...stage, node: nodes.find(node => node.id === stage.nodeId)!, })
      )
    );

  const nodes: NodeModel[] = [];
  const links: LinkModel[] = [];

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
    marginx: 100,
    marginy: 100,
  },
  includeLinks: true,
  nodeMargin: 500,
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

      fetchData(ruleId)
        .then(data => {
          setNodes(data.nodes);
          setLinks(data.links);
        })
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

      distributeNodes(model);
      rerouteLinks(model);
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
