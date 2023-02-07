import React from 'react';

import createEngine, {
  DefaultLinkModel,
  DefaultNodeModel,
  DiagramModel
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget
} from '@projectstorm/react-canvas-core';

export default function RuleEditor() {
  const engine = createEngine();

  // node 1
  const node1 = new DefaultNodeModel({
    name: 'Node 1',
    color: 'rgb(0,192,255)',
  });
  node1.setPosition(100, 100);
  const port1 = node1.addOutPort('Out');

  // node 2
  const node2 = new DefaultNodeModel({
    name: 'Node 1',
    color: 'rgb(0,192,255)',
  });
  node2.setPosition(100, 100);
  const port2 = node2.addOutPort('Out');

  // link them and add a label to the link
  const link = port1.link<DefaultLinkModel>(port2);
  link.addLabel('Hello World!');

  const model = new DiagramModel();
  model.addAll(node1, node2, link);
  engine.setModel(model);

  return (
    <div>
      <CanvasWidget engine={engine} />
    </div>
  );
}
