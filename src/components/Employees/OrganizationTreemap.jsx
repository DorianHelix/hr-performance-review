import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Users, Building2, Briefcase, UserPlus, ChevronDown, ChevronRight,
  Layers, Package, LayoutGrid, Search, Filter, Plus, Settings2,
  TrendingUp, DollarSign, BarChart3, Hash, Trash2, Edit2
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
    units: [
      { id: 'eng', name: 'Engineering', type: 'division', color: '#4F46E5' },
      { id: 'product', name: 'Product', type: 'division', color: '#7C3AED' },
      { id: 'sales', name: 'Sales', type: 'division', color: '#2563EB' },
      { id: 'ops', name: 'Operations', type: 'division', color: '#0891B2' }
    ]
  },
  enterprise: {
    name: 'Enterprise Structure',
    units: [
      { id: 'tech', name: 'Technology', type: 'division', color: '#4F46E5',
        children: [
          { id: 'platform', name: 'Platform', type: 'squad' },
          { id: 'infra', name: 'Infrastructure', type: 'squad' },
          { id: 'data', name: 'Data', type: 'squad' }
        ]
      },
      { id: 'business', name: 'Business', type: 'division', color: '#10B981',
        children: [
          { id: 'marketing', name: 'Marketing', type: 'squad' },
          { id: 'sales', name: 'Sales', type: 'squad' },
          { id: 'customer', name: 'Customer Success', type: 'squad' }
        ]
      },
      { id: 'finance', name: 'Finance & Legal', type: 'division', color: '#F59E0B' },
      { id: 'hr', name: 'Human Resources', type: 'division', color: '#EF4444' }
    ]
  },
  agile: {
    name: 'Agile Teams',
    units: [
      { id: 'tribe1', name: 'Customer Tribe', type: 'tribe', color: '#8B5CF6',
        children: [
          { id: 'squad1', name: 'Discovery Squad', type: 'squad' },
          { id: 'squad2', name: 'Purchase Squad', type: 'squad' },
          { id: 'squad3', name: 'Retention Squad', type: 'squad' }
        ]
      },
      { id: 'tribe2', name: 'Platform Tribe', type: 'tribe', color: '#3B82F6',
        children: [
          { id: 'squad4', name: 'Core Services', type: 'squad' },
          { id: 'squad5', name: 'API Squad', type: 'squad' }
        ]
      }
    ]
  }
};

// Draggable Employee Item
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

// Draggable Organizational Unit
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
      case 'division': return <Building2 size={16} />;
      case 'squad': return <Users size={16} />;
      case 'team': return <Briefcase size={16} />;
      case 'pod': return <Package size={16} />;
      case 'tribe': return <Layers size={16} />;
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

// Drop Zone for the main treemap area
function TreemapDropZone({ children, onDrop }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.EMPLOYEE, ItemTypes.ORG_UNIT],
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        onDrop(item, { id: 'root' });
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
      className={`h-full w-full relative transition-all ${
        isHighlighted ? 'ring-2 ring-blue-400 bg-blue-400/5' : ''
      }`}
    >
      {children}
    </div>
  );
}

