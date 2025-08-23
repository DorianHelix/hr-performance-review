import React, { useState, useEffect, useCallback } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Users, Building2, Briefcase, UserPlus, ChevronDown, ChevronRight,
  Layers, Package, LayoutGrid, Search, Filter, Plus, Settings2,
  TrendingUp, DollarSign, BarChart3, Hash, Trash2, Edit2, X,
  Minimize2, Maximize2, Network, GitBranch
} from 'lucide-react';

// Drag and Drop Types
const ItemTypes = {
  EMPLOYEE: 'employee',
  ORG_UNIT: 'orgUnit'
};

// Utility functions
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function lsRead(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function lsWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Constants
const LS_ORG_STRUCTURE = "hr_org_structure";
const LS_EMPLOYEES = "hr_weekly_employees";

// Organizational Templates
const ORG_TEMPLATES = {
  startup: {
    name: 'Startup Structure',
    structure: {
      id: 'ceo',
      name: 'CEO',
      type: 'executive',
      color: '#8B5CF6',
      children: [
        {
          id: 'cto',
          name: 'CTO',
          type: 'executive',
          color: '#4F46E5',
          children: [
            { id: 'eng-lead', name: 'Engineering Lead', type: 'management', color: '#4F46E5' },
            { id: 'product-lead', name: 'Product Lead', type: 'management', color: '#7C3AED' }
          ]
        },
        {
          id: 'coo',
          name: 'COO',
          type: 'executive',
          color: '#10B981',
          children: [
            { id: 'sales-lead', name: 'Sales Lead', type: 'management', color: '#2563EB' },
            { id: 'ops-lead', name: 'Operations Lead', type: 'management', color: '#0891B2' }
          ]
        }
      ]
    }
  },
  enterprise: {
    name: 'Enterprise Structure',
    structure: {
      id: 'ceo',
      name: 'CEO',
      type: 'executive',
      color: '#8B5CF6',
      children: [
        {
          id: 'cto',
          name: 'CTO',
          type: 'executive',
          color: '#4F46E5',
          children: [
            {
              id: 'vp-eng',
              name: 'VP Engineering',
              type: 'management',
              color: '#4F46E5',
              children: [
                { id: 'platform-dir', name: 'Platform Director', type: 'management', color: '#4F46E5' },
                { id: 'infra-dir', name: 'Infrastructure Director', type: 'management', color: '#4F46E5' },
                { id: 'data-dir', name: 'Data Director', type: 'management', color: '#4F46E5' }
              ]
            }
          ]
        },
        {
          id: 'cfo',
          name: 'CFO',
          type: 'executive',
          color: '#F59E0B',
          children: [
            { id: 'controller', name: 'Controller', type: 'management', color: '#F59E0B' },
            { id: 'treasurer', name: 'Treasurer', type: 'management', color: '#F59E0B' }
          ]
        },
        {
          id: 'cmo',
          name: 'CMO',
          type: 'executive',
          color: '#10B981',
          children: [
            { id: 'vp-marketing', name: 'VP Marketing', type: 'management', color: '#10B981' },
            { id: 'vp-sales', name: 'VP Sales', type: 'management', color: '#2563EB' }
          ]
        }
      ]
    }
  },
  flat: {
    name: 'Flat Organization',
    structure: {
      id: 'team',
      name: 'Team',
      type: 'team',
      color: '#4F46E5',
      children: [
        { id: 'product', name: 'Product Circle', type: 'team', color: '#7C3AED' },
        { id: 'engineering', name: 'Engineering Circle', type: 'team', color: '#4F46E5' },
        { id: 'design', name: 'Design Circle', type: 'team', color: '#EC4899' },
        { id: 'growth', name: 'Growth Circle', type: 'team', color: '#10B981' }
      ]
    }
  }
};

// Draggable Employee Card
function DraggableEmployee({ employee }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EMPLOYEE,
    item: { type: ItemTypes.EMPLOYEE, employee },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <div
      ref={drag}
      className={`p-3 rounded-lg border transition-all cursor-move
        ${isDragging 
          ? 'opacity-50 scale-95' 
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {employee.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{employee.name}</p>
          <p className="text-xs text-white/60 truncate">
            {employee.role || 'No role'} • {employee.division || 'Unassigned'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Draggable Organizational Unit Card
function DraggableOrgUnit({ unit, onEdit, onDelete }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ORG_UNIT,
    item: { type: ItemTypes.ORG_UNIT, unit },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const getIcon = () => {
    switch(unit.type) {
      case 'executive': return <Building2 size={16} />;
      case 'management': return <Briefcase size={16} />;
      case 'team': return <Users size={16} />;
      case 'department': return <Layers size={16} />;
      default: return <LayoutGrid size={16} />;
    }
  };

  return (
    <div
      ref={drag}
      className={`p-3 rounded-lg border transition-all cursor-move group
        ${isDragging 
          ? 'opacity-50 scale-95' 
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: unit.color || '#6B7280' }}
        >
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{unit.name}</p>
          <p className="text-xs text-white/60 capitalize">{unit.type}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(unit);
            }}
            className="p-1 rounded hover:bg-white/10"
          >
            <Edit2 size={14} className="text-white/60" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(unit);
            }}
            className="p-1 rounded hover:bg-red-500/20"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Org Chart Node Component with Drop Zone
