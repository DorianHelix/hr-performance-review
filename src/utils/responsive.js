// Global responsive configuration
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Responsive grid column configurations
export const gridCols = {
  dashboard: {
    kpiCards: 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    performanceCards: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    chartSection: 'grid-cols-1 lg:grid-cols-3',
    productSection: 'grid-cols-1 lg:grid-cols-2',
    statsGrid: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
  },
  products: {
    main: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    filters: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  },
  orders: {
    main: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
    stats: 'grid-cols-2 sm:grid-cols-4'
  },
  orgChart: {
    controls: 'grid-cols-1 sm:grid-cols-2',
    quickCreate: 'grid-cols-1 sm:grid-cols-2'
  }
};

// Layout configurations for different screen sizes
export const layoutConfig = {
  sidebar: {
    width: {
      collapsed: 'w-16 sm:w-20',
      expanded: 'w-64 sm:w-72'
    },
    padding: {
      collapsed: 'ml-16 sm:ml-20',
      expanded: 'ml-64 sm:ml-72'
    }
  },
  padding: {
    mobile: 'p-2 sm:p-4',
    tablet: 'p-4 md:p-6',
    desktop: 'p-6 lg:p-8'
  },
  gap: {
    mobile: 'gap-2 sm:gap-3',
    tablet: 'gap-3 md:gap-4',
    desktop: 'gap-4 lg:gap-6'
  }
};

// Utility function to check if viewport is mobile
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < parseInt(breakpoints.md);
};

// Utility function to check if viewport is tablet
export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg);
};

// Utility function to check if viewport is desktop
export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= parseInt(breakpoints.lg);
};

// Hook for responsive values
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < parseInt(breakpoints.sm)) return 'mobile';
    if (width < parseInt(breakpoints.md)) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < parseInt(breakpoints.sm)) {
        setScreenSize('mobile');
      } else if (width < parseInt(breakpoints.md)) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop'
  };
};