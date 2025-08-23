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
const LS_UNIT_LIBRARY = "hr_unit_library";
const LS_HIERARCHY_RULES = "hr_hierarchy_rules";
const LS_UNIT_TYPES = "hr_unit_types";

// Default hierarchy rules - what can be placed under what
const DEFAULT_HIERARCHY_RULES = {
  'executive': ['executive', 'management', 'department', 'division', 'team'],
  'management': ['management', 'department', 'team', 'squad'],
  'department': ['team', 'squad', 'pod'],
  'division': ['executive', 'management', 'department', 'team', 'squad'],
  'team': ['pod'],
  'squad': ['pod'],
  'pod': [],
  'tribe': ['squad', 'team']
};

// Default unit types
const DEFAULT_UNIT_TYPES = [
  { value: 'executive', label: 'Executive', color: '#8B5CF6', icon: 'Building2' },
  { value: 'management', label: 'Management', color: '#F59E0B', icon: 'Briefcase' },
  { value: 'division', label: 'Division', color: '#4F46E5', icon: 'Layers' },
  { value: 'department', label: 'Department', color: '#10B981', icon: 'Building2' },
  { value: 'tribe', label: 'Tribe', color: '#EC4899', icon: 'Network' },
  { value: 'squad', label: 'Squad', color: '#EF4444', icon: 'Users' },
  { value: 'team', label: 'Team', color: '#06B6D4', icon: 'Users' },
  { value: 'pod', label: 'Pod', color: '#84CC16', icon: 'Package' }
];

// Icon mapping
const ICON_MAP = {
  'Building2': Building2,
  'Briefcase': Briefcase,
  'Layers': Layers,
  'Network': Network,
  'Users': Users,
  'Package': Package,
  'GitBranch': GitBranch,
  'Minimize2': Minimize2,
  'Maximize2': Maximize2
};

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

// Root Drop Zone for empty state
function RootDropZone({ children, onDrop }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.ORG_UNIT],
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        onDrop(item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  });

  const isHighlighted = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={`h-full w-full transition-all ${
        isHighlighted ? 'ring-2 ring-blue-400 bg-blue-400/5 rounded-lg' : ''
      }`}
    >
      {children}
    </div>
  );
}

