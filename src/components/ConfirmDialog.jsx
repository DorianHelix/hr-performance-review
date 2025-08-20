import React, { useState, createContext, useContext } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// Confirm Dialog Context
const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

// Confirm Provider Component
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = (options) => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        }
      });
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && <ConfirmDialog {...dialog} />}
    </ConfirmContext.Provider>
  );
}

// Confirm Dialog Component
function ConfirmDialog({ 
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning', // 'warning' | 'danger'
  onConfirm,
  onCancel
}) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = (confirmed) => {
    setIsClosing(true);
    setTimeout(() => {
      if (confirmed) {
        onConfirm();
      } else {
        onCancel();
      }
    }, 200);
  };

  return (
    <div 
      className={`
        fixed inset-0 bg-black/50 backdrop-blur-sm 
        flex items-center justify-center z-[9999] p-4
        transition-opacity duration-200
        ${isClosing ? 'opacity-0' : 'opacity-100'}
      `}
      onClick={() => handleClose(false)}
    >
      <div 
        className={`
          glass-card-large w-full max-w-md
          transform transition-all duration-200
          ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-xl
                ${variant === 'danger' 
                  ? 'bg-red-500/20' 
                  : 'bg-yellow-500/20'
                }
              `}>
                <AlertTriangle 
                  size={24} 
                  className={variant === 'danger' ? 'text-red-400' : 'text-yellow-400'} 
                />
              </div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            <button
              onClick={() => handleClose(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-white/80 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex justify-end gap-3">
          <button
            onClick={() => handleClose(false)}
            className="px-6 py-3 rounded-xl glass-button font-medium hover:scale-105 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => handleClose(true)}
            className={`
              px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all
              ${variant === 'danger'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              }
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Standalone confirm function for simple use cases
 * @param {string} message - The confirmation message
 * @param {Object} options - Optional configuration
 * @returns {boolean} - Returns true if confirmed, false otherwise
 */
export function showConfirm(message, options = {}) {
  // For backwards compatibility with window.confirm
  // This can be replaced with the context version when the provider is set up
  return window.confirm(message);
}

export default ConfirmDialog;