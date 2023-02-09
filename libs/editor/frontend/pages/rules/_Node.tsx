import React, { memo } from 'react';
import { NodeProps, Handle, HandleProps, Position, useStore } from 'reactflow';

import { TRuleStageWithNode } from './_types';

function calculateHandleOffset(index: number, count: number, width: number) {
  if (count === 1) { return '50%'; }

  const padding = width * 0.2;
  const availableWidth = width - (padding * 2);
  const spacing = availableWidth / (count - 1);

  return padding + index * spacing;
}

function Node(props: NodeProps<{ stage: TRuleStageWithNode }>) {
  const nodeWidth = useStore(store => store.nodeInternals.get(props.id)?.width ?? 0);

  const { node, } = props.data.stage;

  const inputs = node.inputs.map<HandleProps>(
    ({ id, }, index) => ({
      id,
      type: 'target',
      position: Position.Top,
      style: { left: calculateHandleOffset(index, node.inputs.length, nodeWidth), },
    })
  );
  const outputs = node.outputs.map<HandleProps>(
    ({ id, }, index) => ({
      id,
      type: 'source',
      position: Position.Bottom,
      style: { left: calculateHandleOffset(index, node.outputs.length, nodeWidth), },
    })
  );

  return (
    <div style={{ background: 'white', border: '1px solid black', borderRadius: '5px', padding: '10px', }}>
      {...inputs.map(input => (<Handle key={input.id} {...input} />))}
      <div>
        <span>{ node.name }</span>
      </div>
      {...outputs.map(output => (<Handle key={output.id} {...output} />))}
    </div>
  );
}

export default memo(Node);
