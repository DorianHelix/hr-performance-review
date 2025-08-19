import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import API from '../../api';

// Score Chart Modal Component
function ScoreChartModal({ data, categories, getCategoryScore, onClose, DateRangePicker }) {
  if (!data) return null;
  
  const { employee, startDate: initialStart, endDate: initialEnd } = data;
  
  // Use the dates passed from parent component directly
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [chartData, setChartData] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [visibleCategories, setVisibleCategories] = useState({});
  const chartContainerRef = useRef(null);
  
  // Initialize visible categories when categories prop changes
  useEffect(() => {
    const initial = {};
    categories.forEach(cat => {
      initial[cat.key] = true;
    });
    setVisibleCategories(initial);
  }, [categories]);
  
  // Get scoring data for the date range from database
  useEffect(() => {
    if (!data) return;
    
    const fetchScores = async () => {
      try {
        // Fetch scores from database
        const response = await API.scores.getScores({
          entity_id: employee.id,
          start_date: startDate.replace(/-/g, ''),
          end_date: endDate.replace(/-/g, '')
        });
        
        // Get all days in the date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = [];
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          days.push(new Date(d).toISOString().slice(0, 10));
        }
        
        // Map database scores to chart data
        const scores = days.map(day => {
          const dayKey = day.replace(/-/g, '');
          
          // Find scores for this day
          const dayScores = response.filter(s => s.date === dayKey);
          
          // Build scores object dynamically from categories
          const dayScoreData = { date: day };
          categories.forEach(cat => {
            const score = dayScores.find(s => s.category === cat.key)?.score || null;
            dayScoreData[cat.key] = score;
          });
          
          return dayScoreData;
        });
        
        setChartData(scores);
      } catch (error) {
        console.error('Error fetching scores:', error);
        // Fallback to getCategoryScore if API fails
        const days = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          days.push(new Date(d).toISOString().slice(0, 10));
        }
        
        const scores = days.map(day => {
          const dayKey = day.replace(/-/g, '');
          
          // Build scores object dynamically from categories
          const dayScoreData = { date: day };
          categories.forEach(cat => {
            dayScoreData[cat.key] = getCategoryScore?.(employee.id, dayKey, cat.key);
          });
          
          return dayScoreData;
        });
        
        setChartData(scores);
      }
    };
    
    fetchScores();
  }, [startDate, endDate, employee, data, getCategoryScore, categories]);
  
  // Simple line chart rendering
  const maxScore = 10;
  const chartHeight = 450; // Increased from 300
  const chartWidth = 800;   // Increased from 600
  const padding = 50;
  
  // Filter out days with no scores
  const dataWithScores = chartData.filter(d => 
    categories.some(cat => d[cat.key] !== null && d[cat.key] !== undefined)
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📊 Performance Trends
              </h2>
              <p className="text-sm text-white/60 mt-1">
                {employee?.name || 'Product'} scoring trends over time
              </p>
            </div>
            <button onClick={onClose} className="glass-button p-2 rounded-lg hover:scale-110">
              <X size={18} className="text-white/80" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Date Range Selector */}
          <div className="mb-6">
            {DateRangePicker && (
              <DateRangePicker 
                startDate={startDate} 
                endDate={endDate} 
                onRangeChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            )}
          </div>
          
          {/* Chart */}
          <div ref={chartContainerRef} className="glass-card p-6 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 relative">
            {dataWithScores.length > 0 ? (
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex items-center gap-6 justify-center mb-6">
                  {categories.map((cat, idx) => {
                    // Get dynamic colors for each category
                    const getColorClass = (index) => {
                      const colors = [
                        'from-blue-400 to-blue-600 shadow-blue-500/50',
                        'from-green-400 to-green-600 shadow-green-500/50', 
                        'from-purple-400 to-purple-600 shadow-purple-500/50',
                        'from-orange-400 to-orange-600 shadow-orange-500/50',
                        'from-pink-400 to-pink-600 shadow-pink-500/50',
                        'from-yellow-400 to-yellow-600 shadow-yellow-500/50'
                      ];
                      return colors[index % colors.length];
                    };
                    
                    const isVisible = visibleCategories[cat.key] !== false;
                    
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setVisibleCategories(prev => ({
                          ...prev,
                          [cat.key]: !prev[cat.key]
                        }))}
                        className={`flex items-center gap-2 glass-card px-3 py-1.5 rounded-lg transition-all ${
                          isVisible ? 'opacity-100' : 'opacity-40'
                        } hover:scale-105`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getColorClass(idx)} shadow-lg`}></div>
                        <span className="text-sm text-white font-medium">{cat.key}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Enhanced SVG Chart with gradients and animations */}
                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
                  {/* Define gradients */}
                  <defs>
                    {/* Dynamic gradients for each category */}
                    {categories.map((category, idx) => {
                      const getColor = (index) => {
                        const colors = ['#3b82f6', '#10b981', '#a855f7', '#f97316', '#ec4899', '#eab308'];
                        return colors[index % colors.length];
                      };
                      
                      const color = getColor(idx);
                      const gradientId = `${category.key.toLowerCase()}Gradient`;
                      
                      return (
                        <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
                          <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
                        </linearGradient>
                      );
                    })}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Scoring zone backgrounds */}
                  <g opacity="0.05">
                    {/* Green zone (9-10) */}
                    <rect
                      x={padding}
                      y={padding}
                      width={chartWidth - 2 * padding}
                      height={(2 / 10) * (chartHeight - 2 * padding)}
                      fill="rgb(34, 197, 94)"
                    />
                    {/* Yellow zone (7-8) */}
                    <rect
                      x={padding}
                      y={padding + (2 / 10) * (chartHeight - 2 * padding)}
                      width={chartWidth - 2 * padding}
                      height={(2 / 10) * (chartHeight - 2 * padding)}
                      fill="rgb(250, 204, 21)"
                    />
                    {/* Orange zone (5-6) */}
                    <rect
                      x={padding}
                      y={padding + (4 / 10) * (chartHeight - 2 * padding)}
                      width={chartWidth - 2 * padding}
                      height={(2 / 10) * (chartHeight - 2 * padding)}
                      fill="rgb(251, 146, 60)"
                    />
                    {/* Red zone (0-4) */}
                    <rect
                      x={padding}
                      y={padding + (6 / 10) * (chartHeight - 2 * padding)}
                      width={chartWidth - 2 * padding}
                      height={(4 / 10) * (chartHeight - 2 * padding)}
                      fill="rgb(239, 68, 68)"
                    />
                  </g>
                  
                  {/* Grid lines - simple gray style */}
                  {[0, 2, 4, 6, 8, 10].map(score => {
                    const y = padding + ((10 - score) / 10) * (chartHeight - 2 * padding);
                    
                    return (
                      <g key={score}>
                        <line
                          x1={padding}
                          y1={y}
                          x2={chartWidth - padding}
                          y2={y}
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="1"
                          strokeDasharray={score === 0 || score === 10 ? "none" : "3,3"}
                        />
                        <text
                          x={padding - 10}
                          y={y + 4}
                          fill="rgba(255,255,255,0.5)"
                          fontSize="11"
                          fontWeight={score === 0 || score === 10 ? "bold" : "normal"}
                          textAnchor="end"
                        >
                          {score}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Area charts and lines for each category */}
                  {categories.map((category, idx) => {
                    // Skip if category is hidden
                    if (!visibleCategories[category.key]) return null;
                    
                    // Get dynamic colors for each category
                    const getColor = (index) => {
                      const colors = ['#3b82f6', '#10b981', '#a855f7', '#f97316', '#ec4899', '#eab308'];
                      return colors[index % colors.length];
                    };
                    
                    const color = getColor(idx);
                    const gradientId = `${category.key.toLowerCase()}Gradient`;
                    
                    const validPoints = dataWithScores
                      .map((d, i) => {
                        if (!d[category.key]) return null;
                        const x = padding + (i / (dataWithScores.length - 1 || 1)) * (chartWidth - 2 * padding);
                        const y = padding + ((10 - d[category.key]) / 10) * (chartHeight - 2 * padding);
                        return { x, y, value: d[category.key], date: d.date };
                      })
                      .filter(Boolean);
                    
                    if (validPoints.length === 0) return null;
                    
                    // Create smooth curve path using cubic Bezier curves
                    const createSmoothPath = (points) => {
                      if (points.length < 2) return '';
                      
                      let path = `M ${points[0].x},${points[0].y}`;
                      
                      for (let i = 1; i < points.length; i++) {
                        const prev = points[i - 1];
                        const curr = points[i];
                        const next = points[i + 1];
                        
                        // Calculate control points for smooth curves
                        const tension = 0.3;
                        let cp1x, cp1y, cp2x, cp2y;
                        
                        if (i === 1) {
                          // First segment
                          cp1x = prev.x + (curr.x - prev.x) * tension;
                          cp1y = prev.y;
                        } else {
                          const prevPrev = points[i - 2];
                          cp1x = prev.x + (curr.x - prevPrev.x) * tension;
                          cp1y = prev.y + (curr.y - prevPrev.y) * tension;
                        }
                        
                        if (i === points.length - 1) {
                          // Last segment
                          cp2x = curr.x - (curr.x - prev.x) * tension;
                          cp2y = curr.y;
                        } else {
                          cp2x = curr.x - (next.x - prev.x) * tension;
                          cp2y = curr.y - (next.y - prev.y) * tension;
                        }
                        
                        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
                      }
                      
                      return path;
                    };
                    
                    const smoothPath = createSmoothPath(validPoints);
                    const areaPath = `${smoothPath} L ${validPoints[validPoints.length - 1].x},${chartHeight - padding} L ${validPoints[0].x},${chartHeight - padding} Z`;
                    
                    return (
                      <g key={category.key}>
                        {/* Area fill */}
                        <path
                          d={areaPath}
                          fill={`url(#${gradientId})`}
                          opacity="0.3"
                          className="animate-fade-in"
                        />
                        
                        {/* Smooth curved line */}
                        <path
                          d={smoothPath}
                          fill="none"
                          stroke={color}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#glow)"
                          className="animate-draw-line"
                        />
                        
                        {/* Data points with hover effect */}
                        {validPoints.map((point, i) => (
                          <g key={`${category.key}-${i}`}>
                            {/* Invisible larger hover area */}
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="15"
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={(e) => {
                                // Get the circle element's position
                                const circleRect = e.target.getBoundingClientRect();
                                
                                // Get the modal container position
                                const modalElement = e.target.closest('.fixed');
                                if (!modalElement) return;
                                const modalRect = modalElement.getBoundingClientRect();
                                
                                // Calculate position relative to modal
                                const relativeX = circleRect.left + (circleRect.width / 2) - modalRect.left;
                                const relativeY = circleRect.top + (circleRect.height / 2) - modalRect.top;
                                
                                setHoveredPoint({
                                  ...point,
                                  category: category.key,
                                  color: color,
                                  chartX: point.x,
                                  chartY: point.y,
                                  tooltipX: relativeX,
                                  tooltipY: relativeY
                                });
                              }}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            {/* Main point */}
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r={hoveredPoint && hoveredPoint.chartX === point.x && hoveredPoint.chartY === point.y ? "7.2" : "6"}
                              fill="white"
                              stroke={color}
                              strokeWidth="3"
                              className="transition-all duration-200 pointer-events-none"
                              style={{
                                filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.3))',
                                transformOrigin: `${point.x}px ${point.y}px`
                              }}
                            />
                          </g>
                        ))}
                      </g>
                    );
                  })}
                  
                  {/* X-axis dates */}
                  {dataWithScores.map((d, i) => {
                    if (i % Math.ceil(dataWithScores.length / 6) !== 0) return null;
                    const x = padding + (i / (dataWithScores.length - 1 || 1)) * (chartWidth - 2 * padding);
                    return (
                      <text
                        key={i}
                        x={x}
                        y={chartHeight - padding + 20}
                        fill="rgba(255,255,255,0.5)"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </text>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="text-center py-12 text-white/50">
                <div className="text-lg mb-2">No scoring data available</div>
                <div className="text-sm text-white/40">
                  No performance scores found for "{employee?.name || 'this product'}" in the selected date range
                </div>
                <div className="text-xs text-white/30 mt-2">
                  Product ID: {employee?.id}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Hover Tooltip */}
        {hoveredPoint && hoveredPoint.tooltipX && hoveredPoint.tooltipY && (
          <div 
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${hoveredPoint.tooltipX}px`,
              top: `${hoveredPoint.tooltipY - 12}px`,
              transform: 'translate(-50%, -100%)',
              maxWidth: '200px'
            }}
          >
            <div className="relative">
              <div className="glass-card p-3 rounded-lg border border-white/20 whitespace-nowrap" style={{
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                userSelect: 'none'
              }}>
                <div className="text-white/90 text-sm font-medium mb-1">
                  {new Date(hoveredPoint.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hoveredPoint.color }}
                  />
                  <span className="text-white font-bold text-sm">{hoveredPoint.category}</span>
                  <span className="text-white/60 text-sm">:</span>
                  <span 
                    className="font-bold text-sm px-2 py-0.5 rounded"
                    style={{ 
                      color: hoveredPoint.color,
                      backgroundColor: `${hoveredPoint.color}20`
                    }}
                  >
                    {hoveredPoint.value}/10
                  </span>
                </div>
              </div>
              {/* Arrow pointing down to the data point */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0"
                style={{
                  bottom: '-6px',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid rgba(0, 0, 0, 0.95)',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoreChartModal;