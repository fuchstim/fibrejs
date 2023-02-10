import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, notification } from 'antd';

import {
  DiagramEngine
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget
} from '@projectstorm/react-canvas-core';

import './_style.css';

import { fetchStages, createDiagramEngine } from './_common';

export default function RuleEditor() {
  const [ loading, setLoading, ] = useState(false);
  const [ engine, setEngine, ] = useState<DiagramEngine>();

  const { ruleId, } = useParams();

  useEffect(
    () => {
      if (!ruleId) { return; }

      setLoading(true);

      fetchStages(ruleId)
        .then(stages => createDiagramEngine(stages))
        .then(engine => setEngine(engine))
        .catch(e => notification.error({ message: e.message, }))
        .finally(() => setLoading(false));
    },
    []
  );

  const cleanupGraph = () => {
    const model = engine?.getModel();
    if (!model) { return; }

    const links = Object.values(model.getLinks());
    links.forEach(link => {
      if (!link.getSourcePort() || !link.getTargetPort()) {
        model.removeLink(link);
      }
    });
  };

  if (loading || !engine) {
    return (<Spin spinning={loading} style={{ display: 'block', }} />);
  }

  return (
    <div style={{ height: '100%', }} onMouseUp={() => cleanupGraph()}>
      <CanvasWidget
        className="editor-canvas"
        engine={engine}
      />
    </div>
  );
}
