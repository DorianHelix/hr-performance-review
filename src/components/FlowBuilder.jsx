import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  useReactFlow,
  MarkerType,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  GitBranch, Plus, Save, Download, Upload, Trash2,
  User, CheckCircle, AlertCircle, Mail, Database,
  Settings, Zap, Clock, FileText, Calendar, Target,
  Activity, Hash, MessageSquare, Filter
} from 'lucide-react';
import { useToast } from './Toast';

// Custom node types
const StartNode = ({ data, selected }) => {
  return (
    <div className={`glass-card p-4 rounded-2xl min-w-[180px] border-2 relative ${
      selected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-green-500/50'
    } bg-gradient-to-br from-green-500/20 to-emerald-500/20`}>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white"
        style={{ bottom: -6 }}
      />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <div className="text-white font-semibold">Start</div>
          <div className="text-xs text-white/60">{data.label || 'Entry Point'}</div>
        </div>
      </div>
    </div>
  );
};

const ProcessNode = ({ data, selected }) => {
  return (
    <div className={`glass-card p-4 rounded-2xl min-w-[180px] border-2 relative ${
      selected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-blue-500/50'
    } bg-gradient-to-br from-blue-500/20 to-cyan-500/20`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
        style={{ bottom: -6 }}
      />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Activity size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold">{data.label || 'Process'}</div>
          <div className="text-xs text-white/60">{data.description || 'Action step'}</div>
        </div>
      </div>
    </div>
  );
};

const DecisionNode = ({ data, selected }) => {
  return (
    <div className={`glass-card p-4 rounded-2xl min-w-[180px] border-2 relative ${
      selected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-yellow-500/50'
    } bg-gradient-to-br from-yellow-500/20 to-orange-500/20`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-yellow-500 !border-2 !border-white"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3 h-3 !bg-green-500 !border-2 !border-white"
        style={{ right: -6 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="w-3 h-3 !bg-red-500 !border-2 !border-white"
        style={{ left: -6 }}
      />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <GitBranch size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold">{data.label || 'Decision'}</div>
          <div className="text-xs text-white/60">{data.condition || 'If/Then'}</div>
        </div>
      </div>
    </div>
  );
};

const DataNode = ({ data, selected }) => {
  return (
    <div className={`glass-card p-4 rounded-2xl min-w-[180px] border-2 relative ${
      selected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-purple-500/50'
    } bg-gradient-to-br from-purple-500/20 to-pink-500/20`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
        style={{ bottom: -6 }}
      />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Database size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold">{data.label || 'Data'}</div>
          <div className="text-xs text-white/60">{data.source || 'Database'}</div>
        </div>
      </div>
    </div>
  );
};

const EndNode = ({ data, selected }) => {
  return (
    <div className={`glass-card p-4 rounded-2xl min-w-[180px] border-2 relative ${
      selected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-red-500/50'
    } bg-gradient-to-br from-red-500/20 to-pink-500/20`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-red-500 !border-2 !border-white"
        style={{ top: -6 }}
      />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
          <CheckCircle size={20} className="text-white" />
        </div>
        <div>
          <div className="text-white font-semibold">End</div>
          <div className="text-xs text-white/60">{data.label || 'Complete'}</div>
        </div>
      </div>
    </div>
  );
};

// Node types mapping
const nodeTypes = {
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  data: DataNode,
  end: EndNode,
};

// Initial nodes and edges
const initialNodes = [
  {
    id: '1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: 'Start Flow' },
  },
  {
    id: '2',
    type: 'process',
    position: { x: 250, y: 150 },
    data: { label: 'Initialize', description: 'Setup process' },
  },
  {
    id: '3',
    type: 'decision',
    position: { x: 250, y: 250 },
    data: { label: 'Check Status', condition: 'Is valid?' },
  },
  {
    id: '4',
    type: 'process',
    position: { x: 100, y: 350 },
    data: { label: 'Handle Error', description: 'Log and retry' },
  },
  {
    id: '5',
    type: 'data',
    position: { x: 400, y: 350 },
    data: { label: 'Save Data', source: 'Database' },
  },
  {
    id: '6',
    type: 'end',
    position: { x: 250, y: 450 },
    data: { label: 'Complete' },
  },
];

const initialEdges = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    animated: true,
    style: { stroke: '#60a5fa', strokeWidth: 2 }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3',
    animated: true,
    style: { stroke: '#60a5fa', strokeWidth: 2 }
  },
  { 
    id: 'e3-4', 
    source: '3', 
    target: '4',
    sourceHandle: 'left',
    label: 'No',
    animated: true,
    style: { stroke: '#f87171', strokeWidth: 2 },
    labelStyle: { fill: '#f87171', fontWeight: 700 }
  },
  { 
    id: 'e3-5', 
    source: '3', 
    target: '5',
    sourceHandle: 'right',
    label: 'Yes',
    animated: true,
    style: { stroke: '#34d399', strokeWidth: 2 },
    labelStyle: { fill: '#34d399', fontWeight: 700 }
  },
  { 
    id: 'e4-6', 
    source: '4', 
    target: '6',
    animated: true,
    style: { stroke: '#60a5fa', strokeWidth: 2 }
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6',
    animated: true,
    style: { stroke: '#60a5fa', strokeWidth: 2 }
  },
];

// Flow Builder Component
function FlowBuilder() {
  const { showSuccess, showError, showInfo } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [flowName, setFlowName] = useState('Untitled Flow');
  const [selectedNode, setSelectedNode] = useState(null);

  // Handle connection
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#60a5fa',
      },
    }, eds)),
    [setEdges]
  );

  // Add new node
  const addNode = (type) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { 
        label: type.charAt(0).toUpperCase() + type.slice(1),
        description: 'New node'
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowNodeMenu(false);
    showSuccess(`Added ${type} node`);
  };

  // Delete selected node
  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode && edge.target !== selectedNode));
      setSelectedNode(null);
      showSuccess('Node deleted');
    }
  };

  // Save flow
  const saveFlow = () => {
    const flow = {
      name: flowName,
      nodes,
      edges,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('hr_flow_builder', JSON.stringify(flow));
    showSuccess('Flow saved successfully');
  };

  // Load flow
  const loadFlow = () => {
    const saved = localStorage.getItem('hr_flow_builder');
    if (saved) {
      const flow = JSON.parse(saved);
      setFlowName(flow.name);
      setNodes(flow.nodes);
      setEdges(flow.edges);
      showSuccess('Flow loaded successfully');
    } else {
      showError('No saved flow found');
    }
  };

  // Export flow
  const exportFlow = () => {
    const flow = {
      name: flowName,
      nodes,
      edges,
    };
    const dataStr = JSON.stringify(flow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${flowName.replace(/\s+/g, '-').toLowerCase()}-flow.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showSuccess('Flow exported');
  };

  // Clear flow
  const clearFlow = () => {
    setNodes([]);
    setEdges([]);
    setFlowName('Untitled Flow');
    showInfo('Flow cleared');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="glass-card-large m-4 mb-2 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="glass-card p-2 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-600/20 border-purple-400/30">
              <GitBranch size={20} className="text-purple-300" />
            </div>
            <div>
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="text-xl font-bold text-white bg-transparent border-b border-white/20 focus:border-purple-400 outline-none"
              />
              <p className="text-xs text-white/60 mt-1">Visual Flow Builder</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNodeMenu(!showNodeMenu)}
              className="glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Plus size={18} />
              Add Node
            </button>
            <button
              onClick={saveFlow}
              className="glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Save size={18} />
              Save
            </button>
            <button
              onClick={loadFlow}
              className="glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Upload size={18} />
              Load
            </button>
            <button
              onClick={exportFlow}
              className="glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={clearFlow}
              className="glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform bg-red-500/20 border-red-500/30"
            >
              <Trash2 size={18} />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Node Menu Dropdown */}
      {showNodeMenu && (
        <div className="absolute top-20 right-4 z-50 glass-card-large p-4 rounded-2xl">
          <div className="text-white font-semibold mb-3">Add Node Type</div>
          <div className="space-y-2">
            <button
              onClick={() => addNode('start')}
              className="w-full glass-button px-4 py-2 flex items-center gap-2 hover:bg-green-500/20"
            >
              <Zap size={18} className="text-green-400" />
              Start Node
            </button>
            <button
              onClick={() => addNode('process')}
              className="w-full glass-button px-4 py-2 flex items-center gap-2 hover:bg-blue-500/20"
            >
              <Activity size={18} className="text-blue-400" />
              Process Node
            </button>
            <button
              onClick={() => addNode('decision')}
              className="w-full glass-button px-4 py-2 flex items-center gap-2 hover:bg-yellow-500/20"
            >
              <GitBranch size={18} className="text-yellow-400" />
              Decision Node
            </button>
            <button
              onClick={() => addNode('data')}
              className="w-full glass-button px-4 py-2 flex items-center gap-2 hover:bg-purple-500/20"
            >
              <Database size={18} className="text-purple-400" />
              Data Node
            </button>
            <button
              onClick={() => addNode('end')}
              className="w-full glass-button px-4 py-2 flex items-center gap-2 hover:bg-red-500/20"
            >
              <CheckCircle size={18} className="text-red-400" />
              End Node
            </button>
          </div>
        </div>
      )}

      {/* Flow Canvas */}
      <div className="flex-1 mx-4 mb-4 glass-card-large rounded-3xl overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(event, node) => setSelectedNode(node.id)}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#444" gap={16} />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'start': return '#10b981';
                case 'process': return '#3b82f6';
                case 'decision': return '#f59e0b';
                case 'data': return '#a855f7';
                case 'end': return '#ef4444';
                default: return '#6b7280';
              }
            }}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <Controls />
          
          {/* Instructions Panel */}
          <Panel position="top-right" className="glass-card-large p-4 rounded-2xl m-2 max-w-sm">
            <div className="text-white font-semibold mb-2 flex items-center gap-2">
              <MessageSquare size={16} />
              How to Connect Nodes
            </div>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <span className="text-purple-400">1.</span>
                <span>Hover over a node to see connection points (handles)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">2.</span>
                <span>Click and drag from a handle to another node's handle</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">3.</span>
                <span>Decision nodes have Yes (right/green) and No (left/red) outputs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">4.</span>
                <span>Click on a connection line and press Delete to remove it</span>
              </div>
            </div>
          </Panel>
          
          {/* Selected Node Panel */}
          {selectedNode && (
            <Panel position="top-left" className="glass-card-large p-4 rounded-2xl m-2">
              <div className="text-white font-semibold mb-2">Selected Node</div>
              <div className="text-sm text-white/60 mb-3">ID: {selectedNode}</div>
              <button
                onClick={deleteSelectedNode}
                className="glass-button px-3 py-1 flex items-center gap-2 text-red-400 border-red-500/30 hover:bg-red-500/20"
              >
                <Trash2 size={14} />
                Delete Node
              </button>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

// Export with provider wrapper
export default function FlowBuilderWithProvider() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
}