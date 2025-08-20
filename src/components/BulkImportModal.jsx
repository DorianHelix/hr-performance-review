import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import AlertMessage from './AlertMessage';
import { useToast } from './Toast';

// Utility function for unique IDs
function uid() { 
  return Math.random().toString(36).slice(2, 9); 
}

function BulkImportModal({ onSave, onClose }) {
  const [importMethod, setImportMethod] = useState('paste'); // 'paste' or 'csv'
  const [importData, setImportData] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [alert, setAlert] = useState(null); // {type: 'error'|'success'|'warning', message: string}
  const fileInputRef = useRef(null);
  const { showSuccess, showError, showWarning } = useToast();

  const expectedHeaders = [
    { key: 'division', label: 'Division' },
    { key: 'squad', label: 'Squad' },
    { key: 'team', label: 'Team' },
    { key: 'role', label: 'Role' },
    { key: 'seniority', label: 'Seniority' },
    { key: 'manager', label: 'Manager' },
    { key: 'name', label: 'Employee Name' },
    { key: 'employeeId', label: 'ID' },
    { key: 'birthday', label: 'Birthday' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'exitDate', label: 'Exit Date' },
    { key: 'netSalary', label: 'Net Salary' },
    { key: 'grossSalary', label: 'Gross Salary' },
    { key: 'totalSalary', label: 'Total Salary' }
  ];

  const parseData = () => {
    if (!importData.trim()) {
      setAlert({ type: 'error', message: 'Please paste or enter some data to import' });
      return;
    }

    const lines = importData.trim().split('\n');
    if (lines.length < 1) {
      setAlert({ type: 'error', message: 'Please provide at least one row of data' });
      return;
    }
    
    // Clear any previous alerts when starting to parse
    setAlert(null);

    // Auto-detect delimiter (tab for Google Sheets, comma for CSV)
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    
    const delimiter = tabCount > commaCount ? '\t' : ',';

    // Check if first line is header or data
    const firstLineValues = firstLine.split(delimiter).map(v => v.trim());
    const hasHeader = firstLineValues.some(v => 
      v.toLowerCase().includes('name') || 
      v.toLowerCase().includes('employee') || 
      v.toLowerCase().includes('division')
    );

    // Parse the data
    const employees = [];
    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(delimiter).map(v => v.trim());
      
      // Map data based on position (matches Google Sheets column order)
      // Division | Squad | Team | Role | Seniority | Manager | Employee Name | ID | Birthday | Start Date | Exit Date | Net Salary | Gross Salary | Total Salary
      const emp = {
        id: `emp-${uid()}`,
        division: values[0] || '',
        squad: values[1] || '',
        team: values[2] || '',
        role: values[3] || '',
        seniority: values[4] || '',
        managerName: values[5] || '',
        name: values[6] || '',
        employeeId: values[7] || '',
        birthday: values[8] || '',
        startDate: values[9] || '',
        exitDate: values[10] || '',
        netSalary: values[11] || '',
        grossSalary: values[12] || '',
        totalSalary: values[13] || '',
        managerId: '' // Will be resolved later
      };
      
      // Only add if we have at least a name
      if (emp.name) {
        employees.push(emp);
      }
    }

    if (employees.length === 0) {
      setAlert({ type: 'warning', message: 'No valid employee data found. Please check your data format.' });
      return;
    }

    setPreviewData(employees);
    showSuccess(`Successfully parsed ${employees.length} employee${employees.length > 1 ? 's' : ''}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target.result);
      // Auto-parse after file load
      setTimeout(() => {
        const lines = event.target.result.trim().split('\n');
        if (lines.length >= 2) {
          parseDataFromText(event.target.result);
        }
      }, 100);
    };
    reader.readAsText(file);
  };

  const parseDataFromText = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 1) return;

    // Auto-detect delimiter
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = tabCount > commaCount ? '\t' : ',';

    // Check if first line is header or data
    const firstLineValues = firstLine.split(delimiter).map(v => v.trim());
    const hasHeader = firstLineValues.some(v => 
      v.toLowerCase().includes('name') || 
      v.toLowerCase().includes('employee') || 
      v.toLowerCase().includes('division')
    );

    // Parse the data
    const employees = [];
    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(delimiter).map(v => v.trim());
      
      // Map data based on position (matches Google Sheets column order)
      // Division | Squad | Team | Role | Seniority | Manager | Employee Name | ID | Birthday | Start Date | Exit Date | Net Salary | Gross Salary | Total Salary
      const emp = {
        id: `emp-${uid()}`,
        division: values[0] || '',
        squad: values[1] || '',
        team: values[2] || '',
        role: values[3] || '',
        seniority: values[4] || '',
        managerName: values[5] || '',
        name: values[6] || '',
        employeeId: values[7] || '',
        birthday: values[8] || '',
        startDate: values[9] || '',
        exitDate: values[10] || '',
        netSalary: values[11] || '',
        grossSalary: values[12] || '',
        totalSalary: values[13] || '',
        managerId: '' // Will be resolved later
      };
      
      if (emp.name) {
        employees.push(emp);
      }
    }

    if (employees.length === 0) {
      setAlert({ type: 'warning', message: 'No valid employee data found. Please check your data format.' });
      return;
    }

    setPreviewData(employees);
    showSuccess(`Successfully parsed ${employees.length} employee${employees.length > 1 ? 's' : ''}`);
  };

  const handleImport = () => {
    if (!previewData || previewData.length === 0) {
      setAlert({ type: 'error', message: 'No valid data to import. Please parse the data first.' });
      return;
    }

    // Show confirmation dialog
    const confirmMessage = `Are you sure you want to import ${previewData.length} employee${previewData.length > 1 ? 's' : ''}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Resolve manager relationships by name
    const employeeMap = {};
    previewData.forEach(emp => {
      employeeMap[emp.name] = emp.id;
    });

    const finalEmployees = previewData.map(emp => {
      const { managerName, ...employeeData } = emp;
      // Try to find manager by name in the imported data
      if (managerName && employeeMap[managerName]) {
        employeeData.managerId = employeeMap[managerName];
      }
      return employeeData;
    });

    onSave(finalEmployees);
    showSuccess(`Successfully imported ${finalEmployees.length} employee${finalEmployees.length > 1 ? 's' : ''}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Bulk Import Employees
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Alert Message */}
          {alert && (
            <AlertMessage 
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
              className="mb-4"
            />
          )}
          {/* Import Method Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-3">Import Method</label>
            <div className="flex gap-3">
              <button
                onClick={() => setImportMethod('paste')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  importMethod === 'paste' 
                    ? 'bg-blue-500 text-white' 
                    : 'glass-button text-white/70 hover:text-white'
                }`}
              >
                Paste from Google Sheets
              </button>
              <button
                onClick={() => setImportMethod('csv')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  importMethod === 'csv' 
                    ? 'bg-blue-500 text-white' 
                    : 'glass-button text-white/70 hover:text-white'
                }`}
              >
                Upload CSV File
              </button>
            </div>
          </div>

          {/* Expected Headers Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-3">Expected Headers</label>
            <div className="glass-card p-4 rounded-xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {expectedHeaders.map((header, idx) => (
                  <div key={idx} className="glass-input px-3 py-2 text-sm text-white/60">
                    {header.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Import Area */}
          {importMethod === 'paste' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-3">
                Paste your data from Google Sheets (Tab-separated)
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                onPaste={(e) => {
                  // Auto-parse on paste after a short delay
                  setTimeout(() => {
                    if (e.target.value && e.target.value.includes('\n')) {
                      parseDataFromText(e.target.value);
                    }
                  }, 100);
                }}
                className="w-full h-48 glass-input px-4 py-3 font-mono text-sm"
                placeholder="Copy and paste your employee data from Google Sheets here..."
              />
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-3">
                Upload CSV File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="glass-card p-8 rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 transition-colors cursor-pointer text-center"
              >
                <Upload size={32} className="text-white/50 mx-auto mb-3" />
                <p className="text-white/70">
                  {csvFile ? csvFile.name : 'Click to upload CSV file'}
                </p>
                <p className="text-xs text-white/50 mt-2">
                  Supported formats: .csv, .txt
                </p>
              </div>
            </div>
          )}

          {/* Parse Button */}
          <div className="mb-6">
            <button
              onClick={parseData}
              className="glass-button px-6 py-3 font-medium hover:scale-105 transition-transform"
              disabled={!importData.trim()}
            >
              Parse Data
            </button>
          </div>

          {/* Preview */}
          {previewData && previewData.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-3">
                Preview ({previewData.length} employees found)
              </label>
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr className="border-b border-white/10">
                        <th className="text-left p-3 text-white/70 text-sm font-medium">Name</th>
                        <th className="text-left p-3 text-white/70 text-sm font-medium">Division</th>
                        <th className="text-left p-3 text-white/70 text-sm font-medium">Role</th>
                        <th className="text-left p-3 text-white/70 text-sm font-medium">Manager</th>
                        <th className="text-left p-3 text-white/70 text-sm font-medium">Start Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 10).map((emp, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-3 text-white text-sm">{emp.name}</td>
                          <td className="p-3 text-white/70 text-sm">{emp.division || '-'}</td>
                          <td className="p-3 text-white/70 text-sm">{emp.role || '-'}</td>
                          <td className="p-3 text-white/70 text-sm">{emp.managerName || '-'}</td>
                          <td className="p-3 text-white/70 text-sm">{emp.startDate || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 10 && (
                  <div className="p-3 bg-white/5 text-center text-xs text-white/50">
                    ... and {previewData.length - 10} more employees
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white font-medium hover:scale-105 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!previewData || previewData.length === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              previewData && previewData.length > 0
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105'
                : 'glass-button opacity-50 cursor-not-allowed text-white/50'
            }`}
          >
            Import {previewData ? previewData.length : 0} Employees
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkImportModal;