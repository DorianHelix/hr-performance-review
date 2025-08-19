import React, { useState, useRef, useEffect } from 'react';

// Universal Liquid Glass Tooltip Component
function LiquidTooltip({ children, content, variant = 'default', position = 'bottom', onClick = false, icon = null }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Simple black tooltip design for all variants
  const variants = {
    default: {
      bg: 'rgba(0, 0, 0, 0.9)',
      border: 'border-white/10',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      text: 'text-white',
      iconColor: 'text-white/80',
      arrow: 'rgba(0, 0, 0, 0.9)'
    },
    warning: {
      bg: 'rgba(0, 0, 0, 0.9)',
      border: 'border-orange-400/20',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      text: 'text-white',
      iconColor: 'text-orange-400',
      arrow: 'rgba(0, 0, 0, 0.9)'
    },
    success: {
      bg: 'rgba(0, 0, 0, 0.9)',
      border: 'border-white/10',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      text: 'text-white',
      iconColor: 'text-green-400',
      arrow: 'rgba(0, 0, 0, 0.9)'
    },
    danger: {
      bg: 'rgba(0, 0, 0, 0.9)',
      border: 'border-white/10',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      text: 'text-white',
      iconColor: 'text-red-400',
      arrow: 'rgba(0, 0, 0, 0.9)'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  const handleInteraction = () => {
    if (onClick) {
      setShowTooltip(!showTooltip);
    }
  };

  const shouldShow = onClick ? showTooltip : isHovered;

  // Position classes
  const positionClasses = {
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    top: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowStyles = {
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderTop: `4px solid ${currentVariant.arrow}`
    },
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderBottom: `4px solid ${currentVariant.arrow}`
    },
    left: {
      top: '50%',
      right: '100%',
      transform: 'translateY(-50%)',
      borderTop: '4px solid transparent',
      borderBottom: '4px solid transparent',
      borderRight: `4px solid ${currentVariant.arrow}`
    },
    right: {
      top: '50%',
      left: '100%',
      transform: 'translateY(-50%)',
      borderTop: '4px solid transparent',
      borderBottom: '4px solid transparent',
      borderLeft: `4px solid ${currentVariant.arrow}`
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => !onClick && setIsHovered(true)}
      onMouseLeave={() => !onClick && setIsHovered(false)}
      onClick={handleInteraction}
    >
      {children}
      
      {/* Liquid Glass Tooltip */}
      {shouldShow && (
        <div className={`absolute ${positionClasses[position]} z-50`}>
          <div 
            className={`glass-card px-3 py-1.5 rounded-lg border ${currentVariant.border} whitespace-nowrap`}
            style={{
              background: currentVariant.bg,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              boxShadow: currentVariant.shadow
            }}
          >
            <div className="flex items-center gap-2">
              {icon && (
                <div className={currentVariant.iconColor}>
                  {icon}
                </div>
              )}
              <span className={`text-xs ${currentVariant.text} font-medium`}>
                {content}
              </span>
            </div>
            
            {/* Tooltip Arrow */}
            <div 
              className="absolute w-0 h-0" 
              style={{
                ...arrowStyles[position],
                filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Smart Tooltip that only shows when content is actually truncated
function TruncatedTooltip({ children, content, variant = 'default', position = 'bottom' }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkTruncation = () => {
      const container = containerRef.current;
      if (container) {
        // Find the text element inside the container
        const textElement = container.querySelector('div') || container;
        if (textElement) {
          // Check if content is truncated by comparing scroll dimensions with client dimensions
          const truncated = textElement.scrollWidth > textElement.clientWidth || 
                           textElement.scrollHeight > textElement.clientHeight;
          setIsTruncated(truncated);
        }
      }
    };

    // Use setTimeout to ensure DOM is rendered
    setTimeout(checkTruncation, 0);
    
    // Re-check on window resize
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [content]);

  const handleMouseEnter = () => {
    if (isTruncated) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {children}
      
      {/* Only show tooltip if content is truncated AND mouse is hovering */}
      {showTooltip && isTruncated && (
        <div className={`absolute ${position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2' : 
                         position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 mt-2' : 
                         position === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-2' : 
                         'left-full top-1/2 transform -translate-y-1/2 ml-2'} z-50`}>
          <div 
            className="glass-card px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <span className="text-xs text-white font-medium">
              {content}
            </span>
            
            {/* Tooltip Arrow */}
            <div 
              className="absolute w-0 h-0" 
              style={{
                ...(position === 'bottom' ? {
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '4px solid rgba(0, 0, 0, 0.9)'
                } : position === 'top' ? {
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: '4px solid rgba(0, 0, 0, 0.9)'
                } : position === 'left' ? {
                  top: '50%',
                  right: '100%',
                  transform: 'translateY(-50%)',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  borderRight: '4px solid rgba(0, 0, 0, 0.9)'
                } : {
                  top: '50%',
                  left: '100%',
                  transform: 'translateY(-50%)',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  borderLeft: '4px solid rgba(0, 0, 0, 0.9)'
                }),
                filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default LiquidTooltip;
export { TruncatedTooltip };