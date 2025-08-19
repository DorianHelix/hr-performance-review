import React, { useState } from 'react';
import { Settings, Plus, Trash2, X } from 'lucide-react';
import { getIcon } from './utils';

// Test Types Configuration Modal Component
function TestTypesModal({ categories, setCategories, onClose }) {
  const [localCategories, setLocalCategories] = useState([...categories]);
  
  const handleUpdate = (index, field, value) => {
    const updated = [...localCategories];
    updated[index] = { ...updated[index], [field]: value };
    setLocalCategories(updated);
  };
  
  const handleSave = () => {
    // Save to parent state
    if (setCategories) {
      setCategories(localCategories);
    }
    onClose();
  };
  
  const handleAddNew = () => {
    const newTest = {
      id: `test-${Date.now()}`,
      key: 'NEW',
      label: 'New Test Type',
      short: 'NEW',
      accent: 'border-l-gray-500',
      tag: 'bg-gray-500',
      iconName: 'Star',
      description: 'New test description'
    };
    setLocalCategories([...localCategories, newTest]);
  };
  
  const handleDelete = (index) => {
    if (localCategories.length <= 1) {
      alert('You must have at least one test type');
      return;
    }
    const updated = localCategories.filter((_, i) => i !== index);
    setLocalCategories(updated);
  };
  
  const iconOptions = ['Zap', 'Lightbulb', 'MessageSquare', 'Star', 'TrendingUp', 'Users', 'Clock', 'FileText'];
  const colorOptions = [
    { label: 'Purple', tag: 'bg-purple-500', accent: 'border-l-purple-500' },
    { label: 'Blue', tag: 'bg-blue-500', accent: 'border-l-blue-500' },
    { label: 'Green', tag: 'bg-green-500', accent: 'border-l-green-500' },
    { label: 'Red', tag: 'bg-red-500', accent: 'border-l-red-500' },
    { label: 'Yellow', tag: 'bg-yellow-500', accent: 'border-l-yellow-500' },
    { label: 'Pink', tag: 'bg-pink-500', accent: 'border-l-pink-500' },
    { label: 'Orange', tag: 'bg-orange-500', accent: 'border-l-orange-500' },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-large w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Settings size={20} />
            Manage Test Types
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Configure the test types for creative product evaluation
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {localCategories.map((cat, index) => {
              const Icon = getIcon(cat.iconName);
              const colorOption = colorOptions.find(c => c.tag === cat.tag) || colorOptions[0];
              
              return (
                <div key={cat.id} className="glass-card p-4 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Test Key */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Test Key (Short)</label>
                      <input
                        type="text"
                        value={cat.key}
                        onChange={(e) => handleUpdate(index, 'key', e.target.value.toUpperCase().slice(0, 3))}
                        className="w-full glass-input px-3 py-2 text-sm"
                        placeholder="VCT"
                        maxLength={3}
                      />
                    </div>
                    
                    {/* Test Label */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Test Name</label>
                      <input
                        type="text"
                        value={cat.label}
                        onChange={(e) => handleUpdate(index, 'label', e.target.value)}
                        className="w-full glass-input px-3 py-2 text-sm"
                        placeholder="Video Creative Test"
                      />
                    </div>
                    
                    {/* Color */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Color</label>
                      <select
                        value={cat.tag}
                        onChange={(e) => {
                          const selected = colorOptions.find(c => c.tag === e.target.value);
                          handleUpdate(index, 'tag', selected.tag);
                          handleUpdate(index, 'accent', selected.accent);
                        }}
                        className="w-full glass-input px-3 py-2 text-sm"
                      >
                        {colorOptions.map(color => (
                          <option key={color.tag} value={color.tag}>
                            {color.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Icon */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Icon</label>
                      <select
                        value={cat.iconName}
                        onChange={(e) => handleUpdate(index, 'iconName', e.target.value)}
                        className="w-full glass-input px-3 py-2 text-sm"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white/70 mb-1">Description</label>
                      <input
                        type="text"
                        value={cat.description}
                        onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                        className="w-full glass-input px-3 py-2 text-sm"
                        placeholder="Test description"
                      />
                    </div>
                  </div>
                  
                  {/* Preview and Delete */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/50">Preview:</span>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${cat.tag} text-white text-xs font-bold`}>
                        <Icon size={12} />
                        <span>{cat.key}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete test type"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Add New Test Type Button */}
          <button
            onClick={handleAddNew}
            className="mt-4 w-full glass-button py-3 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            <Plus size={20} />
            Add New Test Type
          </button>
        </div>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 glass-button rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:scale-105 transition-transform"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestTypesModal;