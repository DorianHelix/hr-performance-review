import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Delaunay } from 'd3-delaunay';
import { Activity, Zap, Loader, TrendingUp, Package } from 'lucide-react';

const SyncVisualization = () => {
  const [syncData, setSyncData] = useState({
    totalOrders: 50000,
    processedOrders: 0,
    products: {},
    syncSpeed: 0,
    timeRemaining: 0
  });
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  
  const voronoiRef = useRef(null);
  const svgRef = useRef(null);
  const intervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  
  // Simulate real-time sync data with controlled updates
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const updateData = () => {
      const now = Date.now();
      // Only update every 2 seconds to reduce load
      if (now - lastUpdateRef.current < 2000) return;
      lastUpdateRef.current = now;

      setSyncData(prev => {
        const newProcessed = Math.min(
          prev.processedOrders + Math.floor(Math.random() * 500 + 100), 
          prev.totalOrders
        );
        
        // Limit to 20 products max to prevent performance issues
        const maxProducts = 20;
        const currentProductCount = Object.keys(prev.products).length;
        
        const newProducts = { ...prev.products };
        
        if (currentProductCount < maxProducts) {
          const productId = `product_${currentProductCount}`;
          const productNum = currentProductCount.toString();
          
          if (!newProducts[productId]) {
            newProducts[productId] = {
              id: productId,
              name: `Product ${productNum}`,
              orders: Math.floor(Math.random() * 50 + 10),
              revenue: Math.random() * 5000 + 1000,
              x: 20 + (currentProductCount % 5) * 15 + Math.random() * 10,
              y: 20 + Math.floor(currentProductCount / 5) * 20 + Math.random() * 10,
              radius: 8,
              sku: `SKU-${1000 + parseInt(productNum)}`,
              vendor: ['TechCorp', 'StyleBrand', 'HomeGoods', 'SportPro'][Math.floor(Math.random() * 4)]
            };
          }
        }
        
        // Update existing products
        Object.keys(newProducts).forEach(key => {
          newProducts[key].orders += Math.floor(Math.random() * 5);
          newProducts[key].revenue += Math.random() * 500;
          newProducts[key].radius = Math.min(Math.sqrt(newProducts[key].orders) * 2, 20);
        });
        
        return {
          ...prev,
          processedOrders: newProcessed,
          products: newProducts,
          syncSpeed: Math.random() * 200 + 50,
          timeRemaining: Math.max(0, (prev.totalOrders - newProcessed) / 100)
        };
      });
    };

    intervalRef.current = setInterval(updateData, 2000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  // Optimized Voronoi Diagram Visualization
  const drawVisualization = useCallback(() => {
    if (!voronoiRef.current || !syncData.products) return;
    
    const container = d3.select(voronoiRef.current);
    
    // Only clear and redraw if we don't have an svg yet
    if (!svgRef.current) {
      container.selectAll('*').remove();
      
      const width = voronoiRef.current.clientWidth || 800;
      const height = 400;
      
      const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'voronoi-svg');
      
      svgRef.current = svg.node();
    }
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 800;
    const height = 400;
    
    const products = Object.values(syncData.products);
    if (products.length < 3) return; // Need at least 3 points for Voronoi
    
    try {
      // Create Voronoi cells using Delaunay triangulation
      const voronoiPoints = products.map(d => [
        (d.x * width) / 100, 
        (d.y * height) / 100
      ]);
      
      const delaunay = Delaunay.from(voronoiPoints);
      const voronoi = delaunay.voronoi([0, 0, width, height]);
      
      // Update or create gradient definitions
      let defs = svg.select('defs');
      if (defs.empty()) {
        defs = svg.append('defs');
      }
      
      // Use data join for gradients
      const gradients = defs.selectAll('radialGradient')
        .data(products, d => d.id);
      
      const gradientsEnter = gradients.enter()
        .append('radialGradient')
        .attr('id', d => `gradient-${d.id}`)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
      
      gradientsEnter.append('stop')
        .attr('offset', '0%')
        .style('stop-color', (d, i) => d3.interpolateCool(i / products.length))
        .style('stop-opacity', 0.8);
      
      gradientsEnter.append('stop')
        .attr('offset', '100%')
        .style('stop-color', (d, i) => d3.interpolateCool(i / products.length))
        .style('stop-opacity', 0.1);
      
      gradients.exit().remove();
      
      // Update Voronoi cells with data join
      const cells = svg.selectAll('.cell-path')
        .data(products, d => d.id);
      
      cells.enter()
        .append('path')
        .attr('class', 'cell-path')
        .style('fill', d => `url(#gradient-${d.id})`)
        .style('stroke', '#ffffff20')
        .style('stroke-width', 1.5)
        .style('opacity', 0.6)
        .style('transition', 'all 0.5s ease')
        .on('mouseenter', function(event, d) {
          d3.select(this).style('opacity', 0.9);
          setHoveredProduct(d);
          const rect = voronoiRef.current.getBoundingClientRect();
          setTooltipPosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          });
        })
        .on('mousemove', function(event) {
          const rect = voronoiRef.current.getBoundingClientRect();
          setTooltipPosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          });
        })
        .on('mouseleave', function() {
          d3.select(this).style('opacity', 0.6);
          setHoveredProduct(null);
        })
        .merge(cells)
        .attr('d', (d, i) => {
          try {
            return voronoi.renderCell(i);
          } catch (e) {
            return '';
          }
        });
      
      cells.exit().remove();
      
      // Update center points with data join
      const points = svg.selectAll('.point')
        .data(products, d => d.id);
      
      points.enter()
        .append('circle')
        .attr('class', 'point')
        .style('fill', '#fff')
        .style('stroke', (d, i) => d3.interpolateCool(i / products.length))
        .style('stroke-width', 2)
        .style('opacity', 0.8)
        .style('cursor', 'pointer')
        .merge(points)
        .transition()
        .duration(500)
        .attr('cx', d => (d.x * width) / 100)
        .attr('cy', d => (d.y * height) / 100)
        .attr('r', d => Math.min(d.radius, 20));
      
      points.exit().remove();
      
      // Update labels with data join
      const labels = svg.selectAll('.label')
        .data(products, d => d.id);
      
      labels.enter()
        .append('text')
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .merge(labels)
        .attr('x', d => (d.x * width) / 100)
        .attr('y', d => (d.y * height) / 100 + 3)
        .text(d => d.orders);
      
      labels.exit().remove();
      
    } catch (error) {
      console.error('Voronoi rendering error:', error);
    }
  }, [syncData.products]);
  
  // Debounced visualization update
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      drawVisualization();
    });
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawVisualization]);
  
  const progress = (syncData.processedOrders / syncData.totalOrders) * 100;
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Zap size={24} className="text-purple-400" />
              </div>
              Sync Visualization Lab
            </h1>
            <p className="text-white/60 mt-1">Real-time order synchronization and product aggregation</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            
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
                  className="text-purple-500 transition-all duration-1000"
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
      <div className="flex-1 p-6 overflow-hidden">
        <div className="glass-card-large p-6 h-full">
          {/* Chart Container */}
          <div className="mb-6 relative">
            <div ref={voronoiRef} className="w-full h-[400px] relative bg-black/50 rounded-lg">
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
                <Loader size={16} className={`text-orange-400 ${!isPaused ? 'animate-spin' : ''}`} />
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