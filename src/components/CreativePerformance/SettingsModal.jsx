import React from 'react';
import { Settings, X, Sparkles, BarChart3, Zap, RefreshCw } from 'lucide-react';

// Settings Modal Component
function SettingsModal({ scoringDesign, setScoringDesign, cellSize, setCellSize, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={20} className="text-blue-400" />
                Table Settings
              </h2>
              <p className="text-sm text-white/60 mt-1">Customize table appearance and behavior</p>
            </div>
            <button onClick={onClose} className="glass-button p-2 rounded-lg hover:scale-110">
              <X size={18} className="text-white/80" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Scoring Design Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              Scoring Display Style
            </h3>
            <p className="text-sm text-white/60">Choose how scoring information is displayed in the table cells</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Minimal Design Option */}
              <div 
                className={`glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  scoringDesign === 'minimal' 
                    ? 'ring-2 ring-blue-400 bg-blue-500/10' 
                    : 'hover:bg-white/5'
                }`}
                onClick={() => setScoringDesign('minimal')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    scoringDesign === 'minimal' 
                      ? 'border-blue-400 bg-blue-400' 
                      : 'border-white/30'
                  }`}>
                    {scoringDesign === 'minimal' && (
                      <div className="w-full h-full rounded-full bg-white"></div>
                    )}
                  </div>
                  <h4 className="font-semibold text-white">Minimal</h4>
                </div>
                
                {/* Preview */}
                <div className="glass-card p-2 rounded-lg mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-bold text-purple-300 tracking-wide">VCT</span>
                      <span className="text-[10px] text-white font-bold">8</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div className="h-full bg-gradient-to-r from-green-300 to-green-400 rounded-full" style={{width: '80%'}}></div>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-white/60">Clean and simple progress bars with category labels</p>
              </div>
              
              {/* Liquid Glass Design Option */}
              <div 
                className={`glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  scoringDesign === 'liquid' 
                    ? 'ring-2 ring-purple-400 bg-purple-500/10' 
                    : 'hover:bg-white/5'
                }`}
                onClick={() => setScoringDesign('liquid')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    scoringDesign === 'liquid' 
                      ? 'border-purple-400 bg-purple-400' 
                      : 'border-white/30'
                  }`}>
                    {scoringDesign === 'liquid' && (
                      <div className="w-full h-full rounded-full bg-white"></div>
                    )}
                  </div>
                  <h4 className="font-semibold text-white">Liquid Glass</h4>
                </div>
                
                {/* Preview */}
                <div 
                  className="p-2 rounded-lg mb-3 border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.3) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/30 flex items-center justify-center">
                        <span className="text-[7px] font-bold text-purple-200">V</span>
                      </div>
                      <span className="text-[8px] font-bold text-purple-200">VCT</span>
                    </div>
                    <div className="px-1.5 py-0.5 rounded-full bg-white/15 text-green-200 font-bold text-[8px]">8</div>
                  </div>
                  <div className="w-full h-0.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-300/50 to-white/30" style={{width: '80%'}}></div>
                  </div>
                </div>
                
                <p className="text-xs text-white/60">Glass morphism cards with blur effects and glowing elements</p>
              </div>
            </div>
          </div>
          
          {/* Cell Size Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-green-400" />
              Table Cell Size
            </h3>
            <p className="text-sm text-white/60">Adjust the width of date columns in the scoring table</p>
            
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <label className="text-sm text-white/70 min-w-[60px]">Size:</label>
                <div className="flex-1">
                  <input 
                    type="range" 
                    min={80} 
                    max={150} 
                    step={10} 
                    value={cellSize}
                    onChange={e => setCellSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/80 font-mono w-12">{cellSize}px</span>
                  <button 
                    onClick={() => setCellSize(100)}
                    className="glass-button px-2 py-1 text-xs hover:scale-105"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                <span>Narrow (80px)</span>
                <div className="flex-1 h-px bg-white/10"></div>
                <span>Wide (150px)</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  setScoringDesign('minimal');
                  setCellSize(100);
                }}
                className="glass-button flex items-center gap-2 px-3 py-2 text-sm hover:scale-105"
              >
                <RefreshCw size={14} />
                Reset to Defaults
              </button>
              
              <button 
                onClick={() => setScoringDesign('liquid')}
                className="glass-button flex items-center gap-2 px-3 py-2 text-sm hover:scale-105 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
              >
                <Sparkles size={14} />
                Enable Liquid Mode
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:scale-105 transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;