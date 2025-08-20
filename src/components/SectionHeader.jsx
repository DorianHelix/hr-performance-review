import React from 'react';
import { 
  BarChartHorizontal,
  PanelRightClose, 
  PanelRightOpen
} from 'lucide-react';

/**
 * Reusable section header component for different views (Creative, Employees, etc.)
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.iconColorClass - Gradient color classes for icon background
 * @param {string} props.title - Main title
 * @param {string} props.subtitle - Optional subtitle
 * @param {string} props.mode - Current mode (e.g., 'analytics', 'configuration')
 * @param {Function} props.onModeChange - Callback when mode changes
 * @param {Array} props.modes - Available modes [{value: 'analytics', label: 'Analytics', color: 'pink'}, ...]
 * @param {boolean} props.showKPICards - Whether KPI cards are visible
 * @param {Function} props.onToggleKPICards - Callback to toggle KPI cards
 * @param {boolean} props.showSidebar - Whether sidebar is visible
 * @param {Function} props.onToggleSidebar - Callback to toggle sidebar
 * @param {boolean} props.hideSubtitleOnMobile - Whether to hide subtitle on mobile (default: true)
 */
function SectionHeader({ 
  icon: Icon,
  iconColorClass = 'from-purple-400/20 to-pink-600/20',
  iconBorderClass = 'border-purple-400/30',
  iconColor = 'text-purple-300',
  title,
  subtitle,
  mode,
  onModeChange,
  modes = [],
  showKPICards,
  onToggleKPICards,
  showSidebar,
  onToggleSidebar,
  hideSubtitleOnMobile = true
}) {
  return (
    <header className="glass-card-large px-4 py-3 mx-3 lg:mx-6 mb-2 lg:mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`glass-card p-1.5 rounded-xl bg-gradient-to-br ${iconColorClass} ${iconBorderClass}`}>
            <Icon size={18} className={iconColor} />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-white">
              {title}
            </h1>
            {subtitle && (
              <p className={`text-white/50 text-xs ${hideSubtitleOnMobile ? 'hidden lg:block' : ''}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* View Mode Toggle and Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          {modes.length > 0 && mode && onModeChange && (
            <div className="glass-card p-1 rounded-xl flex items-center gap-1">
              {modes.map(m => (
                <button
                  key={m.value}
                  onClick={() => onModeChange(m.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs ${
                    mode === m.value 
                      ? `bg-${m.color || 'pink'}-500 text-white` 
                      : 'text-white/60'
                  }`}
                  style={mode === m.value ? {
                    backgroundColor: m.customColor || undefined
                  } : undefined}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Toggle buttons */}
          <div className="flex items-center gap-1">
            {onToggleKPICards && (
              <button 
                onClick={onToggleKPICards}
                className="glass-card p-1.5 rounded-xl hover:bg-white/10 transition-all"
                title={showKPICards ? "Hide KPI Cards" : "Show KPI Cards"}
              >
                {showKPICards ? (
                  <BarChartHorizontal size={16} className="rotate-180" />
                ) : (
                  <BarChartHorizontal size={16} />
                )}
              </button>
            )}
            
            {onToggleSidebar && (
              <button 
                onClick={onToggleSidebar}
                className="glass-card p-1.5 rounded-xl hover:bg-white/10 transition-all"
                title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
              >
                {showSidebar ? (
                  <PanelRightClose size={16} />
                ) : (
                  <PanelRightOpen size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default SectionHeader;