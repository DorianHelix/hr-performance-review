import React, { useState, useEffect } from 'react';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { getAvailableThemes, applyTheme, getCurrentTheme } from '../../../../config/themes';

function ThemeSwitcher({ isDarkMode, onThemeToggle, isCollapsed }) {
  const [showThemes, setShowThemes] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('selectedTheme') || 'default';
    return saved;
  });
  
  const themes = getAvailableThemes();
  
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);
  
  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setShowThemes(false);
  };
  
  return (
    <div className="relative w-full">
      {/* Theme Switcher Button */}
      <button
        onClick={() => setShowThemes(!showThemes)}
        className={`glass-button p-3 rounded-2xl flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} hover:scale-105 transition-all duration-300 w-full`}
        style={{ 
          background: 'var(--color-glassBg)',
          borderColor: 'var(--color-glassBorder)',
          border: '1px solid var(--color-glassBorder)'
        }}
        title={isCollapsed ? themes.find(t => t.id === currentTheme)?.name || 'Theme' : ''}
      >
        <Palette size={20} style={{ color: 'var(--color-primary)' }} />
        {!isCollapsed && (
          <span className="text-sm font-medium" style={{ color: 'var(--color-textSecondary)' }}>
            {themes.find(t => t.id === currentTheme)?.name || 'Theme'}
          </span>
        )}
      </button>
      
      {/* Theme Dropdown */}
      {showThemes && (
        <div 
          className="absolute bottom-full mb-2 left-0 glass-card-large p-3 rounded-2xl min-w-[250px] z-50"
          style={{ 
            background: 'rgba(30, 30, 30, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="text-sm font-semibold mb-3" style={{ color: 'var(--color-textPrimary)' }}>
            Select Theme
          </div>
          
          <div className="space-y-2">
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all duration-200"
                style={{
                  background: currentTheme === theme.id ? 'var(--color-glassHover)' : 'transparent'
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Color Preview */}
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ background: theme.preview.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ background: theme.preview.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ background: theme.preview.accent }}
                    />
                  </div>
                  
                  <span className="text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                    {theme.name}
                  </span>
                </div>
                
                {currentTheme === theme.id && (
                  <Check size={16} style={{ color: 'var(--color-success)' }} />
                )}
              </button>
            ))}
          </div>
          
          {/* Divider */}
          <div className="my-3 border-t" style={{ borderColor: 'var(--color-glassBorder)' }} />
          
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={() => {
              onThemeToggle();
              setShowThemes(false);
            }}
            className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              <span className="text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            
            <div className="text-xs px-2 py-1 rounded-lg" style={{ 
              background: 'var(--color-glassHover)',
              color: 'var(--color-textSecondary)'
            }}>
              {isDarkMode ? 'ON' : 'OFF'}
            </div>
          </button>
        </div>
      )}
      
      {/* Backdrop to close dropdown */}
      {showThemes && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowThemes(false)}
        />
      )}
    </div>
  );
}

export default ThemeSwitcher;