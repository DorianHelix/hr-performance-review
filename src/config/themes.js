// Theme Configuration System
// Each theme contains color variables for consistent styling across the app

const themes = {
  // Light theme (clean and professional)
  light: {
    name: 'Light',
    colors: {
      // Primary colors
      primary: '#6d28d9',
      primaryLight: '#7c3aed',
      primaryDark: '#581c87',
      
      // Secondary colors
      secondary: '#0891b2',
      secondaryLight: '#06b6d4',
      secondaryDark: '#0e7490',
      
      // Accent colors
      accent: '#ea580c',
      accentLight: '#f97316',
      accentDark: '#c2410c',
      
      // Background colors
      bgPrimary: '#ffffff',
      bgSecondary: '#f9fafb',
      bgTertiary: '#f3f4f6',
      
      // Glass effect colors
      glassBg: 'rgba(255, 255, 255, 0.85)',
      glassBorder: 'rgba(209, 213, 219, 0.5)',
      glassHover: 'rgba(255, 255, 255, 0.95)',
      
      // Text colors
      textPrimary: '#111827',
      textSecondary: '#4b5563',
      textTertiary: '#6b7280',
      
      // Status colors
      success: '#047857',
      warning: '#b45309',
      error: '#b91c1c',
      info: '#1d4ed8',
      
      // Chart colors
      chart1: '#6d28d9',
      chart2: '#0891b2',
      chart3: '#047857',
      chart4: '#ea580c',
      chart5: '#b91c1c',
      chart6: '#1d4ed8',
      
      // Additional light mode specific colors
      borderColor: '#d1d5db',
      hoverBg: '#f3f4f6',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
    }
  },
  
  // Default theme (dark mode)
  default: {
    name: 'Dark',
    colors: {
      // Primary colors
      primary: '#a855f7',
      primaryLight: '#c084fc',
      primaryDark: '#9333ea',
      
      // Secondary colors
      secondary: '#06b6d4',
      secondaryLight: '#22d3ee',
      secondaryDark: '#0891b2',
      
      // Accent colors
      accent: '#f59e0b',
      accentLight: '#fbbf24',
      accentDark: '#d97706',
      
      // Background colors
      bgPrimary: '#0a0a0a',
      bgSecondary: '#2a2a2a',
      bgTertiary: '#3a3a3a',
      
      // Glass effect colors
      glassBg: 'rgba(255, 255, 255, 0.05)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      glassHover: 'rgba(255, 255, 255, 0.1)',
      
      // Text colors
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      textTertiary: 'rgba(255, 255, 255, 0.6)',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Chart colors
      chart1: '#a855f7',
      chart2: '#06b6d4',
      chart3: '#10b981',
      chart4: '#f59e0b',
      chart5: '#ef4444',
      chart6: '#3b82f6',
      
      // Additional dark mode specific colors
      borderColor: 'rgba(255, 255, 255, 0.1)',
      hoverBg: 'rgba(255, 255, 255, 0.05)',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
    }
  },
  
  // Navy Blue theme
  navyBlue: {
    name: 'Navy Blue',
    colors: {
      // Primary colors
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      primaryDark: '#2563eb',
      
      // Secondary colors
      secondary: '#0ea5e9',
      secondaryLight: '#38bdf8',
      secondaryDark: '#0284c7',
      
      // Accent colors
      accent: '#f97316',
      accentLight: '#fb923c',
      accentDark: '#ea580c',
      
      // Background colors
      bgPrimary: '#111827',
      bgSecondary: '#1e293b',
      bgTertiary: '#334155',
      bgGradient: 'linear-gradient(to bottom right, #111827, #000000, #111827)',
      
      // Glass effect colors
      glassBg: 'rgba(148, 163, 184, 0.05)',
      glassBorder: 'rgba(148, 163, 184, 0.1)',
      glassHover: 'rgba(148, 163, 184, 0.15)',
      
      // Text colors
      textPrimary: '#f1f5f9',
      textSecondary: 'rgba(241, 245, 249, 0.8)',
      textTertiary: 'rgba(241, 245, 249, 0.6)',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Chart colors
      chart1: '#3b82f6',
      chart2: '#0ea5e9',
      chart3: '#06b6d4',
      chart4: '#0891b2',
      chart5: '#0e7490',
      chart6: '#155e75',
    }
  },
  
  // Emerald theme
  emerald: {
    name: 'Emerald',
    colors: {
      // Primary colors
      primary: '#10b981',
      primaryLight: '#34d399',
      primaryDark: '#059669',
      
      // Secondary colors
      secondary: '#14b8a6',
      secondaryLight: '#2dd4bf',
      secondaryDark: '#0d9488',
      
      // Accent colors
      accent: '#f59e0b',
      accentLight: '#fbbf24',
      accentDark: '#d97706',
      
      // Background colors
      bgPrimary: '#052e16',
      bgSecondary: '#14532d',
      bgTertiary: '#166534',
      
      // Glass effect colors
      glassBg: 'rgba(134, 239, 172, 0.05)',
      glassBorder: 'rgba(134, 239, 172, 0.1)',
      glassHover: 'rgba(134, 239, 172, 0.15)',
      
      // Text colors
      textPrimary: '#f0fdf4',
      textSecondary: 'rgba(240, 253, 244, 0.8)',
      textTertiary: 'rgba(240, 253, 244, 0.6)',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Chart colors
      chart1: '#10b981',
      chart2: '#14b8a6',
      chart3: '#059669',
      chart4: '#047857',
      chart5: '#065f46',
      chart6: '#064e3b',
    }
  },
  
  // Rose Gold theme
  roseGold: {
    name: 'Rose Gold',
    colors: {
      // Primary colors
      primary: '#f43f5e',
      primaryLight: '#fb7185',
      primaryDark: '#e11d48',
      
      // Secondary colors
      secondary: '#ec4899',
      secondaryLight: '#f472b6',
      secondaryDark: '#db2777',
      
      // Accent colors
      accent: '#fbbf24',
      accentLight: '#fcd34d',
      accentDark: '#f59e0b',
      
      // Background colors
      bgPrimary: '#2a1a1a',
      bgSecondary: '#3a2a2a',
      bgTertiary: '#4a3a3a',
      
      // Glass effect colors
      glassBg: 'rgba(251, 113, 133, 0.05)',
      glassBorder: 'rgba(251, 113, 133, 0.1)',
      glassHover: 'rgba(251, 113, 133, 0.15)',
      
      // Text colors
      textPrimary: '#fff5f5',
      textSecondary: 'rgba(255, 245, 245, 0.8)',
      textTertiary: 'rgba(255, 245, 245, 0.6)',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Chart colors
      chart1: '#f43f5e',
      chart2: '#ec4899',
      chart3: '#db2777',
      chart4: '#be185d',
      chart5: '#9f1239',
      chart6: '#881337',
    }
  }
};

// Helper function to apply theme
export const applyTheme = (themeName) => {
  const theme = themes[themeName] || themes.default;
  const root = document.documentElement;
  
  // Apply CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Store theme preference
  localStorage.setItem('selectedTheme', themeName);
  
  return theme;
};

// Get current theme
export const getCurrentTheme = () => {
  const savedTheme = localStorage.getItem('selectedTheme') || 'default';
  return themes[savedTheme] || themes.default;
};

// Get all available themes
export const getAvailableThemes = () => {
  return Object.keys(themes).map(key => ({
    id: key,
    name: themes[key].name,
    preview: {
      primary: themes[key].colors.primary,
      secondary: themes[key].colors.secondary,
      accent: themes[key].colors.accent
    }
  }));
};

export default themes;