// Org Chart Node Component with Drop Zone
function OrgChartNode({ node, employees, onDrop, onEdit, onDelete, onAddChild, level = 0, hierarchyRules }) {
  // Make the node draggable (except root node)
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ORG_UNIT,
    item: { type: ItemTypes.ORG_UNIT, unit: node, isFromChart: true },
    canDrag: level > 0, // Can't drag the root node
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.EMPLOYEE, ItemTypes.ORG_UNIT],
    canDrop: (item, monitor) => {
      if (item.type === ItemTypes.ORG_UNIT) {
        // Don't allow dropping on itself
        if (item.unit.id === node.id) return false;
        
        // Check if this would create a circular reference
        const wouldCreateCircle = (checkNode, targetId) => {
          if (checkNode.id === targetId) return true;
          if (checkNode.children) {
            return checkNode.children.some(child => wouldCreateCircle(child, targetId));
          }
          return false;
        };
        if (item.unit.children && wouldCreateCircle(item.unit, node.id)) return false;
        
        // Check hierarchy rules
        const allowedChildren = hierarchyRules[node.type] || [];
        return allowedChildren.includes(item.unit.type);
      }
      return true; // Employees can go anywhere
    },
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
  const [showEmployees, setShowEmployees] = useState(false);
  const nodeEmployees = employees.filter(emp => emp.orgUnitId === node.id);
  const totalSalary = nodeEmployees.reduce((sum, emp) => sum + (parseFloat(emp.totalSalary) || 0), 0);
  
  const getIcon = () => {
    switch(node.type) {
      case 'executive': return <Building2 size={20} />;
      case 'management': return <Briefcase size={20} />;
      case 'division': return <Layers size={20} />;
      case 'department': return <Building2 size={20} />;
      case 'tribe': return <Network size={20} />;
      case 'squad': return <Users size={20} />;
      case 'team': return <Users size={20} />;
      case 'pod': return <Package size={20} />;
      default: return <Network size={20} />;
    }
  };

  const isHighlighted = isOver && canDrop;
  
  // Combine drag and drop refs
  const dragDropRef = (el) => {
    if (level > 0) drag(el); // Only make draggable if not root
    drop(el);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={dragDropRef}
        className={`relative group transition-all ${
          isHighlighted ? 'scale-105' : ''
        } ${
          isDragging ? 'opacity-50 cursor-move' : ''
        }`}
        style={{ cursor: level > 0 ? 'move' : 'default' }}
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

          {/* Employee Avatars and List */}
          {nodeEmployees.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Team Members</span>
                <button
                  onClick={() => setShowEmployees(!showEmployees)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {showEmployees ? (
                    <><ChevronDown size={12} /> Hide</>  
                  ) : (
                    <><ChevronRight size={12} /> Show All</>  
                  )}
                </button>
              </div>
              
              {!showEmployees ? (
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
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {nodeEmployees.map(emp => (
                    <div key={emp.id} className="flex items-center gap-2 p-1 rounded bg-white/5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                        <span className="text-[8px] font-medium text-white">
                          {emp.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{emp.name}</p>
                        <p className="text-[10px] text-white/50 truncate">{emp.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render Children - No TreeNode wrapper needed here */}
    </div>
  );
}

// Main Organization Chart Component
function OrganizationChart({ isDarkMode }) {
  const [employees, setEmployees] = useState(() => lsRead(LS_EMPLOYEES, []));
  const [orgStructure, setOrgStructure] = useState(() => lsRead(LS_ORG_STRUCTURE, null));
  const [unitLibrary, setUnitLibrary] = useState(() => lsRead(LS_UNIT_LIBRARY, []));
  const [showCreateUnit, setShowCreateUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [parentForNewUnit, setParentForNewUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    templates: true,
    units: true,
    employees: true,
    configuration: false
  });
  const [allUnits, setAllUnits] = useState([]);
  const [hierarchyRules, setHierarchyRules] = useState(() => 
    lsRead(LS_HIERARCHY_RULES, DEFAULT_HIERARCHY_RULES)
  );
  const [unitTypes, setUnitTypes] = useState(() => 
    lsRead(LS_UNIT_TYPES, DEFAULT_UNIT_TYPES)
  );
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Save to localStorage
  useEffect(() => {
    lsWrite(LS_ORG_STRUCTURE, orgStructure);
  }, [orgStructure]);
  
  useEffect(() => {
    lsWrite(LS_UNIT_LIBRARY, unitLibrary);
  }, [unitLibrary]);
  
  useEffect(() => {
    lsWrite(LS_HIERARCHY_RULES, hierarchyRules);
  }, [hierarchyRules]);
  
  useEffect(() => {
    lsWrite(LS_UNIT_TYPES, unitTypes);
  }, [unitTypes]);
  
  // Extract all units from the structure for display
  useEffect(() => {
    const extractUnits = (node, units = []) => {
      if (!node) return units;
      
      units.push({
        id: node.id,
        name: node.name,
        type: node.type,
        color: node.color,
        hasChildren: node.children && node.children.length > 0
      });
      
      if (node.children) {
        node.children.forEach(child => extractUnits(child, units));
      }
      
      return units;
    };
    
    setAllUnits(extractUnits(orgStructure));
  }, [orgStructure]);

  // Handle drop on org chart
  const handleOrgChartDrop = useCallback((item, targetNode) => {
    console.log('Dropping item:', item, 'on target:', targetNode);
    
    if (item.type === ItemTypes.ORG_UNIT) {
      const isFromLibrary = unitLibrary.some(u => u.id === item.unit.id);
      const isFromChart = item.isFromChart;
      
      if (isFromLibrary) {
        // Remove from library if it's being placed in the structure
        setUnitLibrary(prev => prev.filter(u => u.id !== item.unit.id));
        
        // Create a clean new unit without duplication
        const newUnit = { 
          ...item.unit, 
          id: item.unit.id,
          children: []
        };
        
        // If no structure exists, this becomes the root
        if (!orgStructure || targetNode.id === 'root') {
          setOrgStructure(newUnit);
          return;
        }
        
        // Add as child of target node
        const addUnitToNode = (node) => {
          if (node.id === targetNode.id) {
            // Check if unit already exists as child
            const alreadyExists = node.children?.some(child => child.id === newUnit.id);
            if (alreadyExists) return node;
            
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
        
        setOrgStructure(addUnitToNode(orgStructure));
      } else if (isFromChart) {
        // Moving an existing unit within the chart
        const unitToMove = item.unit;
        
        // First, find and extract the unit with its children
        let extractedUnit = null;
        const removeUnit = (node) => {
          if (!node) return null;
          
          // Check if this node should be removed
          if (node.id === unitToMove.id) {
            extractedUnit = node; // Save the full unit with children
            return null; // Remove from tree
          }
          
          // Process children
          if (node.children) {
            const newChildren = node.children
              .map(child => removeUnit(child))
              .filter(child => child !== null);
            
            return {
              ...node,
              children: newChildren
            };
          }
          
          return node;
        };
        
        // Then add it to the new location
        const addUnit = (node) => {
          if (node.id === targetNode.id) {
            // Add the moved unit as a child of the target
            return {
              ...node,
              children: [...(node.children || []), extractedUnit || unitToMove]
            };
          }
          if (node.children) {
            return {
              ...node,
              children: node.children.map(addUnit)
            };
          }
          return node;
        };
        
        // Apply both operations
        let newStructure = removeUnit(orgStructure);
        if (newStructure) {
          newStructure = addUnit(newStructure);
          setOrgStructure(newStructure);
        }
      }
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
    // If it's the root node, clear the structure
    if (orgStructure && orgStructure.id === unitToDelete.id) {
      // Move it back to library
      setUnitLibrary(prev => [...prev, { ...unitToDelete, children: [] }]);
      setOrgStructure(null);
    } else {
      const removeUnit = (node) => {
        if (node.children) {
          return {
            ...node,
            children: node.children.filter(child => child.id !== unitToDelete.id).map(removeUnit)
          };
        }
        return node;
      };
      
      // Move deleted unit back to library (without children)
      setUnitLibrary(prev => [...prev, { ...unitToDelete, children: [] }]);
      setOrgStructure(removeUnit(orgStructure));
    }
    
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
      // Check if editing a unit in the library
      const isInLibrary = unitLibrary.some(u => u.id === editingUnit.id);
      
      if (isInLibrary) {
        // Update in library
        setUnitLibrary(prev => prev.map(u => 
          u.id === editingUnit.id ? { ...u, ...unitData } : u
        ));
      } else {
        // Update in structure
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
      }
    } else if (parentForNewUnit) {
      // Add as child of specific parent in the structure
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
      // Add to unit library (not to structure)
      const newUnit = {
        id: `${unitData.type}-${uid()}`,
        ...unitData,
        children: []
      };
      setUnitLibrary(prev => [...prev, newUnit]);
    }
    
    setShowCreateUnit(false);
    setEditingUnit(null);
    setParentForNewUnit(null);
  };

  // Apply template
  const applyTemplate = (template) => {
    // Clear the library when applying a template
    setUnitLibrary([]);
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
                onClick={() => {
                  // Clear both structure and library for fresh start
                  setOrgStructure(null);
                  setUnitLibrary([]);
                  localStorage.removeItem('hr_org_structure');
                  localStorage.removeItem('hr_unit_library');
                }}
                className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setOrgStructure(null)}
                className="px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-colors"
              >
                Clear Structure Only
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Main Org Chart Area */}
          <div className="flex-1 p-6 overflow-hidden">
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
              
              <div className="h-[calc(100%-3rem)] overflow-auto" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                {!orgStructure ? (
                  <RootDropZone onDrop={(item) => handleOrgChartDrop(item, { id: 'root' })}>
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Network size={48} className="text-white/20 mx-auto mb-4" />
                        <p className="text-white/60 mb-2">No organizational structure defined</p>
                        <p className="text-white/40 text-sm mb-4">
                          Select a template or drag a unit from the library to start
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => setShowCreateUnit(true)}
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:scale-105 transition-transform"
                          >
                            Create Unit for Library
                          </button>
                          {unitLibrary.length > 0 && (
                            <p className="text-xs text-white/40">
                              {unitLibrary.length} unit{unitLibrary.length > 1 ? 's' : ''} available in library
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </RootDropZone>
                ) : (
                  <div className="flex justify-center p-8" style={{ minWidth: 'max-content' }}>
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
                          hierarchyRules={hierarchyRules}
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
                              hierarchyRules={hierarchyRules}
                            />
                          }
                        >
                          {child.children && child.children.map((grandchild) => (
                            <TreeNode
                              key={grandchild.id}
                              label={
                                <OrgChartNode
                                  node={grandchild}
                                  employees={employees}
                                  onDrop={handleOrgChartDrop}
                                  onEdit={handleEditUnit}
                                  onDelete={handleDeleteUnit}
                                  onAddChild={handleAddChild}
                                  level={2}
                                  hierarchyRules={hierarchyRules}
                                />
                              }
                            />
                          ))}
                        </TreeNode>
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

              {/* Configuration Section */}
              <div className="glass-card p-4">
                <button
                  onClick={() => setExpandedSections({...expandedSections, configuration: !expandedSections.configuration})}
                  className="w-full flex items-center justify-between text-white mb-3"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings2 size={18} />
                    Hierarchy Configuration
                  </h3>
                  {expandedSections.configuration ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {expandedSections.configuration && (
                  <div className="space-y-3">
                    <p className="text-xs text-white/60">Configure which unit types can be placed under others</p>
                    <button
                      onClick={() => setShowConfigModal(true)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white"
                    >
                      Edit Hierarchy Rules
                    </button>
                    <button
                      onClick={() => {
                        setHierarchyRules(DEFAULT_HIERARCHY_RULES);
                        setUnitTypes(DEFAULT_UNIT_TYPES);
                        lsWrite(LS_HIERARCHY_RULES, DEFAULT_HIERARCHY_RULES);
                        lsWrite(LS_UNIT_TYPES, DEFAULT_UNIT_TYPES);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white"
                    >
                      Reset All to Defaults
                    </button>
                  </div>
                )}
              </div>

              {/* Unit Library Section */}
              <div className="glass-card p-4">
                <button
                  onClick={() => setExpandedSections({...expandedSections, units: !expandedSections.units})}
                  className="w-full flex items-center justify-between text-white mb-3"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 size={18} />
                    Unit Library ({unitLibrary.length})
                  </h3>
                  {expandedSections.units ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {expandedSections.units && (
                  <div className="space-y-2">
                    <p className="text-xs text-white/60 mb-2">
                      Drag units to the chart to build your organization
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {unitLibrary.length === 0 ? (
                        <p className="text-sm text-white/40 text-center py-4">No units in library. Create units to add them here.</p>
                      ) : (
                        unitLibrary.map(unit => (
                          <DraggableOrgUnit
                            key={unit.id}
                            unit={unit}
                            onEdit={() => {
                              setEditingUnit(unit);
                              setShowCreateUnit(true);
                            }}
                            onDelete={() => {
                              setUnitLibrary(prev => prev.filter(u => u.id !== unit.id));
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Create Buttons */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Plus size={18} />
                  Quick Create
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const newUnit = {
                        id: `division-${uid()}`,
                        name: `Division ${unitLibrary.filter(u => u.type === 'division').length + 1}`,
                        type: 'division',
                        color: '#4F46E5',
                        children: []
                      };
                      setUnitLibrary(prev => [...prev, newUnit]);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white"
                  >
                    + Division
                  </button>
                  <button
                    onClick={() => {
                      const newUnit = {
                        id: `department-${uid()}`,
                        name: `Department ${unitLibrary.filter(u => u.type === 'department').length + 1}`,
                        type: 'department',
                        color: '#10B981',
                        children: []
                      };
                      setUnitLibrary(prev => [...prev, newUnit]);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white"
                  >
                    + Department
                  </button>
                  <button
                    onClick={() => {
                      const newUnit = {
                        id: `team-${uid()}`,
                        name: `Team ${unitLibrary.filter(u => u.type === 'team').length + 1}`,
                        type: 'team',
                        color: '#8B5CF6',
                        children: []
                      };
                      setUnitLibrary(prev => [...prev, newUnit]);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white"
                  >
                    + Team
                  </button>
                  <button
                    onClick={() => {
                      const newUnit = {
                        id: `squad-${uid()}`,
                        name: `Squad ${unitLibrary.filter(u => u.type === 'squad').length + 1}`,
                        type: 'squad',
                        color: '#EC4899',
                        children: []
                      };
                      setUnitLibrary(prev => [...prev, newUnit]);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white"
                  >
                    + Squad
                  </button>
                </div>
                <button
                  onClick={() => setShowCreateUnit(true)}
                  className="w-full mt-3 glass-button py-2 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2 text-sm"
                >
                  <Settings2 size={16} />
                  Custom Unit
                </button>
              </div>

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
            unitTypes={unitTypes}
            onSave={saveUnit}
            onClose={() => {
              setShowCreateUnit(false);
              setEditingUnit(null);
              setParentForNewUnit(null);
            }}
          />
        )}
        
        {/* Hierarchy Configuration Modal */}
        {showConfigModal && (
          <HierarchyConfigModal
            rules={hierarchyRules}
            unitTypes={unitTypes}
            onSave={(newRules, newTypes) => {
              setHierarchyRules(newRules);
              if (newTypes) setUnitTypes(newTypes);
              setShowConfigModal(false);
            }}
            onClose={() => setShowConfigModal(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}

// Create/Edit Unit Modal
function CreateUnitModal({ unit, unitTypes, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: unit?.name || '',
    type: unit?.type || 'division',
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
              {unitTypes.map(unitType => (
                <option key={unitType.value} value={unitType.value}>
                  {unitType.label}
                </option>
              ))}
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

// Hierarchy Configuration Modal
function HierarchyConfigModal({ rules, unitTypes, onSave, onClose }) {
  const [localRules, setLocalRules] = useState(rules);
  const [localTypes, setLocalTypes] = useState(unitTypes);
  const [activeTab, setActiveTab] = useState('types'); // 'types' or 'rules'
  const [editingType, setEditingType] = useState(null);
  const [newType, setNewType] = useState({ value: '', label: '', color: '#4F46E5', icon: 'Building2' });

  const handleToggleRule = (parentType, childType) => {
    setLocalRules(prev => {
      const currentAllowed = prev[parentType] || [];
      const isAllowed = currentAllowed.includes(childType);
      
      return {
        ...prev,
        [parentType]: isAllowed 
          ? currentAllowed.filter(t => t !== childType)
          : [...currentAllowed, childType]
      };
    });
  };
  
  const handleAddType = () => {
    if (!newType.label) {
      alert('Please enter a type name');
      return;
    }
    
    const typeValue = newType.label.toLowerCase().replace(/\s+/g, '_');
    const exists = localTypes.some(t => t.value === typeValue);
    
    if (exists) {
      alert('This unit type already exists');
      return;
    }
    
    setLocalTypes([...localTypes, { 
      ...newType, 
      value: typeValue,
      label: newType.label 
    }]);
    setNewType({ value: '', label: '', color: '#4F46E5', icon: 'Building2' });
    
    // Add empty rules for the new type
    setLocalRules(prev => ({ ...prev, [typeValue]: [] }));
  };
  
  const handleDeleteType = (typeValue) => {
    setLocalTypes(localTypes.filter(t => t.value !== typeValue));
    
    // Remove from rules
    const newRules = { ...localRules };
    delete newRules[typeValue];
    
    // Remove from allowed children in other rules
    Object.keys(newRules).forEach(key => {
      newRules[key] = newRules[key].filter(t => t !== typeValue);
    });
    
    setLocalRules(newRules);
  };
  
  const handleUpdateType = (typeValue, updates) => {
    setLocalTypes(localTypes.map(t => 
      t.value === typeValue ? { ...t, ...updates } : t
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(localRules, localTypes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-large w-full max-w-5xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">
            Hierarchy Configuration
          </h2>
          <p className="text-sm text-white/60 mt-2">
            Manage unit types and define hierarchy rules
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('types')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'types' 
                ? 'text-white border-b-2 border-blue-500 bg-white/5' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Unit Types
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'rules' 
                ? 'text-white border-b-2 border-blue-500 bg-white/5' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Hierarchy Rules
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'types' ? (
            <div className="space-y-6">
              {/* Add New Type */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3">Add New Unit Type</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Type Name</label>
                      <input
                        type="text"
                        placeholder="e.g., CMO, Branch, Region"
                        value={newType.label}
                        onChange={(e) => setNewType({...newType, label: e.target.value})}
                        className="w-full glass-input px-3 py-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newType.color}
                          onChange={(e) => setNewType({...newType, color: e.target.value})}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newType.color}
                          onChange={(e) => setNewType({...newType, color: e.target.value})}
                          className="flex-1 glass-input px-3 py-2 rounded-lg text-xs"
                          placeholder="#4F46E5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Icon</label>
                      <select
                        value={newType.icon}
                        onChange={(e) => setNewType({...newType, icon: e.target.value})}
                        className="w-full glass-input px-3 py-2 rounded-lg"
                      >
                        <option value="Building2">Building</option>
                        <option value="Briefcase">Briefcase</option>
                        <option value="Layers">Layers</option>
                        <option value="Network">Network</option>
                        <option value="Users">Users</option>
                        <option value="Package">Package</option>
                        <option value="GitBranch">Branch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">&nbsp;</label>
                      <button
                        onClick={handleAddType}
                        className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium"
                      >
                        Add Type
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Existing Types */}
              <div className="space-y-2">
                <h3 className="font-semibold text-white mb-3">Existing Unit Types</h3>
                {localTypes.map(type => {
                  const IconComponent = ICON_MAP[type.icon] || Building2;
                  return (
                    <div key={type.value} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: type.color }}
                      >
                        <IconComponent size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{type.label}</p>
                        <p className="text-xs text-white/60">ID: {type.value}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteType(type.value)}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {localTypes.map(parentType => {
                const ParentIcon = ICON_MAP[parentType.icon] || Building2;
                return (
                  <div key={parentType.value} className="border border-white/10 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <ParentIcon size={18} />
                      {parentType.label} can contain:
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {localTypes.map(childType => {
                        const isAllowed = (localRules[parentType.value] || []).includes(childType.value);
                        return (
                          <label
                            key={childType.value}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isAllowed}
                              onChange={() => handleToggleRule(parentType.value, childType.value)}
                              className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                            />
                            <span className={`text-sm ${isAllowed ? 'text-white' : 'text-white/50'}`}>
                              {childType.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
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
            Save Rules
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrganizationChart;