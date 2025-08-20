import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Upload, Trash2, Settings, PlusCircle, Edit2, Network
} from 'lucide-react';
import SectionHeader from './SectionHeader';
import BulkImportModal from './BulkImportModal';
import { useConfirm } from './ConfirmDialog';
import { useToast } from './Toast';

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
const LS_EMPLOYEES = "hr_weekly_employees";

// Main Employees Component
function Employees({ isDarkMode }) {
  const [employees, setEmployees] = useState(() => {
    const data = lsRead(LS_EMPLOYEES, []);
    return Array.isArray(data) ? data : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showKPICards, setShowKPICards] = useState(true);
  const { confirm } = useConfirm();
  const { showSuccess, showError } = useToast();

  // Add new employee
  const handleAddEmployee = (employeeData) => {
    const newEmployee = {
      id: `emp-${uid()}`,
      ...employeeData,
      startDate: employeeData.startDate || new Date().toISOString().split('T')[0]
    };
    
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
    setShowAddModal(false);
  };

  // Update employee
  const handleUpdateEmployee = (id, updates) => {
    const updated = employees.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    );
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
    setEditingEmployee(null);
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    const employee = employees.find(emp => emp.id === id);
    const confirmed = await confirm({
      title: 'Delete Employee',
      message: `Are you sure you want to delete ${employee?.name || 'this employee'}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    
    if (!confirmed) return;
    
    const updated = employees.filter(emp => emp.id !== id);
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
    showSuccess('Employee deleted successfully');
  };

  // Filter employees
  const filteredEmployees = (employees || []).filter(emp => {
    if (!emp || !emp.name) return false;
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = !filterDepartment || emp.division === filterDepartment;
    return matchesSearch && matchesDivision;
  });

  // Get unique divisions
  const departments = [...new Set((employees || []).map(emp => emp?.division))].filter(Boolean);

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        icon={Users}
        iconColorClass="from-blue-400/20 to-purple-600/20"
        iconBorderClass="border-blue-400/30"
        iconColor="text-blue-300"
        title="Employee Management"
        subtitle="Manage your team members and organizational structure"
        showKPICards={showKPICards}
        onToggleKPICards={() => setShowKPICards(prev => !prev)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(prev => !prev)}
      />

      {/* KPI Cards */}
      {showKPICards && (
        <div className="flex gap-4 mx-6 mb-4 overflow-x-auto">
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex-shrink-0" style={{minWidth: '180px'}}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-400" size={20} />
              <h3 className="font-semibold text-white">Total Employees</h3>
            </div>
            <div className="text-3xl font-bold text-white">{employees.length}</div>
          </div>
          
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex-shrink-0" style={{minWidth: '180px'}}>
            <div className="flex items-center gap-3 mb-2">
              <Network className="text-purple-400" size={20} />
              <h3 className="font-semibold text-white">Departments</h3>
            </div>
            <div className="text-3xl font-bold text-white">{departments.length}</div>
          </div>
          
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex-shrink-0" style={{minWidth: '180px'}}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-green-400" size={20} />
              <h3 className="font-semibold text-white">Managers</h3>
            </div>
            <div className="text-3xl font-bold text-white">
              {employees.filter(e => employees.some(emp => emp.managerId === e.id)).length}
            </div>
          </div>
        </div>
      )}

      <div className={`grid ${showSidebar ? 'lg:grid-cols-[1fr,20rem]' : 'lg:grid-cols-1'} grid-cols-1 gap-6 flex-1 min-h-0 px-6 pb-6`}>
        {/* Main Content */}
        <div className="flex flex-col min-w-0 overflow-hidden">
          {/* Search and Filter Bar */}
            <div className="glass-card-large p-4 mb-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-2"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="glass-input px-4 py-2"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

          {/* Employee Table */}
          <div className="glass-card-large flex flex-col overflow-hidden flex-1">
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white/70 font-medium w-20">ID</th>
                      <th className="text-left p-4 text-white/70 font-medium w-40">Name</th>
                      <th className="text-left p-4 text-white/70 font-medium w-32">Division</th>
                      <th className="text-left p-4 text-white/70 font-medium w-28">Squad</th>
                      <th className="text-left p-4 text-white/70 font-medium w-28">Team</th>
                      <th className="text-left p-4 text-white/70 font-medium w-32">Role</th>
                      <th className="text-left p-4 text-white/70 font-medium w-28">Seniority</th>
                      <th className="text-left p-4 text-white/70 font-medium w-32">Manager</th>
                      <th className="text-left p-4 text-white/70 font-medium w-32">Birthday</th>
                      <th className="text-left p-4 text-white/70 font-medium w-32">Start Date</th>
                      <th className="text-left p-4 text-white/70 font-medium w-32">Exit Date</th>
                      <th className="text-right p-4 text-white/70 font-medium w-32">Net Salary</th>
                      <th className="text-right p-4 text-white/70 font-medium w-32">Gross Salary</th>
                      <th className="text-right p-4 text-white/70 font-medium w-32">Total Salary</th>
                      <th className="text-center p-4 text-white/70 font-medium w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="15" className="text-center p-8 text-white/50">
                          No employees found. Add your first employee to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map(emp => (
                        <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 w-20">
                            <div className="font-medium text-blue-300 truncate">{emp.employeeId || '-'}</div>
                          </td>
                          <td className="p-4 w-40">
                            <div className="font-medium text-white truncate" title={emp.name}>{emp.name}</div>
                          </td>
                          <td className="p-4 text-white/70 w-32 truncate" title={emp.division || '-'}>{emp.division || '-'}</td>
                          <td className="p-4 text-white/70 w-28 truncate" title={emp.squad || '-'}>{emp.squad || '-'}</td>
                          <td className="p-4 text-white/70 w-28 truncate" title={emp.team || '-'}>{emp.team || '-'}</td>
                          <td className="p-4 text-white/70 w-32 truncate" title={emp.role || '-'}>{emp.role || '-'}</td>
                          <td className="p-4 text-white/70 w-28 truncate" title={emp.seniority || '-'}>{emp.seniority || '-'}</td>
                          <td className="p-4 text-white/70 w-32">
                            <div className="truncate" title={emp.managerId ? employees.find(m => m.id === emp.managerId)?.name || 'Unknown' : '-'}>
                              {emp.managerId ? employees.find(m => m.id === emp.managerId)?.name || 'Unknown' : '-'}
                            </div>
                          </td>
                          <td className="p-4 text-white/70 w-32">
                            {emp.birthday ? new Date(emp.birthday).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4 text-white/70 w-32">
                            {emp.startDate ? new Date(emp.startDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4 text-white/70 w-32">
                            {emp.exitDate ? new Date(emp.exitDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4 text-white/70 text-right w-32">
                            <div className="truncate" title={emp.netSalary ? new Intl.NumberFormat().format(emp.netSalary) : '-'}>
                              {emp.netSalary ? new Intl.NumberFormat().format(emp.netSalary) : '-'}
                            </div>
                          </td>
                          <td className="p-4 text-white/70 text-right w-32">
                            <div className="truncate" title={emp.grossSalary ? new Intl.NumberFormat().format(emp.grossSalary) : '-'}>
                              {emp.grossSalary ? new Intl.NumberFormat().format(emp.grossSalary) : '-'}
                            </div>
                          </td>
                          <td className="p-4 text-white/70 text-right w-32">
                            <div className="truncate" title={emp.totalSalary ? new Intl.NumberFormat().format(emp.totalSalary) : '-'}>
                              {emp.totalSalary ? new Intl.NumberFormat().format(emp.totalSalary) : '-'}
                            </div>
                          </td>
                          <td className="p-4 w-28">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditingEmployee(emp)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Edit"
                              >
                                <Settings size={16} className="text-white/70" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} className="text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
          </div>
        </div>

        {/* Right Sidebar - Add Employee Widget */}
        {showSidebar && (
          <div className="space-y-6 overflow-y-auto">
            <div className="glass-card-large p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PlusCircle size={20} className="text-blue-400" />
                Add New Employee
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Employee
                </button>
                
                <button
                  onClick={() => setShowBulkImportModal(true)}
                  className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  Bulk Import
                </button>
                
                {employees.length > 0 && (
                  <button
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Delete All Employees',
                        message: `Are you sure you want to delete ALL ${employees.length} employees? This action cannot be undone.`,
                        confirmText: 'Delete All',
                        cancelText: 'Cancel',
                        variant: 'danger'
                      });
                      
                      if (confirmed) {
                        setEmployees([]);
                        lsWrite(LS_EMPLOYEES, []);
                        showSuccess('All employees deleted successfully');
                      }
                    }}
                    className="w-full py-3 font-medium transition-all flex items-center justify-center gap-2 rounded-2xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white hover:scale-105"
                  >
                    <Trash2 size={20} />
                    Delete All Employees
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-medium text-white/70 mb-2">Quick Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">Total Employees</span>
                      <span className="text-sm font-medium text-white">{employees.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">Departments</span>
                      <span className="text-sm font-medium text-white">{departments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">Managers</span>
                      <span className="text-sm font-medium text-white">
                        {employees.filter(e => employees.some(emp => emp.managerId === e.id)).length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20">
                  <h4 className="text-sm font-medium text-white mb-2">Recent Activity</h4>
                  <p className="text-xs text-white/60">
                    {employees.length > 0 
                      ? `Last employee added: ${employees[employees.length - 1].name}`
                      : 'No employees added yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(showAddModal || editingEmployee) && (
        <AddEmployeeModal
          employee={editingEmployee}
          employees={employees}
          onSave={(data) => {
            if (editingEmployee) {
              handleUpdateEmployee(editingEmployee.id, data);
            } else {
              handleAddEmployee(data);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingEmployee(null);
          }}
        />
      )}

      {showBulkImportModal && (
        <BulkImportModal
          onSave={(importedEmployees) => {
            const updated = [...employees, ...importedEmployees];
            setEmployees(updated);
            lsWrite(LS_EMPLOYEES, updated);
            setShowBulkImportModal(false);
          }}
          onClose={() => setShowBulkImportModal(false)}
        />
      )}
    </div>
  );
}

// Modal Components
function AddEmployeeModal({ employee, employees, onSave, onClose }) {
  const [formData, setFormData] = useState({
    employeeId: employee?.employeeId || '',
    name: employee?.name || '',
    division: employee?.division || '',
    squad: employee?.squad || '',
    team: employee?.team || '',
    role: employee?.role || '',
    seniority: employee?.seniority || '',
    managerId: employee?.managerId || '',
    birthday: employee?.birthday || '',
    startDate: employee?.startDate || '',
    exitDate: employee?.exitDate || '',
    netSalary: employee?.netSalary || '',
    grossSalary: employee?.grossSalary || '',
    totalSalary: employee?.totalSalary || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Employee name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Users size={24} />
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="EMP001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full glass-input px-4 py-2"
                required
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Division</label>
              <input
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({...formData, division: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Engineering"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Squad</label>
              <input
                type="text"
                value={formData.squad}
                onChange={(e) => setFormData({...formData, squad: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Platform"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Team</label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({...formData, team: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Backend"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Software Engineer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Seniority</label>
              <select
                value={formData.seniority}
                onChange={(e) => setFormData({...formData, seniority: e.target.value})}
                className="w-full glass-input px-4 py-2"
              >
                <option value="">Select Seniority</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Principal">Principal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Manager</label>
            <select
              value={formData.managerId}
              onChange={(e) => setFormData({...formData, managerId: e.target.value})}
              className="w-full glass-input px-4 py-2"
            >
              <option value="">No Manager</option>
              {employees.filter(emp => emp.id !== employee?.id).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Birthday</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Exit Date</label>
              <input
                type="date"
                value={formData.exitDate}
                onChange={(e) => setFormData({...formData, exitDate: e.target.value})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Net Salary</label>
              <input
                type="number"
                value={formData.netSalary}
                onChange={(e) => setFormData({...formData, netSalary: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="50000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Gross Salary</label>
              <input
                type="number"
                value={formData.grossSalary}
                onChange={(e) => setFormData({...formData, grossSalary: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="65000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Total Salary</label>
              <input
                type="number"
                value={formData.totalSalary}
                onChange={(e) => setFormData({...formData, totalSalary: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="75000"
              />
            </div>
          </div>
        </form>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white font-medium hover:scale-105 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:scale-105 transition-transform"
          >
            {employee ? 'Update' : 'Add'} Employee
          </button>
        </div>
      </div>
    </div>
  );
}


export default Employees;