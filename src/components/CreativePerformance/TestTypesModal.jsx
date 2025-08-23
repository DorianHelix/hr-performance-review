import React, { useState } from 'react';
import { Settings, Plus, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { 
  getTestTypes, 
  saveTestTypes,
  deleteTestType,
  getPlatformTypes,
  updateTestTypePlatforms
} from '../../utils/creativeDataModel';
import { 
  getGlobalTestTypes,
  getGlobalPlatforms,
  saveGlobalTestTypes,
  deleteGlobalTestType
} from '../../utils/globalTestConfig';
import { getIcon } from './utils';

function TestTypesModal({ onClose, onUpdate }) {
  // Use global configuration instead of local
  const [testTypes, setTestTypes] = useState(() => {
    const globalTypes = getGlobalTestTypes();
    return globalTypes.map(t => ({
      id: t.id,
      key: t.key || t.shortName,
      name: t.name,
      short: t.shortName || t.short_name,
      description: t.description,
      iconName: t.iconName || t.icon_name || 'Target',
      color: t.color || 'blue',
      allowedPlatforms: t.allowed_platforms ? 
        t.allowed_platforms.map(ap => ap.platform_id || ap) : 
        (t.allowedPlatforms || []),
      order: t.display_order || t.order || 1
    }));
  });
  
  const [platformTypes] = useState(() => {
    const globalPlatforms = getGlobalPlatforms();
    return globalPlatforms.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      iconName: p.iconName || p.icon_name,
      color: p.color || 'blue'
    }));
  });
  
  const [editingId, setEditingId] = useState(null);
  const [newTest, setNewTest] = useState({
    name: '',
    short: '',
    description: '',
    iconName: 'Zap',
    color: 'purple',
    allowedPlatforms: []
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const availableIcons = [
    'Zap', 'Lightbulb', 'MessageSquare', 'Star', 'TrendingUp', 
    'Users', 'Clock', 'FileText', 'Film', 'Image', 'Video'
  ];

  const availableColors = [
    'purple', 'blue', 'green', 'red', 'yellow', 
    'pink', 'orange', 'indigo', 'teal', 'gray'
  ];

  const handleAdd = async () => {
    if (!newTest.name || !newTest.short) return;
    
    const test = {
      id: newTest.name.toLowerCase().replace(/\s+/g, '-'),
      key: newTest.short.toUpperCase().slice(0, 3),
      name: newTest.name,
      short: newTest.short,
      shortName: newTest.short,
      short_name: newTest.short,
      description: newTest.description,
      iconName: newTest.iconName,
      icon_name: newTest.iconName,
      color: newTest.color,
      allowedPlatforms: newTest.allowedPlatforms,
      allowed_platforms: newTest.allowedPlatforms.map(p => ({ platform_id: p, is_default: true })),
      display_order: testTypes.length + 1,
      order: testTypes.length + 1
    };
    
    const updated = [...testTypes, test];
    setTestTypes(updated);
    
    // Save to global configuration
    const globalFormat = updated.map(t => ({
      id: t.id,
      name: t.name,
      short_name: t.short || t.shortName,
      shortName: t.short || t.shortName,
      description: t.description,
      color: t.color,
      icon_name: t.iconName,
      iconName: t.iconName,
      display_order: t.order || t.display_order,
      allowed_platforms: t.allowedPlatforms?.map(p => ({ platform_id: p, is_default: true })) || []
    }));
    
    await saveGlobalTestTypes(globalFormat);
    
    // Refresh the list from storage
    const refreshedTypes = getGlobalTestTypes();
    setTestTypes(refreshedTypes.map(t => ({
      id: t.id,
      key: t.key || t.shortName,
      name: t.name,
      short: t.shortName || t.short_name,
      description: t.description,
      iconName: t.iconName || t.icon_name || 'Target',
      color: t.color || 'blue',
      allowedPlatforms: t.allowed_platforms ? 
        t.allowed_platforms.map(ap => ap.platform_id || ap) : 
        (t.allowedPlatforms || []),
      order: t.display_order || t.order || 1
    })));
    
    setNewTest({
      name: '',
      short: '',
      description: '',
      iconName: 'Zap',
      color: 'purple',
      allowedPlatforms: []
    });
    
    if (onUpdate) onUpdate(updated);
  };

  const handleUpdate = (id, updates) => {
    const updated = testTypes.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    setTestTypes(updated);
    saveTestTypes(updated);
    setEditingId(null);
    
    if (onUpdate) onUpdate(updated);
  };

  const handleDelete = (id) => {
    setShowDeleteConfirm({
      id,
      warning: 'All scores for this test type will be permanently deleted.'
    });
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      // Delete from global configuration
      await deleteGlobalTestType(showDeleteConfirm.id);
      
      const updated = testTypes.filter(t => t.id !== showDeleteConfirm.id);
      setTestTypes(updated);
      setShowDeleteConfirm(null);
      
      
      if (onUpdate) onUpdate(updated);
    }
  };

  const togglePlatform = (testId, platformId) => {
    const test = testTypes.find(t => t.id === testId);
    if (!test) return;
    
    const platforms = test.allowedPlatforms || [];
    const updated = platforms.includes(platformId)
      ? platforms.filter(p => p !== platformId)
      : [...platforms, platformId];
    
    handleUpdate(testId, { allowedPlatforms: updated });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Settings size={20} />
                Manage Test Types
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Configure test types and assign platforms
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X size={20} className="text-white/60" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Add New Test Type */}
          <div className="glass-card p-4 rounded-xl mb-6">
            <h3 className="font-semibold text-white mb-4">Add New Test Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Test name"
                value={newTest.name}
                onChange={e => setNewTest({...newTest, name: e.target.value})}
                className="glass-input px-4 py-2"
              />
              <input
                type="text"
                placeholder="Short name (3 chars)"
                value={newTest.short}
                onChange={e => setNewTest({...newTest, short: e.target.value.slice(0, 3)})}
                className="glass-input px-4 py-2"
                maxLength={3}
              />
              <input
                type="text"
                placeholder="Description"
                value={newTest.description}
                onChange={e => setNewTest({...newTest, description: e.target.value})}
                className="glass-input px-4 py-2"
              />
              <select
                value={newTest.iconName}
                onChange={e => setNewTest({...newTest, iconName: e.target.value})}
                className="glass-input px-4 py-2"
              >
                {availableIcons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <select
                value={newTest.color}
                onChange={e => setNewTest({...newTest, color: e.target.value})}
                className="glass-input px-4 py-2"
              >
                {availableColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2">Allowed Platforms</label>
                <div className="flex gap-2 flex-wrap">
                  {platformTypes.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => {
                        const platforms = newTest.allowedPlatforms;
                        setNewTest({
                          ...newTest,
                          allowedPlatforms: platforms.includes(platform.id)
                            ? platforms.filter(p => p !== platform.id)
                            : [...platforms, platform.id]
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        newTest.allowedPlatforms.includes(platform.id)
                          ? `bg-${platform.color}-500 text-white`
                          : 'glass-button text-white/60'
                      }`}
                    >
                      {platform.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newTest.name || !newTest.short}
              className="mt-4 glass-button px-4 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} /> Add Test Type
            </button>
          </div>

          {/* Existing Test Types */}
          <div className="space-y-3">
            {testTypes.map(test => {
              const Icon = getIcon(test.iconName);
              const isEditing = editingId === test.id;
              
              return (
                <div key={test.id} className="glass-card p-4 rounded-xl">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={test.name}
                          onChange={e => handleUpdate(test.id, { name: e.target.value })}
                          className="glass-input px-3 py-2"
                        />
                        <input
                          type="text"
                          value={test.short}
                          onChange={e => handleUpdate(test.id, { 
                            short: e.target.value.slice(0, 3),
                            key: e.target.value.toUpperCase().slice(0, 3)
                          })}
                          className="glass-input px-3 py-2"
                          maxLength={3}
                        />
                        <input
                          type="text"
                          value={test.description}
                          onChange={e => handleUpdate(test.id, { description: e.target.value })}
                          className="glass-input px-3 py-2"
                        />
                        <select
                          value={test.iconName}
                          onChange={e => handleUpdate(test.id, { iconName: e.target.value })}
                          className="glass-input px-3 py-2"
                        >
                          {availableIcons.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                        <select
                          value={test.color}
                          onChange={e => handleUpdate(test.id, { color: e.target.value })}
                          className="glass-input px-3 py-2"
                        >
                          {availableColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-2">Allowed Platforms</label>
                        <div className="flex gap-2 flex-wrap">
                          {platformTypes.map(platform => (
                            <button
                              key={platform.id}
                              onClick={() => togglePlatform(test.id, platform.id)}
                              className={`px-3 py-1 rounded-full text-xs transition-all ${
                                test.allowedPlatforms?.includes(platform.id)
                                  ? `bg-${platform.color}-500 text-white`
                                  : 'glass-button text-white/60'
                              }`}
                            >
                              {platform.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingId(null)}
                        className="glass-button px-3 py-1 text-sm"
                      >
                        <Check size={14} className="inline mr-1" /> Save
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${test.color}-500`}>
                            <Icon size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{test.name}</div>
                            <div className="text-sm text-white/60">{test.description}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(test.id)}
                            className="p-2 hover:bg-white/10 rounded-lg"
                          >
                            <Settings size={16} className="text-white/60" />
                          </button>
                          <button
                            onClick={() => handleDelete(test.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                      {test.allowedPlatforms && test.allowedPlatforms.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {test.allowedPlatforms.map(platformId => {
                            const platform = platformTypes.find(p => p.id === platformId);
                            return platform ? (
                              <span key={platformId} className={`text-xs px-2 py-0.5 rounded-full bg-${platform.color}-500/20 text-${platform.color}-300`}>
                                {platform.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-white/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 glass-button rounded-xl"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={() => setShowDeleteConfirm(null)}>
          <div className="glass-card-large p-6 max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="text-orange-400 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-white mb-2">Confirm Deletion</h3>
                <p className="text-sm text-white/80">{showDeleteConfirm.warning}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 glass-button text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm hover:bg-red-500/30"
              >
                Delete Test Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestTypesModal;