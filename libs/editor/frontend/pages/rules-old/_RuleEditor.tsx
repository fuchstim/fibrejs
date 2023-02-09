import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { notification } from 'antd';

import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';

import client from '../../common/client';

import NodeComponent from './_Node';
import { TRuleStageWithNode } from './_types';

function sortStages(stages: TRuleStageWithNode[]): TRuleStageWithNode[][] {
  const exitStage = stages.find(s => s.type === 'EXIT')!;

  const sortedStages = [ [ exitStage, ], ];
  while (sortedStages.flatMap(s => s).length < stages.length) {
    const existingIds = sortedStages.flatMap(
      stages => stages.map(s => s.id)
    );
    const requiredIds = stages
      .filter(stage => existingIds.includes(stage.id))
      .flatMap(
        stage => stage.inputs.map(i => i.ruleStageId)
      );

    sortedStages.push(
      stages.filter(
        stage => !existingIds.includes(stage.id) && requiredIds.includes(stage.id)
      )
    );
  }

  return sortedStages.reverse();
}

async function fetchData(ruleId: string): Promise<{ nodes: Node[], edges: Edge[] }> {
  const stages = await Promise.all([
    client.getRule(ruleId),
    client.findNodes(),
  ])
    .then(
      ([ rule, nodes, ]) => rule.stages.map<TRuleStageWithNode>(
        stage => ({ ...stage, node: nodes.find(node => node.id === stage.nodeId)!, })
      )
    );

  const sortedStages = sortStages(stages);

  const nodes = sortedStages.flatMap(
    (stages, yIndex) => stages.map(
      (stage, xIndex) => ({
        id: stage.id,
        data: { stage, },
        type: 'node',
        position: { x: 200 * xIndex, y: 100 * yIndex, },
      })
    )
  );

  return {
    nodes,
    edges: [],
  };
}

export default function RuleEditor() {
  const [ loading, setLoading, ] = useState(false);
  const [ instance, setInstance, ] = useState<ReactFlowInstance>();

  const [ nodes, setNodes, onNodesChange, ] = useNodesState([]);
  const [ edges, setEdges, onEdgesChange, ] = useEdgesState([]);

  const { ruleId, } = useParams();

  useEffect(
    () => {
      if (!ruleId) { return; }

      setLoading(true);

      fetchData(ruleId)
        .then(data => {
          setNodes(data.nodes);
          setEdges(data.edges);

          instance?.fitView();
        })
        .catch(e => notification.error({ message: e.message, }))
        .finally(() => setLoading(false));
    },
    [ ruleId, ]
  );

  const onConnect = useCallback(
    (edge: Edge | Connection) => setEdges(
      (eds) => addEdge(edge, eds)
    ),
    [ setEdges, ]
  );

  const onInit = useCallback(
    (instance: ReactFlowInstance) => setInstance(instance),
    []
  );

  const nodeTypes = useMemo(() => ({ node: NodeComponent, }), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={onInit}
      nodeTypes={nodeTypes}
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
}
