import React from 'react';

import { Canvas } from 'reaflow';

export default function Index() {
  const nodes = [
    {
      id: '1',
      text: '1',
    },
    {
      id: '2',
      text: '2',
    },
  ];

  const edges = [
    {
      id: '1-2',
      from: '1',
      to: '2',
    },
  ];

  return (
    <div>
      <Canvas
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}