// Main Organization Treemap Component
function OrganizationTreemap({ isDarkMode }) {
  const [employees, setEmployees] = useState(() => lsRead(LS_EMPLOYEES, []));
  const [orgStructure, setOrgStructure] = useState(() => lsRead(LS_ORG_STRUCTURE, []));
  const [showCreateUnit, setShowCreateUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
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

  // Handle drop on treemap
  const handleTreemapDrop = useCallback((item, targetNode) => {
    console.log('Dropping item:', item, 'on target:', targetNode);
    
    if (item.type === ItemTypes.ORG_UNIT) {
      // Add organizational unit to structure
      const newUnit = { 
        ...item.unit, 
        id: `${item.unit.type}-${uid()}`,
        employees: [],
        children: []
      };
      
      if (targetNode.id === 'root' || !targetNode.id) {
        // Add to root level
        setOrgStructure([...orgStructure, newUnit]);
      } else {
        // Add as child of existing unit
        const updateOrgStructure = (units) => {
          return units.map(unit => {
            if (unit.id === targetNode.id || unit.name === targetNode.id) {
              return {
                ...unit,
                children: [...(unit.children || []), newUnit]
              };
            }
            if (unit.children) {
              return {
                ...unit,
                children: updateOrgStructure(unit.children)
              };
            }
            return unit;
          });
        };
        setOrgStructure(updateOrgStructure(orgStructure));
      }
    } else if (item.type === ItemTypes.EMPLOYEE) {
      // Find the target unit ID - could be by name or ID
      let targetUnitId = null;
      const findUnitId = (units) => {
        for (const unit of units) {
          if (unit.id === targetNode.id || unit.name === targetNode.id) {
            targetUnitId = unit.id;
            return;
          }
          if (unit.children) {
            findUnitId(unit.children);
          }
        }
      };
      findUnitId(orgStructure);
      
      if (targetUnitId) {
        // Update employee's organizational assignment
        const updatedEmployees = employees.map(emp => {
          if (emp.id === item.employee.id) {
            return {
              ...emp,
              orgUnitId: targetUnitId,
              division: targetNode.data?.name || targetNode.id || emp.division
            };
          }
          return emp;
        });
        setEmployees(updatedEmployees);
        lsWrite(LS_EMPLOYEES, updatedEmployees);
      }
    }
  }, [employees, orgStructure]);

  // Convert org structure to treemap data
  const convertToTreemapData = useCallback((units = orgStructure) => {
    if (!units || units.length === 0) {
      return {
        id: 'root',
        name: 'Organization',
        value: 100,
        color: '#4F46E5',
        children: []
      };
    }

    const processUnit = (unit) => {
      const unitEmployees = employees.filter(emp => emp.orgUnitId === unit.id);
      const totalSalary = unitEmployees.reduce((sum, emp) => sum + (parseFloat(emp.totalSalary) || 0), 0);
      
      const result = {
        id: unit.name || unit.id,
        name: unit.name,
        color: unit.color || '#4F46E5',
        data: {
          ...unit,
          employees: unitEmployees,
          totalSalary,
          avgSalary: unitEmployees.length > 0 ? totalSalary / unitEmployees.length : 0
        }
      };

      // If unit has children, process them recursively
      if (unit.children && unit.children.length > 0) {
        result.children = unit.children.map(processUnit);
        // Parent nodes don't need a value if they have children
      } else {
        // Leaf nodes need a value
        result.value = Math.max(unitEmployees.length * 10, 10); // Minimum value of 10 for visibility
      }

      return result;
    };

    const processedUnits = units.map(processUnit);
    
    // If we have units, return them directly as children
    if (processedUnits.length > 0) {
      return {
        id: 'Organization',
        name: 'Organization',
        color: '#1e293b',
        children: processedUnits
      };
    }
    
    // Fallback for empty structure
    return {
      id: 'root',
      name: 'Organization',
      value: 100,
      color: '#4F46E5'
    };
  }, [orgStructure, employees]);

  // Filter employees for sidebar
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const isUnassigned = !emp.orgUnitId;
    return matchesSearch && (filterType === 'all' || (filterType === 'unassigned' && isUnassigned));
  });

  // Apply template
  const applyTemplate = (template) => {
    setOrgStructure(template.units.map(unit => ({
      ...unit,
      id: `${unit.type}-${uid()}`
    })));
  };

  // Create new organizational unit
  const createOrgUnit = (unitData) => {
    const newUnit = {
      id: `${unitData.type}-${uid()}`,
      ...unitData,
      employees: []
    };
    setOrgStructure([...orgStructure, newUnit]);
    setShowCreateUnit(false);
  };

  // Delete organizational unit
  const deleteOrgUnit = (unitToDelete) => {
    const removeUnit = (units) => {
      return units.filter(unit => {
        if (unit.id === unitToDelete.id) {
          return false;
        }
        if (unit.children) {
          unit.children = removeUnit(unit.children);
        }
        return true;
      });
    };
    setOrgStructure(removeUnit(orgStructure));
  };

  const treemapData = convertToTreemapData();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Layers size={20} />
                </div>
                Organization Structure
              </h1>
              <p className="text-white/60 mt-1">Visualize and manage your organizational hierarchy</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setOrgStructure([])}
                className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Clear Structure
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Main Treemap Area */}
          <div className="flex-1 p-6">
            <div className="h-full glass-card-large p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Organization Treemap</h2>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Hash size={16} />
                    <span>{employees.length} Total Employees</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Building2 size={16} />
                    <span>{orgStructure.length} Units</span>
                  </div>
                </div>
              </div>
              
              <TreemapDropZone onDrop={handleTreemapDrop}>
                <div className="h-[calc(100%-3rem)] relative">
                  {orgStructure.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Layers size={48} className="text-white/20 mx-auto mb-4" />
                        <p className="text-white/60 mb-2">No organizational structure defined</p>
                        <p className="text-white/40 text-sm mb-4">
                          Start by selecting a template or creating organizational units from the sidebar
                        </p>
                        <p className="text-white/30 text-xs">
                          Drag organizational units or select a template to begin
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveTreeMap
                      data={treemapData}
                      identity="name"
                      value="value"
                      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      labelSkipSize={12}
                      labelTextColor="white"
                      parentLabelTextColor="white"
                      colors={(node) => node.data?.color || '#4F46E5'}
                      borderColor="rgba(255,255,255,0.2)"
                      borderWidth={2}
                      leavesOnly={false}
                      enableParentLabel={true}
                      label={(node) => `${node.id}: ${node.value}`}
                      tooltip={({ node }) => (
                        <div className="bg-black/80 text-white p-2 rounded">
                          <strong>{node.id}</strong>
                          <br />
                          Type: {node.data?.type || 'unit'}
                          <br />
                          Employees: {node.data?.employees?.length || 0}
                          {node.data?.totalSalary && (
                            <>
                              <br />
                              Total Salary: ${(node.data.totalSalary / 1000).toFixed(0)}k
                            </>
                          )}
                        </div>
                      )}
                    />
                  )}
                </div>
              </TreemapDropZone>
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
                          {template.units.length} top-level units
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Organizational Units Section */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setExpandedSections({...expandedSections, units: !expandedSections.units})}
                    className="flex items-center gap-2 text-white font-semibold"
                  >
                    <Building2 size={18} />
                    Organizational Units
                    {expandedSections.units ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <button
                    onClick={() => setShowCreateUnit(true)}
                    className="p-1 rounded hover:bg-white/10"
                  >
                    <Plus size={16} className="text-white/60" />
                  </button>
                </div>
                
                {expandedSections.units && (
                  <div className="space-y-2">
                    {orgStructure.length === 0 ? (
                      <p className="text-sm text-white/40 text-center py-4">No units created yet</p>
                    ) : (
                      orgStructure.map(unit => (
                        <DraggableOrgUnit
                          key={unit.id}
                          unit={unit}
                          onEdit={setEditingUnit}
                          onDelete={deleteOrgUnit}
                        />
                      ))
                    )}
                  </div>
                )}
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
        {(showCreateUnit || editingUnit) && (
          <CreateUnitModal
            unit={editingUnit}
            onSave={(unitData) => {
              if (editingUnit) {
                // Update existing unit
                const updateUnit = (units) => {
                  return units.map(unit => {
                    if (unit.id === editingUnit.id) {
                      return { ...unit, ...unitData };
                    }
                    if (unit.children) {
                      return {
                        ...unit,
                        children: updateUnit(unit.children)
                      };
                    }
                    return unit;
                  });
                };
                setOrgStructure(updateUnit(orgStructure));
                setEditingUnit(null);
              } else {
                createOrgUnit(unitData);
              }
            }}
            onClose={() => {
              setShowCreateUnit(false);
              setEditingUnit(null);
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
              placeholder="e.g., Engineering"
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
              <option value="division">Division</option>
              <option value="department">Department</option>
              <option value="tribe">Tribe</option>
              <option value="squad">Squad</option>
              <option value="team">Team</option>
              <option value="pod">Pod</option>
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

export default OrganizationTreemap;