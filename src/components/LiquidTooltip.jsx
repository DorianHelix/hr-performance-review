import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Universal Liquid Glass Tooltip Component
function LiquidTooltip({ children, content, variant = 'default', position = 'bottom', onClick = false, icon = null }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

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

  const updateTooltipPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      let top, left;
      
      switch (position) {
        case 'bottom':
          top = rect.bottom + scrollY + 8;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'top':
          top = rect.top + scrollY - 8;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 8;
          break;
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + 8;
          break;
        default:
          top = rect.bottom + scrollY + 8;
          left = rect.left + scrollX + rect.width / 2;
      }
      
      setTooltipPosition({ top, left });
    }
  };

  const handleInteraction = () => {
    if (onClick) {
      updateTooltipPosition();
      setShowTooltip(!showTooltip);
    }
  };

  const handleMouseEnter = () => {
    if (!onClick) {
      updateTooltipPosition();
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!onClick) {
      setIsHovered(false);
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

  const renderTooltip = () => {
    if (!shouldShow) return null;

    const arrowStyles = {
      bottom: {
        top: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderBottom: `4px solid ${currentVariant.arrow}`
      },
      top: {
        bottom: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderTop: `4px solid ${currentVariant.arrow}`
      },
      left: {
        top: '50%',
        right: '-4px',
        transform: 'translateY(-50%)',
        borderTop: '4px solid transparent',
        borderBottom: '4px solid transparent',
        borderLeft: `4px solid ${currentVariant.arrow}`
      },
      right: {
        top: '50%',
        left: '-4px',
        transform: 'translateY(-50%)',
        borderTop: '4px solid transparent',
        borderBottom: '4px solid transparent',
        borderRight: `4px solid ${currentVariant.arrow}`
      }
    };

    return (
      <div 
        style={{
          position: 'absolute',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: position === 'bottom' || position === 'top' ? 'translateX(-50%)' :
                    position === 'left' ? 'translate(-100%, -50%)' :
                    position === 'right' ? 'translate(0%, -50%)' : 'translateX(-50%)',
          zIndex: 999999,
          pointerEvents: 'none'
        }}
      >
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
    );
  };

  return (
    <>
      <div 
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleInteraction}
        ref={triggerRef}
      >
        {children}
      </div>
      
      {/* Portal the tooltip to document.body */}
      {shouldShow && createPortal(renderTooltip(), document.body)}
    </>
  );
}

// Smart Tooltip that only shows when content is actually truncated
function TruncatedTooltip({ children, content, variant = 'default', position = 'bottom' }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
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

  const updateTooltipPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      let top, left;
      
      switch (position) {
        case 'bottom':
          top = rect.bottom + scrollY + 8;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'top':
          top = rect.top + scrollY - 8;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 8;
          break;
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + 8;
          break;
        default:
          top = rect.bottom + scrollY + 8;
          left = rect.left + scrollX + rect.width / 2;
      }
      
      setTooltipPosition({ top, left });
    }
  };

  const handleMouseEnter = () => {
    if (isTruncated) {
      updateTooltipPosition();
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const renderTooltip = () => {
    if (!showTooltip || !isTruncated) return null;

    const arrowStyles = {
      bottom: {
        top: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderBottom: '4px solid rgba(0, 0, 0, 0.9)'
      },
      top: {
        bottom: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderTop: '4px solid rgba(0, 0, 0, 0.9)'
      },
      left: {
        top: '50%',
        right: '-4px',
        transform: 'translateY(-50%)',
        borderTop: '4px solid transparent',
        borderBottom: '4px solid transparent',
        borderLeft: '4px solid rgba(0, 0, 0, 0.9)'
      },
      right: {
        top: '50%',
        left: '-4px',
        transform: 'translateY(-50%)',
        borderTop: '4px solid transparent',
        borderBottom: '4px solid transparent',
        borderRight: '4px solid rgba(0, 0, 0, 0.9)'
      }
    };

    return (
      <div 
        style={{
          position: 'absolute',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: position === 'bottom' || position === 'top' ? 'translateX(-50%)' :
                    position === 'left' ? 'translate(-100%, -50%)' :
                    position === 'right' ? 'translate(0%, -50%)' : 'translateX(-50%)',
          zIndex: 999999,
          pointerEvents: 'none'
        }}
      >
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
              ...arrowStyles[position],
              filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))'
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={containerRef}
      >
        {children}
      </div>
      
      {/* Portal the tooltip to document.body */}
      {showTooltip && isTruncated && createPortal(renderTooltip(), document.body)}
    </>
  );
}

export default LiquidTooltip;
export { TruncatedTooltip };