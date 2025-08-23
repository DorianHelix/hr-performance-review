import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
import { 
  getPlatformTypes, 
  savePlatformTypes, 
  deletePlatformType,
  getTestTypes
} from '../../utils/creativeDataModel';
import {
  getGlobalPlatforms,
  getGlobalTestTypes,
  saveGlobalPlatforms,
  deleteGlobalPlatform
} from '../../utils/globalTestConfig';
import { getIcon } from './utils';

function PlatformTypesModal({ onClose }) {
  // Use global configuration
  const [platformTypes, setPlatformTypes] = useState(() => {
    const globalPlatforms = getGlobalPlatforms();
    return globalPlatforms.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      iconName: p.iconName || p.icon_name || 'Globe',
      color: p.color || 'blue',
      order: p.display_order || p.order || 1
    }));
  });
  
  const [testTypes, setTestTypes] = useState(() => {
    const globalTypes = getGlobalTestTypes();
    return globalTypes.map(t => ({
      ...t,
      allowedPlatforms: t.allowed_platforms ? 
        t.allowed_platforms.map(ap => ap.platform_id || ap) : 
        (t.allowedPlatforms || [])
    }));
  });
  
  // Refresh data when component mounts or window gets focus
  useEffect(() => {
    const refreshData = () => {
      const globalPlatforms = getGlobalPlatforms();
      setPlatformTypes(globalPlatforms.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        iconName: p.iconName || p.icon_name || 'Globe',
        color: p.color || 'blue',
        order: p.display_order || p.order || 1
      })));
      
      const globalTypes = getGlobalTestTypes();
      setTestTypes(globalTypes.map(t => ({
        ...t,
        allowedPlatforms: t.allowed_platforms ? 
          t.allowed_platforms.map(ap => ap.platform_id || ap) : 
          (t.allowedPlatforms || [])
      })));
    };
    
    // Refresh on mount
    refreshData();
    
    // Refresh when window gets focus
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  const [editingId, setEditingId] = useState(null);
  const [newPlatform, setNewPlatform] = useState({
    name: '',
    description: '',
    iconName: 'Globe',
    color: 'gray'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const availableIcons = [
    'Globe', 'Facebook', 'Music', 'Youtube', 'Instagram', 
    'Twitter', 'Linkedin', 'Chrome', 'Smartphone', 'Monitor'
  ];

  const availableColors = [
    'blue', 'pink', 'red', 'green', 'purple', 
    'orange', 'yellow', 'gray', 'indigo', 'teal'
  ];

  const handleAdd = async () => {
    if (!newPlatform.name) return;
    
    const platform = {
      id: newPlatform.name.toLowerCase().replace(/\s+/g, '-'),
      name: newPlatform.name,
      description: newPlatform.description || `${newPlatform.name} Ads`,
      iconName: newPlatform.iconName,
      icon_name: newPlatform.iconName,
      color: newPlatform.color,
      display_order: platformTypes.length + 1,
      order: platformTypes.length + 1
    };
    
    const updated = [...platformTypes, platform];
    setPlatformTypes(updated);
    
    // Save to global configuration
    const globalFormat = updated.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      icon_name: p.iconName || p.icon_name,
      iconName: p.iconName || p.icon_name,
      color: p.color,
      display_order: p.order || p.display_order || 1
    }));
    
    await saveGlobalPlatforms(globalFormat);
    
    // Refresh the list from storage
    const refreshedPlatforms = getGlobalPlatforms();
    setPlatformTypes(refreshedPlatforms.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      iconName: p.iconName || p.icon_name || 'Globe',
      color: p.color || 'blue',
      order: p.display_order || p.order || 1
    })));
    
    setNewPlatform({
      name: '',
      description: '',
      iconName: 'Globe',
      color: 'gray'
    });
  };

  const handleUpdate = async (id, updates) => {
    const updated = platformTypes.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    setPlatformTypes(updated);
    
    // Save to global configuration
    const globalFormat = updated.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      icon_name: p.iconName || p.icon_name,
      iconName: p.iconName || p.icon_name,
      color: p.color,
      display_order: p.order || p.display_order || 1
    }));
    
    await saveGlobalPlatforms(globalFormat);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    // Check if any test types use this platform
    const usedByTests = testTypes.filter(t => 
      t.allowedPlatforms && t.allowedPlatforms.includes(id)
    );
    
    if (usedByTests.length > 0) {
      setShowDeleteConfirm({
        id,
        warning: `This platform is used by ${usedByTests.length} test type(s). All associated scores will be deleted.`,
        usedBy: usedByTests.map(t => t.name)
      });
    } else {
      deletePlatformType(id);
      setPlatformTypes(platformTypes.filter(p => p.id !== id));
    }
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      // Delete from global configuration
      await deleteGlobalPlatform(showDeleteConfirm.id);
      
      // Update local state
      const updated = platformTypes.filter(p => p.id !== showDeleteConfirm.id);
      setPlatformTypes(updated);
      setShowDeleteConfirm(null);
      
      // Refresh the list from storage
      const refreshedPlatforms = getGlobalPlatforms();
      setPlatformTypes(refreshedPlatforms.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        iconName: p.iconName || p.icon_name || 'Globe',
        color: p.color || 'blue',
        order: p.display_order || p.order || 1
      })));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Manage Platform Types</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X size={20} className="text-white/60" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Add New Platform */}
          <div className="glass-card p-4 rounded-xl mb-6">
            <h3 className="font-semibold text-white mb-4">Add New Platform</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Platform name"
                value={newPlatform.name}
                onChange={e => setNewPlatform({...newPlatform, name: e.target.value})}
                className="glass-input px-4 py-2"
              />
              <input
                type="text"
                placeholder="Description"
                value={newPlatform.description}
                onChange={e => setNewPlatform({...newPlatform, description: e.target.value})}
                className="glass-input px-4 py-2"
              />
              <select
                value={newPlatform.iconName}
                onChange={e => setNewPlatform({...newPlatform, iconName: e.target.value})}
                className="glass-input px-4 py-2"
              >
                {availableIcons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <select
                value={newPlatform.color}
                onChange={e => setNewPlatform({...newPlatform, color: e.target.value})}
                className="glass-input px-4 py-2"
              >
                {availableColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newPlatform.name}
              className="mt-4 glass-button px-4 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} /> Add Platform
            </button>
          </div>

          {/* Existing Platforms */}
          <div className="space-y-3">
            {platformTypes.map(platform => {
              const Icon = getIcon(platform.iconName);
              const isEditing = editingId === platform.id;
              
              return (
                <div key={platform.id} className="glass-card p-4 rounded-xl">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={platform.name}
                        onChange={e => handleUpdate(platform.id, { name: e.target.value })}
                        className="glass-input px-3 py-2 w-full"
                      />
                      <input
                        type="text"
                        value={platform.description}
                        onChange={e => handleUpdate(platform.id, { description: e.target.value })}
                        className="glass-input px-3 py-2 w-full"
                      />
                      <div className="flex gap-2">
                        <select
                          value={platform.iconName}
                          onChange={e => handleUpdate(platform.id, { iconName: e.target.value })}
                          className="glass-input px-3 py-2 flex-1"
                        >
                          {availableIcons.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                        <select
                          value={platform.color}
                          onChange={e => handleUpdate(platform.id, { color: e.target.value })}
                          className="glass-input px-3 py-2 flex-1"
                        >
                          {availableColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => setEditingId(null)}
                        className="glass-button px-3 py-1 text-sm"
                      >
                        <Check size={14} className="inline mr-1" /> Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${platform.color}-500`}>
                          <Icon size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{platform.name}</div>
                          <div className="text-sm text-white/60">{platform.description}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(platform.id)}
                          className="p-2 hover:bg-white/10 rounded-lg"
                        >
                          <Edit2 size={16} className="text-white/60" />
                        </button>
                        <button
                          onClick={() => handleDelete(platform.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
                {showDeleteConfirm.usedBy && (
                  <div className="mt-2">
                    <p className="text-xs text-white/60">Used by:</p>
                    <ul className="text-xs text-white/80 mt-1">
                      {showDeleteConfirm.usedBy.map(name => (
                        <li key={name}>• {name}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
                Delete Platform
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlatformTypesModal;