import React from 'react';
import ReactFlow, { ReactFlowProvider, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'default',
    data: { label: 'Test Node' },
    position: { x: 250, y: 100 },
  },
];

const initialEdges = [];

function SimpleFlow() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default function FlowBuilderSimple() {
  return (
    <ReactFlowProvider>
      <SimpleFlow />
    </ReactFlowProvider>
  );
}