import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Reusable inline alert message component
 * @param {Object} props
 * @param {string} props.type - 'error' | 'success' | 'warning' | 'info'
 * @param {string} props.message - The message to display
 * @param {Function} props.onClose - Optional close handler
 * @param {string} props.className - Additional CSS classes
 */
function AlertMessage({ type = 'info', message, onClose, className = '' }) {
  const configs = {
    error: {
      icon: AlertCircle,
      bgClass: 'bg-red-500/20 border-red-500/30',
      iconClass: 'text-red-400',
      textClass: 'text-red-300'
    },
    success: {
      icon: CheckCircle,
      bgClass: 'bg-green-500/20 border-green-500/30',
      iconClass: 'text-green-400',
      textClass: 'text-green-300'
    },
    warning: {
      icon: AlertTriangle,
      bgClass: 'bg-yellow-500/20 border-yellow-500/30',
      iconClass: 'text-yellow-400',
      textClass: 'text-yellow-300'
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-500/20 border-blue-500/30',
      iconClass: 'text-blue-400',
      textClass: 'text-blue-300'
    }
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div 
      className={`
        p-4 rounded-xl border flex items-center gap-3
        ${config.bgClass}
        ${className}
      `}
    >
      <Icon className={config.iconClass} size={20} />
      <span className={`flex-1 ${config.textClass}`}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={16} className="text-white/60" />
        </button>
      )}
    </div>
  );
}

export default AlertMessage;