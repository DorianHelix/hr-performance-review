import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  GitBranch, Plus, Save, Download, Upload, Trash2,
  User, CheckCircle, AlertCircle, AlertTriangle, Mail, Database,
  Settings, Zap, Clock, FileText, Calendar, Target,
  Activity, Hash, MessageSquare, Filter, Users, Layers
} from 'lucide-react';
import { useToast } from '../../common/ui/Toast';
import emailService from '../../../services/emailService';

// Custom node types with executable actions
const StartNode = ({ data, selected }) => {
  return (
    <div className={`glass-card p-4 rounded-2xl min-w-[180px] border-2 relative ${
      selected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 
      data.executing ? 'border-green-400 shadow-lg shadow-green-400/50 animate-pulse' : 
      'border-green-500/50'
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
          {data.executing && (
            <div className="text-xs text-green-400 mt-1">Running...</div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProcessNode = ({ data, selected }) => {
  return (
    <div className={`glass-card p-4 rounded-2xl min-w-[180px] border-2 relative ${
      selected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 
      data.executing ? 'border-blue-400 shadow-lg shadow-blue-400/50 animate-pulse' :
      data.executed ? 'border-green-500/50' :
      'border-blue-500/50'
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
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [flowName, setFlowName] = useState('Untitled Flow');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

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
    setExecutionLog([]);
    showInfo('Flow cleared');
  };

  // Execute flow
  const executeFlow = async () => {
    if (nodes.length === 0) {
      showError('No nodes to execute');
      return;
    }

    setIsExecuting(true);
    setExecutionLog([]);
    
    // Find start node
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) {
      showError('No start node found');
      setIsExecuting(false);
      return;
    }

    showInfo('Starting flow execution...');
    
    try {
      // Mark start node as executing
      await executeNode(startNode.id);
      
      // Continue execution following edges
      await executeNextNodes(startNode.id);
      
      showSuccess('Flow execution completed!');
    } catch (error) {
      showError(`Flow execution failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
      // Clear execution states
      setNodes(nodes => nodes.map(n => ({ ...n, data: { ...n.data, executing: false } })));
    }
  };

  // Execute a single node
  const executeNode = async (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Mark node as executing
    setNodes(nodes => nodes.map(n => 
      n.id === nodeId ? { ...n, data: { ...n.data, executing: true } } : n
    ));

    // Add to execution log
    const logEntry = {
      nodeId,
      type: node.type,
      label: node.data.label,
      timestamp: new Date().toISOString(),
      status: 'executing'
    };
    setExecutionLog(log => [...log, logEntry]);

    // Simulate execution based on node type
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

    // Execute action based on node type and data
    let result = null;
    switch (node.type) {
      case 'data':
        if (node.data.action === 'fetch_products') {
          // Get products from localStorage
          const products = JSON.parse(localStorage.getItem('hr_products_imported') || localStorage.getItem('hr_products') || '[]');
          result = { products, lowStockCount: products.filter(p => (p.stock || 0) < 10 && (p.stock || 0) > 0).length };
          node.data.result = result;
        }
        break;
      
      case 'process':
        if (node.data.action === 'send_email') {
          // Send email alert
          const products = JSON.parse(localStorage.getItem('hr_products_imported') || localStorage.getItem('hr_products') || '[]');
          const emailResult = await emailService.sendLowStockAlert(products, node.data.recipient || 'manager@company.com');
          result = emailResult;
          if (emailResult.success) {
            showSuccess('Email alert sent!');
          }
        } else if (node.data.action === 'log_message') {
          console.log('Flow Log:', node.data.message || 'Process executed');
          showInfo(node.data.message || 'Process executed');
        }
        break;
      
      case 'decision':
        // Check condition
        if (node.data.condition === 'has_low_stock') {
          const products = JSON.parse(localStorage.getItem('hr_products_imported') || localStorage.getItem('hr_products') || '[]');
          const lowStockCount = products.filter(p => (p.stock || p.totalStock || 0) < 10).length;
          result = lowStockCount > 0;
          node.data.result = result;
        }
        break;
    }

    // Mark node as executed
    setNodes(nodes => nodes.map(n => 
      n.id === nodeId ? { ...n, data: { ...n.data, executing: false, executed: true, result } } : n
    ));

    // Update log
    setExecutionLog(log => log.map(l => 
      l.nodeId === nodeId ? { ...l, status: 'completed', result } : l
    ));

    return result;
  };

  // Execute next nodes following edges
  const executeNextNodes = async (currentNodeId) => {
    const currentNode = nodes.find(n => n.id === currentNodeId);
    const outgoingEdges = edges.filter(e => e.source === currentNodeId);
    
    if (outgoingEdges.length === 0) return;

    // For decision nodes, choose path based on result
    if (currentNode?.type === 'decision') {
      const result = currentNode.data.result;
      const edge = result 
        ? outgoingEdges.find(e => e.sourceHandle === 'right' || e.label === 'Yes')
        : outgoingEdges.find(e => e.sourceHandle === 'left' || e.label === 'No');
      
      if (edge) {
        await executeNode(edge.target);
        await executeNextNodes(edge.target);
      }
    } else {
      // Execute all next nodes
      for (const edge of outgoingEdges) {
        await executeNode(edge.target);
        await executeNextNodes(edge.target);
      }
    }
  };

  // Load template flow
  const loadTemplate = (templateName) => {
    if (templateName === 'low_stock_alert') {
      const templateNodes = [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 250, y: 50 },
          data: { label: 'Daily Check' }
        },
        {
          id: 'data-1',
          type: 'data',
          position: { x: 250, y: 150 },
          data: { 
            label: 'Fetch Products',
            source: 'Products Database',
            action: 'fetch_products'
          }
        },
        {
          id: 'decision-1',
          type: 'decision',
          position: { x: 250, y: 250 },
          data: { 
            label: 'Check Stock',
            condition: 'has_low_stock',
            description: 'Any products < 10?'
          }
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 450, y: 350 },
          data: { 
            label: 'Send Alert',
            description: 'Email to manager',
            action: 'send_email',
            recipient: 'manager@company.com'
          }
        },
        {
          id: 'process-2',
          type: 'process',
          position: { x: 50, y: 350 },
          data: { 
            label: 'Log Status',
            description: 'All stock OK',
            action: 'log_message',
            message: 'Stock levels are healthy'
          }
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 250, y: 450 },
          data: { label: 'Check Complete' }
        }
      ];

      const templateEdges = [
        {
          id: 'e-start-data',
          source: 'start-1',
          target: 'data-1',
          animated: true,
          style: { stroke: '#60a5fa', strokeWidth: 2 }
        },
        {
          id: 'e-data-decision',
          source: 'data-1',
          target: 'decision-1',
          animated: true,
          style: { stroke: '#60a5fa', strokeWidth: 2 }
        },
        {
          id: 'e-decision-yes',
          source: 'decision-1',
          sourceHandle: 'right',
          target: 'process-1',
          label: 'Yes',
          animated: true,
          style: { stroke: '#34d399', strokeWidth: 2 },
          labelStyle: { fill: '#34d399', fontWeight: 700 }
        },
        {
          id: 'e-decision-no',
          source: 'decision-1',
          sourceHandle: 'left',
          target: 'process-2',
          label: 'No',
          animated: true,
          style: { stroke: '#f87171', strokeWidth: 2 },
          labelStyle: { fill: '#f87171', fontWeight: 700 }
        },
        {
          id: 'e-process1-end',
          source: 'process-1',
          target: 'end-1',
          animated: true,
          style: { stroke: '#60a5fa', strokeWidth: 2 }
        },
        {
          id: 'e-process2-end',
          source: 'process-2',
          target: 'end-1',
          animated: true,
          style: { stroke: '#60a5fa', strokeWidth: 2 }
        }
      ];

      setNodes(templateNodes);
      setEdges(templateEdges);
      setFlowName('Low Stock Alert Automation');
      setShowTemplates(false);
      showSuccess('Low Stock Alert template loaded!');
    }
  };

  return (
    <div className="h-full flex flex-col">
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
              onClick={executeFlow}
              disabled={isExecuting || nodes.length === 0}
              className={`glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform ${
                isExecuting ? 'animate-pulse bg-green-500/20 border-green-500/30' : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
              }`}
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Run Flow
                </>
              )}
            </button>
            <button
              onClick={() => loadTemplate('low_stock_alert')}
              className="glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform bg-orange-500/20 border-orange-500/30"
              title="Load Low Stock Alert automation flow"
            >
              <AlertTriangle size={18} />
              Low Stock Alert
            </button>
            <button
              onClick={() => {
                console.log('Templates clicked, current state:', showTemplates);
                setShowTemplates(!showTemplates);
                setShowNodeMenu(false); // Close other dropdowns
              }}
              className="glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform bg-purple-500/20 border-purple-500/30"
            >
              <Layers size={18} />
              More Templates
            </button>
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

      {/* Templates Dropdown */}
      {showTemplates && (
        <div className="absolute top-24 left-80 z-50 glass-card-large p-4 rounded-2xl" style={{ minWidth: '280px' }}>
          <div className="text-white font-semibold mb-3">Flow Templates</div>
          <div className="space-y-2">
            <button
              onClick={() => loadTemplate('low_stock_alert')}
              className="w-full glass-button px-4 py-3 flex flex-col items-start gap-1 hover:bg-orange-500/20 text-left"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-400" />
                <span className="font-medium">Low Stock Alert</span>
              </div>
              <span className="text-xs text-white/60">
                Check products and send email if stock is low
              </span>
            </button>
            <button
              className="w-full glass-button px-4 py-3 flex flex-col items-start gap-1 hover:bg-blue-500/20 text-left opacity-50 cursor-not-allowed"
              disabled
            >
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <span className="font-medium">Performance Review</span>
              </div>
              <span className="text-xs text-white/60">
                Coming soon...
              </span>
            </button>
            <button
              className="w-full glass-button px-4 py-3 flex flex-col items-start gap-1 hover:bg-green-500/20 text-left opacity-50 cursor-not-allowed"
              disabled
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-green-400" />
                <span className="font-medium">Weekly Report</span>
              </div>
              <span className="text-xs text-white/60">
                Coming soon...
              </span>
            </button>
          </div>
        </div>
      )}

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
          
          {/* Execution Log Panel */}
          {executionLog.length > 0 && (
            <Panel position="bottom-right" className="glass-card-large p-4 rounded-2xl m-2 max-w-md">
              <div className="text-white font-semibold mb-2 flex items-center gap-2">
                <Activity size={16} />
                Execution Log
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {executionLog.map((log, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center gap-2">
                      {log.status === 'executing' ? (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                      )}
                      <span className="text-white/80">{log.label}</span>
                      <span className="text-white/40 ml-auto">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.result && (
                      <div className="ml-4 text-white/60 mt-1">
                        {typeof log.result === 'boolean' 
                          ? (log.result ? '✓ Condition met' : '✗ Condition not met')
                          : log.result.success ? '✓ Success' : '✗ Failed'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          )}
          
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