function OrgChartNode({ node, employees, onDrop, onEdit, onDelete, onAddChild, level = 0 }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.EMPLOYEE, ItemTypes.ORG_UNIT],
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        onDrop(item, node);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  });

  const [isExpanded, setIsExpanded] = useState(true);
  const nodeEmployees = employees.filter(emp => emp.orgUnitId === node.id);
  const totalSalary = nodeEmployees.reduce((sum, emp) => sum + (parseFloat(emp.totalSalary) || 0), 0);
  
  const getIcon = () => {
    switch(node.type) {
      case 'executive': return <Building2 size={20} />;
      case 'management': return <Briefcase size={20} />;
      case 'team': return <Users size={20} />;
      case 'department': return <Layers size={20} />;
      default: return <Network size={20} />;
    }
  };

  const isHighlighted = isOver && canDrop;

  return (
    <div className="flex flex-col items-center">
      <div
        ref={drop}
        className={`relative group transition-all ${
          isHighlighted ? 'scale-105' : ''
        }`}
      >
        <div
          className={`
            min-w-[200px] max-w-[250px] p-4 rounded-xl border-2 transition-all
            ${isHighlighted 
              ? 'border-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20' 
              : 'border-white/20 bg-white/5 hover:bg-white/10'}
          `}
          style={{
            backgroundColor: isHighlighted ? undefined : (node.color ? `${node.color}20` : 'rgba(255,255,255,0.05)'),
            borderColor: isHighlighted ? undefined : (node.color || 'rgba(255,255,255,0.2)')
          }}
        >
          {/* Node Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: node.color || '#6B7280' }}
              >
                {getIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{node.name}</h3>
                <p className="text-xs text-white/60 capitalize">{node.type}</p>
              </div>
            </div>
            {node.children && node.children.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                {isExpanded ? <Minimize2 size={16} className="text-white/60" /> : <Maximize2 size={16} className="text-white/60" />}
              </button>
            )}
          </div>

          {/* Node Stats */}
          <div className="space-y-1 mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60 flex items-center gap-1">
                <Users size={12} />
                Employees
              </span>
              <span className="text-white font-medium">{nodeEmployees.length}</span>
            </div>
            {totalSalary > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1">
                  <DollarSign size={12} />
                  Total
                </span>
                <span className="text-white font-medium">${(totalSalary / 1000).toFixed(0)}k</span>
              </div>
            )}
            {node.children && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1">
                  <GitBranch size={12} />
                  Reports
                </span>
                <span className="text-white font-medium">{node.children.length}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={() => onAddChild(node)}
              className="p-1 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
              title="Add sub-unit"
            >
              <Plus size={14} className="text-white" />
            </button>
            <button
              onClick={() => onEdit(node)}
              className="p-1 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
              title="Edit"
            >
              <Edit2 size={14} className="text-white" />
            </button>
            {level > 0 && (
              <button
                onClick={() => onDelete(node)}
                className="p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                title="Delete"
              >
                <X size={14} className="text-white" />
              </button>
            )}
          </div>

          {/* Employee Avatars */}
          {nodeEmployees.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex -space-x-2">
                {nodeEmployees.slice(0, 5).map((emp, idx) => (
                  <div
                    key={emp.id}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center border-2 border-white/20"
                    title={emp.name}
                  >
                    <span className="text-[10px] font-medium text-white">
                      {emp.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                ))}
                {nodeEmployees.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/20">
                    <span className="text-[10px] font-medium text-white">+{nodeEmployees.length - 5}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Children */}
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="flex gap-4 mt-8">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              label={
                <OrgChartNode
                  node={child}
                  employees={employees}
                  onDrop={onDrop}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  level={level + 1}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Main Organization Chart Component
function OrganizationChart({ isDarkMode }) {
  const [employees, setEmployees] = useState(() => lsRead(LS_EMPLOYEES, []));
  const [orgStructure, setOrgStructure] = useState(() => lsRead(LS_ORG_STRUCTURE, null));
  const [showCreateUnit, setShowCreateUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [parentForNewUnit, setParentForNewUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    templates: true,
    units: true,
    employees: true
  });

  // Save org structure to localStorage
  useEffect(() => {
    lsWrite(LS_ORG_STRUCTURE, orgStructure);
  }, [orgStructure]);

  // Handle drop on org chart
  const handleOrgChartDrop = useCallback((item, targetNode) => {
    console.log('Dropping item:', item, 'on target:', targetNode);
    
    if (item.type === ItemTypes.ORG_UNIT) {
      // Add organizational unit as child of target node
      const newUnit = { 
        ...item.unit, 
        id: `${item.unit.type}-${uid()}`,
        children: []
      };
      
      const addUnitToNode = (node) => {
        if (node.id === targetNode.id) {
          return {
            ...node,
            children: [...(node.children || []), newUnit]
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(addUnitToNode)
          };
        }
        return node;
      };
      
      setOrgStructure(addUnitToNode(orgStructure || { id: 'root', name: 'Organization', type: 'root', children: [] }));
    } else if (item.type === ItemTypes.EMPLOYEE) {
      // Assign employee to organizational unit
      const updatedEmployees = employees.map(emp => {
        if (emp.id === item.employee.id) {
          return {
            ...emp,
            orgUnitId: targetNode.id,
            division: targetNode.name || emp.division
          };
        }
        return emp;
      });
      setEmployees(updatedEmployees);
      lsWrite(LS_EMPLOYEES, updatedEmployees);
    }
  }, [employees, orgStructure]);

  // Handle edit unit
  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setShowCreateUnit(true);
  };

  // Handle delete unit
  const handleDeleteUnit = (unitToDelete) => {
    const removeUnit = (node) => {
      if (node.children) {
        return {
          ...node,
          children: node.children.filter(child => child.id !== unitToDelete.id).map(removeUnit)
        };
      }
      return node;
    };
    setOrgStructure(removeUnit(orgStructure));
    
    // Clear employee assignments for deleted unit
    const updatedEmployees = employees.map(emp => {
      if (emp.orgUnitId === unitToDelete.id) {
        return { ...emp, orgUnitId: null, division: null };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    lsWrite(LS_EMPLOYEES, updatedEmployees);
  };

  // Handle add child unit
  const handleAddChild = (parentNode) => {
    setParentForNewUnit(parentNode);
    setShowCreateUnit(true);
  };

  // Create or update unit
  const saveUnit = (unitData) => {
    if (editingUnit) {
      // Update existing unit
      const updateUnit = (node) => {
        if (node.id === editingUnit.id) {
          return { ...node, ...unitData };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(updateUnit)
          };
        }
        return node;
      };
      setOrgStructure(updateUnit(orgStructure));
    } else if (parentForNewUnit) {
      // Add as child of specific parent
      const newUnit = {
        id: `${unitData.type}-${uid()}`,
        ...unitData,
        children: []
      };
      
      const addUnitToParent = (node) => {
        if (node.id === parentForNewUnit.id) {
          return {
            ...node,
            children: [...(node.children || []), newUnit]
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(addUnitToParent)
          };
        }
        return node;
      };
      setOrgStructure(addUnitToParent(orgStructure));
    } else {
      // Create root unit or replace structure
      const newUnit = {
        id: `${unitData.type}-${uid()}`,
        ...unitData,
        children: []
      };
      setOrgStructure(newUnit);
    }
    
    setShowCreateUnit(false);
    setEditingUnit(null);
    setParentForNewUnit(null);
  };

  // Apply template
  const applyTemplate = (template) => {
    setOrgStructure(template.structure);
  };

  // Filter employees for sidebar
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const isUnassigned = !emp.orgUnitId;
    return matchesSearch && (filterType === 'all' || (filterType === 'unassigned' && isUnassigned));
  });

  // Count total units
  const countUnits = (node) => {
    if (!node) return 0;
    let count = 1;
    if (node.children) {
      node.children.forEach(child => {
        count += countUnits(child);
      });
    }
    return count;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Network size={20} />
                </div>
                Organization Chart
              </h1>
              <p className="text-white/60 mt-1">Visualize and manage your organizational hierarchy</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setOrgStructure(null)}
                className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Clear Structure
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Main Org Chart Area */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="h-full glass-card-large p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Organization Structure</h2>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Hash size={16} />
                    <span>{employees.length} Total Employees</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Building2 size={16} />
                    <span>{countUnits(orgStructure)} Units</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[calc(100%-3rem)] overflow-auto">
                {!orgStructure ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Network size={48} className="text-white/20 mx-auto mb-4" />
                      <p className="text-white/60 mb-2">No organizational structure defined</p>
                      <p className="text-white/40 text-sm mb-4">
                        Start by selecting a template or creating organizational units
                      </p>
                      <button
                        onClick={() => setShowCreateUnit(true)}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:scale-105 transition-transform"
                      >
                        Create First Unit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Tree
                      lineWidth="2px"
                      lineColor="rgba(255,255,255,0.2)"
                      lineBorderRadius="10px"
                      label={
                        <OrgChartNode
                          node={orgStructure}
                          employees={employees}
                          onDrop={handleOrgChartDrop}
                          onEdit={handleEditUnit}
                          onDelete={handleDeleteUnit}
                          onAddChild={handleAddChild}
                          level={0}
                        />
                      }
                    >
                      {orgStructure.children && orgStructure.children.map((child) => (
                        <TreeNode
                          key={child.id}
                          label={
                            <OrgChartNode
                              node={child}
                              employees={employees}
                              onDrop={handleOrgChartDrop}
                              onEdit={handleEditUnit}
                              onDelete={handleDeleteUnit}
                              onAddChild={handleAddChild}
                              level={1}
                            />
                          }
                        />
                      ))}
                    </Tree>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-96 border-l border-white/10 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 glass-input rounded-lg"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                >
                  <option value="all">All Employees</option>
                  <option value="unassigned">Unassigned Only</option>
                </select>
              </div>

              {/* Templates Section */}
              <div className="glass-card p-4">
                <button
                  onClick={() => setExpandedSections({...expandedSections, templates: !expandedSections.templates})}
                  className="w-full flex items-center justify-between text-white mb-3"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <LayoutGrid size={18} />
                    Templates
                  </h3>
                  {expandedSections.templates ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {expandedSections.templates && (
                  <div className="space-y-2">
                    {Object.entries(ORG_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => applyTemplate(template)}
                        className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left"
                      >
                        <p className="text-sm font-medium text-white">{template.name}</p>
                        <p className="text-xs text-white/60 mt-1">
                          Click to apply this structure
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Unit Button */}
              <button
                onClick={() => setShowCreateUnit(true)}
                className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Create New Unit
              </button>

              {/* Employees Section */}
              <div className="glass-card p-4">
                <button
                  onClick={() => setExpandedSections({...expandedSections, employees: !expandedSections.employees})}
                  className="w-full flex items-center justify-between text-white mb-3"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users size={18} />
                    Employees ({filteredEmployees.length})
                  </h3>
                  {expandedSections.employees ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {expandedSections.employees && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <p className="text-sm text-white/40 text-center py-4">No employees found</p>
                    ) : (
                      filteredEmployees.map(employee => (
                        <DraggableEmployee key={employee.id} employee={employee} />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Unit Modal */}
        {showCreateUnit && (
          <CreateUnitModal
            unit={editingUnit}
            onSave={saveUnit}
            onClose={() => {
              setShowCreateUnit(false);
              setEditingUnit(null);
              setParentForNewUnit(null);
            }}
          />
        )}
      </div>
    </DndProvider>
  );
}

// Create/Edit Unit Modal
function CreateUnitModal({ unit, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: unit?.name || '',
    type: unit?.type || 'department',
    color: unit?.color || '#4F46E5'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Unit name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-large w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">
            {unit ? 'Edit' : 'Create'} Organizational Unit
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Unit Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full glass-input px-4 py-2 rounded-lg"
              placeholder="e.g., Engineering Department"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Unit Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full glass-input px-4 py-2 rounded-lg"
            >
              <option value="executive">Executive</option>
              <option value="management">Management</option>
              <option value="department">Department</option>
              <option value="team">Team</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="flex-1 glass-input px-4 py-2 rounded-lg"
                placeholder="#4F46E5"
              />
            </div>
          </div>
        </form>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:scale-105 transition-transform"
          >
            {unit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrganizationChart;