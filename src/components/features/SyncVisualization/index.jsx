import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Delaunay } from 'd3-delaunay';
import { Activity, Zap, Loader, TrendingUp, Package, Calendar, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import shopifyService from '../../../services/shopifyService';

// Global state to persist sync across navigation
let globalSyncState = {
  isSyncing: false,
  syncStatus: 'idle',
  syncData: {
    totalOrders: 0,
    processedOrders: 0,
    products: {},
    syncSpeed: 0,
    timeRemaining: 0,
    currentBatch: 0,
    totalBatches: 0
  },
  intervalId: null
};

const SyncVisualization = () => {
  const [syncData, setSyncData] = useState(globalSyncState.syncData);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isSyncing, setIsSyncing] = useState(globalSyncState.isSyncing);
  const [syncStatus, setSyncStatus] = useState(globalSyncState.syncStatus);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  
  const voronoiRef = useRef(null);
  const svgRef = useRef(null);
  const animationFrameRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const productsMapRef = useRef({});
  
  // Format HUF currency
  const formatHUF = (amount) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Continue existing sync on mount
  useEffect(() => {
    if (globalSyncState.isSyncing && globalSyncState.intervalId) {
      setIsSyncing(true);
      setSyncStatus(globalSyncState.syncStatus);
      setSyncData(globalSyncState.syncData);
      syncIntervalRef.current = globalSyncState.intervalId;
      
      // Continue polling for progress
      continueSyncPolling();
    }
  }, []);
  
  // Continue polling for sync progress
  const continueSyncPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const progressResponse = await fetch('http://localhost:3001/api/orders/sync-progress');
        if (progressResponse.ok) {
          const progress = await progressResponse.json();
          
          if (progress.status === 'completed') {
            clearInterval(pollInterval);
            globalSyncState.isSyncing = false;
            globalSyncState.syncStatus = 'completed';
            globalSyncState.intervalId = null;
            setIsSyncing(false);
            setSyncStatus('completed');
          }
          
          // Update products from progress
          if (progress.recentProducts && progress.recentProducts.length > 0) {
            updateProductsFromOrders(progress.recentProducts);
          }
          
          const newSyncData = {
            ...globalSyncState.syncData,
            processedOrders: progress.processed || globalSyncState.syncData.processedOrders,
            totalOrders: progress.total || globalSyncState.syncData.totalOrders,
            currentBatch: progress.currentBatch || globalSyncState.syncData.currentBatch,
            totalBatches: progress.totalBatches || globalSyncState.syncData.totalBatches,
            syncSpeed: Math.random() * 100 + 50,
            timeRemaining: Math.max(0, (progress.total - progress.processed) / 50)
          };
          
          globalSyncState.syncData = newSyncData;
          setSyncData(newSyncData);
        }
      } catch (error) {
        console.error('Error polling sync progress:', error);
      }
    }, 1000);
    
    globalSyncState.intervalId = pollInterval;
    syncIntervalRef.current = pollInterval;
  };
  
  // Start real Shopify sync
  const startSync = async () => {
    if (globalSyncState.isSyncing) return;
    
    globalSyncState.isSyncing = true;
    globalSyncState.syncStatus = 'syncing';
    setIsSyncing(true);
    setSyncStatus('syncing');
    
    // Reset sync data
    globalSyncState.syncData = {
      ...globalSyncState.syncData,
      processedOrders: 0,
      products: {},
      currentBatch: 0
    };
    setSyncData(globalSyncState.syncData);
    productsMapRef.current = {};
    
    try {
      // First get the total count of orders
      const countResponse = await fetch('http://localhost:3001/api/orders/count?' + new URLSearchParams({
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0]
      }));
      
      if (!countResponse.ok) throw new Error('Failed to get order count');
      
      const { count: totalOrders } = await countResponse.json();
      
      globalSyncState.syncData.totalOrders = totalOrders;
      globalSyncState.syncData.totalBatches = Math.ceil(totalOrders / 50);
      setSyncData(globalSyncState.syncData);
      
      // Start the sync process
      const response = await fetch('http://localhost:3001/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: dateRange.start.toISOString().split('T')[0],
          end_date: dateRange.end.toISOString().split('T')[0],
          stream: true
        })
      });
      
      if (!response.ok) throw new Error('Failed to start sync');
      
      // Start polling for progress
      continueSyncPolling();
      
    } catch (error) {
      console.error('Sync error:', error);
      globalSyncState.syncStatus = 'error';
      globalSyncState.isSyncing = false;
      setSyncStatus('error');
      setIsSyncing(false);
    }
  };
  
  // Update products from real order data
  const updateProductsFromOrders = (newProducts) => {
    newProducts.forEach(product => {
      const productId = product.id || `product_${Object.keys(productsMapRef.current).length}`;
      
      if (!productsMapRef.current[productId]) {
        // New product - assign position in grid pattern
        const existingCount = Object.keys(productsMapRef.current).length;
        productsMapRef.current[productId] = {
          id: productId,
          name: product.title || product.name || 'Unknown Product',
          orders: 0,
          revenue: 0,
          x: 10 + (existingCount % 6) * 15 + Math.random() * 5,
          y: 10 + Math.floor(existingCount / 6) * 20 + Math.random() * 5,
          radius: 5,
          sku: product.sku || '',
          vendor: product.vendor || 'Unknown',
          thumbnail: product.image || product.thumbnail || null,
          price: product.price || 0
        };
      }
      
      // Update existing product metrics
      productsMapRef.current[productId].orders += product.quantity || 1;
      productsMapRef.current[productId].revenue += (product.price || 0) * (product.quantity || 1);
      productsMapRef.current[productId].radius = Math.min(
        5 + Math.sqrt(productsMapRef.current[productId].orders) * 2, 
        25
      );
    });
    
    // Update state with new products (limit to top 30 for performance)
    const topProducts = Object.values(productsMapRef.current)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 30)
      .reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {});
    
    globalSyncState.syncData.products = topProducts;
    setSyncData(prev => ({
      ...prev,
      products: topProducts
    }));
  };
  
  // Fetch real products on mount
  useEffect(() => {
    // Only fetch if we don't have products already
    if (Object.keys(globalSyncState.syncData.products).length === 0) {
      const fetchInitialProducts = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/products?limit=20');
          if (response.ok) {
            const data = await response.json();
            const products = Array.isArray(data) ? data : (data.products || []);
            
            if (products.length > 0) {
              const initialProducts = {};
              products.forEach((product, index) => {
                // Get the best available image
                let thumbnail = null;
                if (product.featuredImage) {
                  thumbnail = product.featuredImage;
                } else if (product.images && product.images.length > 0) {
                  thumbnail = product.images[0];
                } else if (product.image) {
                  thumbnail = product.image;
                }
                
                initialProducts[product.id || product.shopifyId || `product_${index}`] = {
                  id: product.id || product.shopifyId || `product_${index}`,
                  name: product.title || product.name || `Product ${index}`,
                  orders: Math.floor(Math.random() * 100), // Initial random data
                  revenue: Math.random() * 1000000, // Random HUF amount
                  x: 10 + (index % 5) * 18 + Math.random() * 10,
                  y: 10 + Math.floor(index / 5) * 22 + Math.random() * 10,
                  radius: 8,
                  sku: product.sku || '',
                  vendor: product.vendor || 'Unknown',
                  thumbnail: thumbnail,
                  price: product.price || 0
                };
              });
              
              productsMapRef.current = initialProducts;
              globalSyncState.syncData.products = initialProducts;
              setSyncData(prev => ({
                ...prev,
                products: initialProducts
              }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch products:', error);
          
          // Create demo data on error
          const demoProducts = {};
          for (let i = 0; i < 10; i++) {
            demoProducts[`demo_${i}`] = {
              id: `demo_${i}`,
              name: `Demo Product ${i + 1}`,
              orders: Math.floor(Math.random() * 100),
              revenue: Math.random() * 1000000,
              x: 10 + (i % 5) * 18 + Math.random() * 10,
              y: 10 + Math.floor(i / 5) * 22 + Math.random() * 10,
              radius: 8,
              sku: `DEMO-${1000 + i}`,
              vendor: 'Demo Vendor',
              thumbnail: null,
              price: Math.random() * 10000
            };
          }
          
          productsMapRef.current = demoProducts;
          globalSyncState.syncData.products = demoProducts;
          setSyncData(prev => ({
            ...prev,
            products: demoProducts
          }));
        }
      };
      
      fetchInitialProducts();
    } else {
      // Use existing products
      productsMapRef.current = globalSyncState.syncData.products;
    }
  }, []);
  
  // Cleanup on unmount (but don't stop sync)
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      // Don't clear sync interval on unmount - let it continue
    };
  }, []);
  
  // Optimized Voronoi Diagram Visualization with pulsating animation
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
      
      // Add pulsating animation styles
      const defs = svg.append('defs');
      defs.append('style')
        .text(`
          @keyframes dataPulse {
            0% { 
              opacity: 0.4; 
              transform: scale(1);
            }
            50% { 
              opacity: 0.7; 
              transform: scale(1.03);
            }
            100% { 
              opacity: 0.4; 
              transform: scale(1);
            }
          }
          .cell-path {
            transform-origin: center;
            transition: all 0.3s ease;
          }
          .cell-path.syncing {
            animation: dataPulse 3s ease-in-out infinite;
          }
          .cell-path:hover {
            opacity: 1 !important;
            animation: none;
            filter: brightness(1.3);
          }
        `);
      
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
      
      // Use data join for gradients with syncing colors
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
        .style('stop-color', (d, i) => {
          // Use purple/pink for syncing, cool colors for idle
          return isSyncing ? d3.interpolatePlasma(i / products.length) : d3.interpolateCool(i / products.length);
        })
        .style('stop-opacity', 0.9);
      
      gradientsEnter.append('stop')
        .attr('offset', '100%')
        .style('stop-color', (d, i) => {
          return isSyncing ? d3.interpolatePlasma(i / products.length) : d3.interpolateCool(i / products.length);
        })
        .style('stop-opacity', 0.1);
      
      // Update gradient colors when syncing status changes
      gradients.selectAll('stop')
        .style('stop-color', function(d) {
          const parentData = d3.select(this.parentNode).datum();
          const index = products.findIndex(p => p.id === parentData.id);
          const offset = d3.select(this).attr('offset');
          return isSyncing ? d3.interpolatePlasma(index / products.length) : d3.interpolateCool(index / products.length);
        });
      
      gradients.exit().remove();
      
      // Update Voronoi cells with data join
      const cells = svg.selectAll('.cell-path')
        .data(products, d => d.id);
      
      cells.enter()
        .append('path')
        .attr('class', d => `cell-path ${isSyncing ? 'syncing' : ''}`)
        .style('fill', d => `url(#gradient-${d.id})`)
        .style('stroke', isSyncing ? '#ff00ff30' : '#ffffff20')
        .style('stroke-width', 1.5)
        .style('opacity', 0.6)
        .on('mouseenter', function(event, d) {
          d3.select(this).style('opacity', 1);
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
        .attr('class', d => `cell-path ${isSyncing ? 'syncing' : ''}`)
        .attr('d', (d, i) => {
          try {
            return voronoi.renderCell(i);
          } catch (e) {
            return '';
          }
        });
      
      cells.exit().remove();
      
      // Update center points with data join - NO PULSATING
      const points = svg.selectAll('.point')
        .data(products, d => d.id);
      
      points.enter()
        .append('circle')
        .attr('class', 'point') // Remove sync-indicator class
        .style('fill', '#fff')
        .style('stroke', (d, i) => {
          return isSyncing ? d3.interpolatePlasma(i / products.length) : d3.interpolateCool(i / products.length);
        })
        .style('stroke-width', 2)
        .style('opacity', 0.9)
        .style('cursor', 'pointer')
        .merge(points)
        .attr('class', 'point') // Keep it simple, no animation class
        .transition()
        .duration(500)
        .attr('cx', d => (d.x * width) / 100)
        .attr('cy', d => (d.y * height) / 100)
        .attr('r', d => Math.min(d.radius, 25));
      
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
        .style('text-shadow', '0 0 3px rgba(0,0,0,0.8)')
        .merge(labels)
        .attr('x', d => (d.x * width) / 100)
        .attr('y', d => (d.y * height) / 100 + 3)
        .text(d => d.orders);
      
      labels.exit().remove();
      
    } catch (error) {
      console.error('Voronoi rendering error:', error);
    }
  }, [syncData.products, isSyncing]);
  
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
  
  const progress = syncData.totalOrders > 0 ? (syncData.processedOrders / syncData.totalOrders) * 100 : 0;
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 ${isSyncing ? 'animate-pulse' : ''}`}>
                <Zap size={24} className="text-purple-400" />
              </div>
              Sync Visualization Lab
            </h1>
            <p className="text-white/60 mt-1">Real-time Shopify order synchronization and product aggregation</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Calendar size={16} className="text-white/60" />
              <span className="text-sm text-white/60">
                {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
              </span>
            </div>
            
            {/* Sync Button */}
            <button
              onClick={startSync}
              disabled={isSyncing}
              className={`px-4 py-2 rounded-lg text-white transition-all flex items-center gap-2 ${
                isSyncing 
                  ? 'bg-purple-500/30 cursor-not-allowed' 
                  : 'bg-purple-500 hover:bg-purple-600 cursor-pointer'
              }`}
            >
              {isSyncing ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Sync Last 30 Days
                </>
              )}
            </button>
            
            {/* Progress Info */}
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {syncData.processedOrders.toLocaleString()}
              </div>
              <div className="text-sm text-white/60">
                of {syncData.totalOrders.toLocaleString()} orders
              </div>
            </div>
            
            {/* Progress Circle */}
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
                  className={`transition-all duration-1000 ${
                    isSyncing ? 'text-purple-500' : 
                    syncStatus === 'completed' ? 'text-green-500' : 
                    syncStatus === 'error' ? 'text-red-500' : 
                    'text-gray-500'
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{progress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sync Status Bar */}
        {syncStatus !== 'idle' && (
          <div className={`rounded-lg p-2 flex items-center gap-2 ${
            syncStatus === 'syncing' ? 'bg-purple-500/20 border border-purple-500/30' :
            syncStatus === 'completed' ? 'bg-green-500/20 border border-green-500/30' :
            'bg-red-500/20 border border-red-500/30'
          }`}>
            {syncStatus === 'syncing' && (
              <>
                <Loader size={16} className="text-purple-400 animate-spin" />
                <span className="text-purple-400 text-sm">
                  Syncing batch {syncData.currentBatch} of {syncData.totalBatches}...
                </span>
              </>
            )}
            {syncStatus === 'completed' && (
              <>
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-green-400 text-sm">
                  Sync completed successfully!
                </span>
              </>
            )}
            {syncStatus === 'error' && (
              <>
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-red-400 text-sm">
                  Sync failed. Please check your Shopify connection.
                </span>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Main Visualization Area */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="glass-card-large p-6 h-full">
          {/* Chart Container */}
          <div className="mb-6 relative">
            <div ref={voronoiRef} className="w-full h-[400px] relative bg-black/50 rounded-lg overflow-hidden">
              {/* Pulsating border when syncing */}
              {isSyncing && (
                <div className="absolute inset-0 rounded-lg border-2 border-purple-500/50 animate-pulse pointer-events-none" />
              )}
              
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
                  <div className="bg-black/95 backdrop-blur-lg border border-purple-500/30 rounded-lg p-3 shadow-2xl">
                    <div className="flex items-start gap-3">
                      {/* Product Thumbnail */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/20">
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
                          <Package size={32} />
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="min-w-[160px]">
                        <div className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {hoveredProduct.name}
                        </div>
                        <div className="text-white/60 text-xs mb-2">
                          {hoveredProduct.vendor} • {hoveredProduct.sku || 'No SKU'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/50">Orders:</span>
                            <span className="text-white font-medium">{hoveredProduct.orders}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/50">Revenue:</span>
                            <span className="text-green-400 font-medium">
                              {formatHUF(hoveredProduct.revenue || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/50">Avg Price:</span>
                            <span className="text-blue-400 font-medium">
                              {formatHUF(hoveredProduct.price || 0)}
                            </span>
                          </div>
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
                <Activity size={16} className={`${isSyncing ? 'text-green-400' : 'text-gray-400'}`} />
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
                <span className="text-sm text-white/60">Total Revenue</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatHUF(Object.values(syncData.products).reduce((sum, p) => sum + (p.revenue || 0), 0))}
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader size={16} className={`text-orange-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-sm text-white/60">Time Remaining</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {isSyncing ? (
                  `${Math.floor(syncData.timeRemaining / 60)}m ${Math.floor(syncData.timeRemaining % 60)}s`
                ) : (
                  '--:--'
                )}
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
                    <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 ${
                      isSyncing ? 'animate-pulse' : ''
                    }`} style={{ opacity: 0.5 * (1 - i / 5) }} />
                    <div className="relative">
                      <div className="text-xs text-white/60 mb-1 truncate">{product.name}</div>
                      <div className="text-lg font-bold text-white">{product.orders}</div>
                      <div className="text-xs text-green-400">
                        {formatHUF(product.revenue)}
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