import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { notification } from 'antd';

import createEngine, {
  DiagramModel,
  LinkModel,
  NodeModel,
  DagreEngine,
  PathFindingLinkFactory
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget
} from '@projectstorm/react-canvas-core';

import './_style.css';

import { fetchStages, parseStages } from './_common';

import EditorNodeFactory from './graph-elements/node/factory';

const diagramEngine = createEngine();
diagramEngine
  .getNodeFactories()
  .registerFactory(new EditorNodeFactory());
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
  const [ _, setLoading, ] = useState(false);
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
        100
      );
    },
    [ nodes, links, ]
  );

  return (
    <>
      <CanvasWidget
        className="editor-canvas"
        engine={diagramEngine}
      />
    </>
  );
}
