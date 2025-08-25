import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Delaunay } from 'd3-delaunay';
import { Activity, Zap, Loader, TrendingUp, Package, Layers, Network, HexagonIcon } from 'lucide-react';

const SyncVisualization = () => {
  const [activeView, setActiveView] = useState('voronoi');
  const [syncData, setSyncData] = useState({
    totalOrders: 50000,
    processedOrders: 0,
    products: {},
    orderFlow: [],
    syncSpeed: 0,
    timeRemaining: 0
  });
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const voronoiRef = useRef(null);
  const simulationRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Simulate real-time sync data
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncData(prev => {
        const newProcessed = Math.min(prev.processedOrders + Math.floor(Math.random() * 500 + 100), prev.totalOrders);
        const progress = newProcessed / prev.totalOrders;
        
        // Simulate products being updated with realistic data
        const productId = `product_${Math.floor(Math.random() * 20)}`;
        const newProducts = { ...prev.products };
        if (!newProducts[productId]) {
          const productNum = productId.split('_')[1];
          newProducts[productId] = {
            id: productId,
            name: `Product ${productNum}`,
            orders: 0,
            revenue: 0,
            x: Math.random() * 100,
            y: Math.random() * 100,
            radius: 5,
            thumbnail: `https://picsum.photos/200/200?random=${productNum}`,
            sku: `SKU-${1000 + parseInt(productNum)}`,
            vendor: ['TechCorp', 'StyleBrand', 'HomeGoods', 'SportPro'][Math.floor(Math.random() * 4)]
          };
        }
        newProducts[productId].orders += Math.floor(Math.random() * 10 + 1);
        newProducts[productId].revenue += Math.random() * 1000;
        newProducts[productId].radius = Math.sqrt(newProducts[productId].orders) * 3;
        
        return {
          ...prev,
          processedOrders: newProcessed,
          products: newProducts,
          syncSpeed: Math.random() * 200 + 50,
          timeRemaining: Math.max(0, (prev.totalOrders - newProcessed) / 100)
        };
      });
    }, 1000);
    
    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, []);
  
  // Voronoi Diagram Visualization
  useEffect(() => {
    if (activeView !== 'voronoi' || !voronoiRef.current) return;
    
    const container = d3.select(voronoiRef.current);
    container.selectAll('*').remove();
    
    const width = voronoiRef.current.clientWidth;
    const height = 400;
    
    const svg = container.append('svg')
      .attr('width', width)
      .attr('height', height);
    
    const products = Object.values(syncData.products);
    if (products.length === 0) return;
    
    // Create Voronoi cells using Delaunay triangulation
    const voronoiPoints = products.map(d => [d.x * width / 100, d.y * height / 100]);
    const delaunay = Delaunay.from(voronoiPoints);
    const voronoi = delaunay.voronoi([0, 0, width, height]);
    
    // Create gradient definitions
    const defs = svg.append('defs');
    
    // Add smooth pulsating animation CSS
    const style = defs.append('style')
      .text(`
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
          100% { opacity: 0.6; transform: scale(1); }
        }
        .cell-path {
          animation: pulse 4s ease-in-out infinite;
          transform-origin: center;
          transition: all 0.3s ease;
        }
        .cell-path:hover {
          opacity: 1 !important;
          animation: none;
          filter: brightness(1.2);
        }
      `);
    
    products.forEach((p, i) => {
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${p.id}`)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
      
      const color = d3.interpolateCool(i / products.length);
      
      gradient.append('stop')
        .attr('offset', '0%')
        .style('stop-color', color)
        .style('stop-opacity', 0.9);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .style('stop-color', color)
        .style('stop-opacity', 0.1);
    });
    
    // Draw Voronoi cells
    const cells = svg.selectAll('.cell')
      .data(products)
      .enter().append('path')
      .attr('class', 'cell-path')
      .attr('d', (d, i) => voronoi.renderCell(i))
      .style('fill', (d) => `url(#gradient-${d.id})`)
      .style('stroke', '#ffffff20')
      .style('stroke-width', 1.5)
      .on('mouseenter', function(event, d) {
        setHoveredProduct(d);
        const rect = voronoiRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });
      })
      .on('mousemove', function(event, d) {
        const rect = voronoiRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });
      })
      .on('mouseleave', function() {
        setHoveredProduct(null);
      });
    
    // Add center points
    const pointNodes = svg.selectAll('.point')
      .data(products)
      .enter().append('circle')
      .attr('cx', d => d.x * width / 100)
      .attr('cy', d => d.y * height / 100)
      .attr('r', d => Math.min(d.radius, 20))
      .style('fill', '#fff')
      .style('stroke', (d, i) => d3.interpolateCool(i / products.length))
      .style('stroke-width', 2)
      .style('opacity', 0.8)
      .style('cursor', 'pointer');
    
    // Add labels
    svg.selectAll('.label')
      .data(products)
      .enter().append('text')
      .attr('x', d => d.x * width / 100)
      .attr('y', d => d.y * height / 100 + 3)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .style('font-size', '9px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text(d => d.orders);
    
  }, [activeView, syncData]);
  
  const progress = (syncData.processedOrders / syncData.totalOrders) * 100;
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse">
                <Zap size={24} className="text-purple-400" />
              </div>
              Sync Visualization Lab
            </h1>
            <p className="text-white/60 mt-1">Real-time order synchronization and product aggregation</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{syncData.processedOrders.toLocaleString()}</div>
              <div className="text-sm text-white/60">of {syncData.totalOrders.toLocaleString()} orders</div>
            </div>
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-white/10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                  className="text-purple-500 transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{progress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Visualization Area */}
      <div className="flex-1 p-6">
        <div className="glass-card-large p-6 h-full">
          {/* Chart Container */}
          <div className="mb-6 relative">
            <div ref={voronoiRef} className="w-full h-[400px] relative">
              {/* Product Tooltip */}
              {hoveredProduct && (
                <div 
                  className="absolute z-50 pointer-events-none"
                  style={{
                    left: `${tooltipPosition.x + 10}px`,
                    top: `${tooltipPosition.y - 60}px`,
                    transform: 'translate(0, -100%)'
                  }}
                >
                  <div className="bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-3 shadow-2xl">
                    <div className="flex items-start gap-3">
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                        {hoveredProduct.thumbnail ? (
                          <img 
                            src={hoveredProduct.thumbnail} 
                            alt={hoveredProduct.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full flex items-center justify-center text-white/40"
                          style={{ display: hoveredProduct.thumbnail ? 'none' : 'flex' }}
                        >
                          <Package size={24} />
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="min-w-[140px]">
                        <div className="text-white font-semibold text-sm mb-1">
                          {hoveredProduct.name}
                        </div>
                        <div className="text-white/60 text-xs mb-2">
                          {hoveredProduct.vendor} • {hoveredProduct.sku}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/50">Orders:</span>
                            <span className="text-white font-medium">{hoveredProduct.orders}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/50">Revenue:</span>
                            <span className="text-green-400 font-medium">
                              ${hoveredProduct.revenue?.toFixed(0) || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tooltip Arrow */}
                    <div 
                      className="absolute w-3 h-3 bg-black/90 border-l border-b border-white/20 transform rotate-45"
                      style={{
                        bottom: '-6px',
                        left: '20px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Live Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-green-400" />
                <span className="text-sm text-white/60">Sync Speed</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {syncData.syncSpeed.toFixed(0)} <span className="text-sm text-white/60">orders/s</span>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package size={16} className="text-blue-400" />
                <span className="text-sm text-white/60">Products Updated</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Object.keys(syncData.products).length}
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-purple-400" />
                <span className="text-sm text-white/60">Avg Orders/Product</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Object.values(syncData.products).length > 0 
                  ? (Object.values(syncData.products).reduce((sum, p) => sum + p.orders, 0) / Object.values(syncData.products).length).toFixed(1)
                  : 0}
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader size={16} className="text-orange-400 animate-spin" />
                <span className="text-sm text-white/60">Time Remaining</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.floor(syncData.timeRemaining / 60)}m {Math.floor(syncData.timeRemaining % 60)}s
              </div>
            </div>
          </div>
          
          {/* Top Products */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-white mb-3">Top Synced Products</h3>
            <div className="grid grid-cols-5 gap-2">
              {Object.values(syncData.products)
                .sort((a, b) => b.orders - a.orders)
                .slice(0, 5)
                .map((product, i) => (
                  <div key={product.id} className="glass-card p-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" 
                         style={{ opacity: 0.5 * (1 - i / 5) }} />
                    <div className="relative">
                      <div className="text-xs text-white/60 mb-1">{product.name}</div>
                      <div className="text-lg font-bold text-white">{product.orders}</div>
                      <div className="text-xs text-green-400">
                        ${product.revenue.toFixed(0)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncVisualization;