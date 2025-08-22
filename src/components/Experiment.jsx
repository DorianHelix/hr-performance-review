import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Settings, Calendar, DollarSign, 
  Target, Beaker, ChevronRight, X, 
  Save, Edit2, Trash2, Clock, TrendingUp,
  BarChart3, Check, AlertCircle, Filter,
  Search, ChevronDown, Palette, Layers, Activity
} from 'lucide-react';
import DateRangePicker from './DateRangePicker';
import SectionHeader from './SectionHeader';
import LiquidTooltip from './LiquidTooltip';
import API from '../api';

// Platform icons as SVG components
const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const INITIAL_TEST_TYPES = [
  { id: 'vct', name: 'Video Creative Test', shortName: 'VCT', color: '#60A5FA' },
  { id: 'sct', name: 'Static Creative Test', shortName: 'SCT', color: '#A78BFA' },
  { id: 'act', name: 'Ad Copy Test', shortName: 'ACT', color: '#34D399' }
];

const INITIAL_PLATFORMS = [
  { id: 'meta', name: 'Meta', iconComponent: FacebookIcon },
  { id: 'google', name: 'Google', iconComponent: GoogleIcon },
  { id: 'tiktok', name: 'TikTok', iconComponent: TikTokIcon }
];

const TEST_STATUSES = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  RUNNING: 'running',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const STATUS_COLORS = {
  draft: '#9CA3AF',
  scheduled: '#60A5FA',
  running: '#34D399',
  completed: '#A78BFA',
  cancelled: '#EF4444'
};

function Experiment() {
  const [tests, setTests] = useState(() => {
    const saved = localStorage.getItem('experiment_tests');
    return saved ? JSON.parse(saved) : [];
  });

  const [testTypes, setTestTypes] = useState(() => {
    const saved = localStorage.getItem('experiment_test_types');
    return saved ? JSON.parse(saved) : INITIAL_TEST_TYPES;
  });

  const [platforms, setPlatforms] = useState(() => {
    const saved = localStorage.getItem('experiment_platforms');
    return saved ? JSON.parse(saved) : INITIAL_PLATFORMS;
  });

  const [products, setProducts] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState({ start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
  const [ganttColorMode, setGanttColorMode] = useState('type'); // 'type', 'status', 'platform'

  const [newTest, setNewTest] = useState({
    id: null,
    name: '',
    type: '',
    platform: '',
    product: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    budget: '',
    adIds: [],
    winnerAdId: '',
    hypothesis: '',
    status: TEST_STATUSES.DRAFT,
    createdAt: new Date()
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('experiment_tests', JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem('experiment_test_types', JSON.stringify(testTypes));
  }, [testTypes]);

  useEffect(() => {
    localStorage.setItem('experiment_platforms', JSON.stringify(platforms));
  }, [platforms]);

  const fetchProducts = async () => {
    try {
      const response = await API.getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([
        { id: 1, name: 'Sample Product 1', sku: 'SKU001' },
        { id: 2, name: 'Sample Product 2', sku: 'SKU002' }
      ]);
    }
  };

  const handleSaveTest = () => {
    if (!newTest.name || !newTest.type || !newTest.platform || !newTest.product || !newTest.budget) {
      alert('Please fill all required fields');
      return;
    }

    const testToSave = {
      ...newTest,
      id: editingTest ? editingTest.id : Date.now().toString(),
      updatedAt: new Date()
    };

    if (editingTest) {
      setTests(prev => prev.map(t => t.id === editingTest.id ? testToSave : t));
    } else {
      setTests(prev => [...prev, testToSave]);
    }

    setShowTestForm(false);
    setEditingTest(null);
    resetTestForm();
  };

  const resetTestForm = () => {
    setNewTest({
      id: null,
      name: '',
      type: '',
      platform: '',
      product: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      budget: '',
      adIds: [],
      winnerAdId: '',
      hypothesis: '',
      status: TEST_STATUSES.DRAFT,
      createdAt: new Date()
    });
  };

  const handleDeleteTest = (testId) => {
    if (confirm('Are you sure you want to delete this test?')) {
      setTests(prev => prev.filter(t => t.id !== testId));
    }
  };

  const handleEditTest = (test) => {
    setEditingTest(test);
    setNewTest(test);
    setShowTestForm(true);
  };

  const updateTestStatus = (testId, newStatus) => {
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: newStatus, updatedAt: new Date() } : t
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TEST_STATUSES.DRAFT: return 'text-gray-400';
      case TEST_STATUSES.SCHEDULED: return 'text-blue-400';
      case TEST_STATUSES.RUNNING: return 'text-green-400';
      case TEST_STATUSES.COMPLETED: return 'text-purple-400';
      case TEST_STATUSES.CANCELLED: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case TEST_STATUSES.DRAFT: return 'bg-gray-500/20 text-gray-300';
      case TEST_STATUSES.SCHEDULED: return 'bg-blue-500/20 text-blue-300';
      case TEST_STATUSES.RUNNING: return 'bg-green-500/20 text-green-300';
      case TEST_STATUSES.COMPLETED: return 'bg-purple-500/20 text-purple-300';
      case TEST_STATUSES.CANCELLED: return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = !searchQuery || 
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.platform.toLowerCase().includes(searchQuery.toLowerCase());
      
      const testStart = new Date(test.startDate);
      const testEnd = new Date(test.endDate);
      const rangeStart = new Date(selectedDateRange.start);
      const rangeEnd = new Date(selectedDateRange.end);
      
      const matchesDateRange = (testStart <= rangeEnd && testEnd >= rangeStart);
      
      return matchesSearch && matchesDateRange;
    });
  }, [tests, searchQuery, selectedDateRange]);

  return (
    <div className="min-h-screen w-full">
      <div className="p-8">
        <SectionHeader 
          title="Experiments"
          subtitle="A/B Testing & Campaign Management"
          icon={Beaker}
        />

        {/* Gantt Chart Section */}
        <div className="mb-8">
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Test Timeline
              </h3>
              <div className="flex items-center gap-4">
                <DateRangePicker
                  startDate={selectedDateRange.start}
                  endDate={selectedDateRange.end}
                  onStartDateChange={(date) => setSelectedDateRange(prev => ({ ...prev, start: date }))}
                  onEndDateChange={(date) => setSelectedDateRange(prev => ({ ...prev, end: date }))}
                />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input pl-10 pr-4 py-2 rounded-xl w-64"
                  />
                </div>
                
                {/* Color Mode Selector */}
                <div className="flex items-center gap-2 glass-card px-3 py-1 rounded-xl">
                  <button
                    onClick={() => setGanttColorMode('type')}
                    className={`p-2 rounded-lg transition-all ${ganttColorMode === 'type' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}
                    title="Color by Type"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGanttColorMode('status')}
                    className={`p-2 rounded-lg transition-all ${ganttColorMode === 'status' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}
                    title="Color by Status"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGanttColorMode('platform')}
                    className={`p-2 rounded-lg transition-all ${ganttColorMode === 'platform' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}
                    title="Color by Platform"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowConfigModal(true)}
                  className="glass-button p-2 rounded-xl"
                  title="Configuration"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Custom Gantt Chart */}
            <GanttChart 
              tests={filteredTests}
              testTypes={testTypes}
              platforms={platforms}
              dateRange={selectedDateRange}
              colorMode={ganttColorMode}
            />
          </div>
        </div>

        {/* Test Form Section */}
        <div className="mb-8">
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                {editingTest ? 'Edit Test' : 'Create New Test'}
              </h3>
              {!showTestForm && (
                <button
                  onClick={() => setShowTestForm(true)}
                  className="glass-button px-4 py-2 rounded-xl flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30"
                >
                  <Plus className="w-4 h-4" />
                  New Test
                </button>
              )}
            </div>

            {showTestForm && (
              <TestForm
                test={newTest}
                setTest={setNewTest}
                testTypes={testTypes}
                platforms={platforms}
                products={products}
                onSave={handleSaveTest}
                onCancel={() => {
                  setShowTestForm(false);
                  setEditingTest(null);
                  resetTestForm();
                }}
                isEditing={!!editingTest}
              />
            )}
          </div>
        </div>

        {/* Tests Table Section */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Active Tests
            </h3>
            <TestsTable
              tests={filteredTests}
              testTypes={testTypes}
              platforms={platforms}
              products={products}
              onEdit={handleEditTest}
              onDelete={handleDeleteTest}
              onStatusChange={updateTestStatus}
              getStatusColor={getStatusColor}
              getStatusBadge={getStatusBadge}
            />
          </div>
        </div>

        {/* Configuration Modal */}
        {showConfigModal && (
          <ConfigModal
            testTypes={testTypes}
            setTestTypes={setTestTypes}
            platforms={platforms}
            setPlatforms={setPlatforms}
            onClose={() => setShowConfigModal(false)}
          />
        )}
      </div>
    </div>
  );
}

function GanttChart({ tests, testTypes, platforms, dateRange, colorMode }) {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const today = new Date();
  const todayOffset = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
  
  const dayWidth = 40;
  const rowHeight = 60;

  const getTestPosition = (test) => {
    const testStart = new Date(test.startDate);
    const testEnd = new Date(test.endDate);
    
    const startOffset = Math.max(0, Math.ceil((testStart - startDate) / (1000 * 60 * 60 * 24)));
    const duration = Math.ceil((testEnd - testStart) / (1000 * 60 * 60 * 24));
    
    return {
      left: startOffset * dayWidth,
      width: duration * dayWidth,
      visible: testEnd >= startDate && testStart <= endDate
    };
  };

  const getColor = (test) => {
    switch (colorMode) {
      case 'status':
        return STATUS_COLORS[test.status] || '#60A5FA';
      case 'platform':
        const platformColors = {
          meta: '#1877F2',
          google: '#4285F4',
          tiktok: '#000000'
        };
        return platformColors[test.platform] || '#60A5FA';
      case 'type':
      default:
        const type = testTypes.find(t => t.id === test.type);
        return type?.color || '#60A5FA';
    }
  };

  const days = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div className="relative overflow-x-auto">
      <div className="min-w-max">
        {/* Timeline Header */}
        <div className="flex border-b border-white/10 mb-4">
          <div className="w-48 px-4 py-2 text-sm text-gray-400">Test Name</div>
          <div className="flex relative">
            {days.map((day, index) => (
              <div key={index} className="text-center text-xs text-gray-400" style={{ width: `${dayWidth}px` }}>
                <div className={index === todayOffset ? 'text-blue-400 font-bold' : ''}>{day.getDate()}</div>
                {day.getDate() === 1 && (
                  <div className="text-xs">{day.toLocaleDateString('en', { month: 'short' })}</div>
                )}
              </div>
            ))}
            {/* Today line */}
            {todayOffset >= 0 && todayOffset <= totalDays && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10"
                style={{ left: `${todayOffset * dayWidth + dayWidth / 2}px` }}
              />
            )}
          </div>
        </div>

        {/* Test Rows */}
        <div className="space-y-2">
          {tests.map((test) => {
            const position = getTestPosition(test);
            const platform = platforms.find(p => p.id === test.platform);
            const testType = testTypes.find(t => t.id === test.type);
            const PlatformIcon = platform?.iconComponent;
            
            if (!position.visible) return null;

            return (
              <div key={test.id} className="flex items-center" style={{ height: `${rowHeight}px` }}>
                <div className="w-48 px-4 text-sm truncate">{test.name}</div>
                <div className="relative flex-1" style={{ height: `${rowHeight - 10}px` }}>
                  <div
                    className="absolute top-1 rounded-xl p-2 text-xs text-white shadow-lg transition-all hover:scale-105 cursor-pointer"
                    style={{
                      left: `${position.left}px`,
                      width: `${position.width}px`,
                      background: `linear-gradient(135deg, ${getColor(test)}, ${getColor(test)}DD)`,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div className="flex items-center gap-2">
                        {PlatformIcon && <PlatformIcon />}
                        <span className="font-semibold">
                          {colorMode === 'type' && testType?.shortName}
                          {colorMode === 'status' && test.status.toUpperCase()}
                          {colorMode === 'platform' && platform?.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{test.budget} Ft</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TestForm({ test, setTest, testTypes, platforms, products, onSave, onCancel, isEditing }) {
  const [adIdInput, setAdIdInput] = useState('');
  const [bulkAdIds, setBulkAdIds] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const handleAddAdId = () => {
    if (adIdInput && test.adIds.length < 50) {
      setTest(prev => ({
        ...prev,
        adIds: [...prev.adIds, adIdInput]
      }));
      setAdIdInput('');
    }
  };

  const handleBulkAddAdIds = () => {
    const ids = bulkAdIds.split(/[\n,]/).map(id => id.trim()).filter(id => id);
    const uniqueIds = [...new Set([...test.adIds, ...ids])].slice(0, 50);
    setTest(prev => ({
      ...prev,
      adIds: uniqueIds
    }));
    setBulkAdIds('');
    setShowBulkInput(false);
  };

  const handleRemoveAdId = (index) => {
    setTest(prev => ({
      ...prev,
      adIds: prev.adIds.filter((_, i) => i !== index),
      winnerAdId: prev.adIds[index] === prev.winnerAdId ? '' : prev.winnerAdId
    }));
  };

  const handleSetWinner = (adId) => {
    setTest(prev => ({
      ...prev,
      winnerAdId: prev.winnerAdId === adId ? '' : adId
    }));
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Test Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Test Name *</label>
          <input
            type="text"
            value={test.name}
            onChange={(e) => setTest(prev => ({ ...prev, name: e.target.value }))}
            className="glass-input w-full px-4 py-3 rounded-xl"
            placeholder="Enter test name..."
          />
        </div>

        {/* Test Type - Liquid Glass Style */}
        <div>
          <label className="block text-sm font-medium mb-2">Test Type *</label>
          <div className="relative">
            <select
              value={test.type}
              onChange={(e) => setTest(prev => ({ ...prev, type: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-xl appearance-none pr-10 cursor-pointer backdrop-blur-md bg-white/5 border border-white/20 hover:bg-white/10 transition-all"
            >
              <option value="" className="bg-gray-900">Select type...</option>
              {testTypes.map(type => (
                <option key={type.id} value={type.id} className="bg-gray-900">{type.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Platform - With Logos */}
        <div>
          <label className="block text-sm font-medium mb-2">Platform *</label>
          <div className="relative">
            <select
              value={test.platform}
              onChange={(e) => setTest(prev => ({ ...prev, platform: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-xl appearance-none pr-10 cursor-pointer backdrop-blur-md bg-white/5 border border-white/20 hover:bg-white/10 transition-all"
            >
              <option value="" className="bg-gray-900">Select platform...</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id} className="bg-gray-900">
                  {platform.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Product with Search */}
        <div>
          <label className="block text-sm font-medium mb-2">Product *</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="glass-input w-full px-4 py-2 rounded-xl mb-2"
            />
            <select
              value={test.product}
              onChange={(e) => setTest(prev => ({ ...prev, product: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-xl appearance-none pr-10 cursor-pointer backdrop-blur-md bg-white/5 border border-white/20 hover:bg-white/10 transition-all"
              size={productSearch ? Math.min(5, filteredProducts.length + 1) : 1}
            >
              <option value="" className="bg-gray-900">Select product...</option>
              {filteredProducts.map(product => (
                <option key={product.id} value={product.id} className="bg-gray-900 py-2">
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Picker - Merged Start/End */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium mb-2">Test Duration *</label>
          <DateRangePicker
            startDate={test.startDate}
            endDate={test.endDate}
            onStartDateChange={(date) => setTest(prev => ({ ...prev, startDate: date }))}
            onEndDateChange={(date) => setTest(prev => ({ ...prev, endDate: date }))}
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium mb-2">Budget (Ft) *</label>
          <input
            type="number"
            value={test.budget}
            onChange={(e) => setTest(prev => ({ ...prev, budget: e.target.value }))}
            className="glass-input w-full px-4 py-3 rounded-xl"
            placeholder="Enter budget..."
          />
        </div>
      </div>

      {/* Ad IDs Section with Bulk Add */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">
            Ad IDs ({test.adIds.length}/50)
          </label>
          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showBulkInput ? 'Single Add' : 'Bulk Add'}
          </button>
        </div>

        {!showBulkInput ? (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={adIdInput}
              onChange={(e) => setAdIdInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddAdId()}
              className="glass-input flex-1 px-4 py-2 rounded-xl"
              placeholder="Enter Ad ID..."
              disabled={test.adIds.length >= 50}
            />
            <button
              onClick={handleAddAdId}
              disabled={!adIdInput || test.adIds.length >= 50}
              className="glass-button px-4 py-2 rounded-xl disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <textarea
              value={bulkAdIds}
              onChange={(e) => setBulkAdIds(e.target.value)}
              className="glass-input w-full px-4 py-2 rounded-xl"
              rows={4}
              placeholder="Enter Ad IDs (one per line or comma-separated)..."
            />
            <button
              onClick={handleBulkAddAdIds}
              className="glass-button px-4 py-2 rounded-xl"
            >
              Add All
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
          {test.adIds.map((adId, index) => (
            <div
              key={index}
              className={`glass-card p-2 rounded-lg flex items-center justify-between group ${
                test.winnerAdId === adId ? 'ring-2 ring-green-400' : ''
              }`}
            >
              <span className="text-xs truncate flex-1">{adId}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSetWinner(adId)}
                  className={`p-1 rounded ${
                    test.winnerAdId === adId ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                  }`}
                  title="Mark as winner hypothesis"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleRemoveAdId(index)}
                  className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Winner Selection */}
      {test.adIds.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Winner Hypothesis
          </label>
          <div className="glass-card p-4 rounded-xl">
            <select
              value={test.winnerAdId}
              onChange={(e) => setTest(prev => ({ ...prev, winnerAdId: e.target.value }))}
              className="glass-input w-full px-4 py-2 rounded-xl mb-3 appearance-none"
            >
              <option value="">No winner selected</option>
              {test.adIds.map(adId => (
                <option key={adId} value={adId}>{adId}</option>
              ))}
            </select>
            {test.winnerAdId && (
              <div className="text-sm text-green-400">
                ✓ Winner: {test.winnerAdId}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hypothesis */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Hypothesis
        </label>
        <textarea
          value={test.hypothesis}
          onChange={(e) => setTest(prev => ({ ...prev, hypothesis: e.target.value }))}
          className="glass-input w-full px-4 py-2 rounded-xl"
          rows={3}
          placeholder="Why do you think this ad will win?"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="glass-button px-6 py-2 rounded-xl"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="glass-button px-6 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30"
        >
          <Save className="w-4 h-4 mr-2" />
          {isEditing ? 'Update Test' : 'Create Test'}
        </button>
      </div>
    </div>
  );
}

function TestsTable({ tests, testTypes, platforms, products, onEdit, onDelete, onStatusChange, getStatusColor, getStatusBadge }) {
  const today = new Date();

  const getProgress = (test) => {
    const start = new Date(test.startDate);
    const end = new Date(test.endDate);
    
    if (today < start) return 0;
    if (today > end) return 100;
    
    const total = end - start;
    const elapsed = today - start;
    return Math.round((elapsed / total) * 100);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Platform</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Product</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Progress</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Budget</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tests.map(test => {
            const testType = testTypes.find(t => t.id === test.type);
            const platform = platforms.find(p => p.id === test.platform);
            const product = products.find(p => p.id === test.product);
            const PlatformIcon = platform?.iconComponent;
            const progress = getProgress(test);
            
            return (
              <tr key={test.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-medium">{test.name}</div>
                  <div className="text-xs text-gray-400">{test.adIds.length} ads</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: `${testType?.color}20`, color: testType?.color }}>
                    {testType?.shortName}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="flex items-center gap-2">
                    {PlatformIcon && <PlatformIcon />}
                    {platform?.name}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">{product?.name}</td>
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">
                      {new Date(test.startDate).toLocaleDateString()} - {new Date(test.endDate).toLocaleDateString()}
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: progress === 100 ? '#A78BFA' : '#60A5FA'
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">{progress}% complete</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{test.budget} Ft</td>
                <td className="py-3 px-4">
                  <select
                    value={test.status}
                    onChange={(e) => onStatusChange(test.id, e.target.value)}
                    className={`px-2 py-1 rounded-lg text-xs bg-transparent border border-white/20 ${getStatusBadge(test.status)}`}
                  >
                    {Object.entries(TEST_STATUSES).map(([key, value]) => (
                      <option key={value} value={value} className="bg-gray-900">
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(test)}
                      className="p-1 rounded hover:bg-white/10 text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(test.id)}
                      className="p-1 rounded hover:bg-white/10 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {tests.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Beaker className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tests found. Create your first test to get started.</p>
        </div>
      )}
    </div>
  );
}

function ConfigModal({ testTypes, setTestTypes, platforms, setPlatforms, onClose }) {
  const [activeTab, setActiveTab] = useState('types');
  const [newType, setNewType] = useState({ name: '', shortName: '', color: '#60A5FA' });
  const [newPlatform, setNewPlatform] = useState({ name: '', icon: '' });

  const handleAddType = () => {
    if (newType.name && newType.shortName) {
      setTestTypes(prev => [...prev, { ...newType, id: Date.now().toString() }]);
      setNewType({ name: '', shortName: '', color: '#60A5FA' });
    }
  };

  const handleRemoveType = (id) => {
    setTestTypes(prev => prev.filter(t => t.id !== id));
  };

  const handleAddPlatform = () => {
    if (newPlatform.name) {
      const iconMap = {
        'Facebook': FacebookIcon,
        'Meta': FacebookIcon,
        'Google': GoogleIcon,
        'TikTok': TikTokIcon
      };
      setPlatforms(prev => [...prev, { 
        ...newPlatform, 
        id: Date.now().toString(),
        iconComponent: iconMap[newPlatform.name] || null
      }]);
      setNewPlatform({ name: '', icon: '' });
    }
  };

  const handleRemovePlatform = (id) => {
    setPlatforms(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Configuration</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'types' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'
            }`}
          >
            Test Types
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'platforms' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'
            }`}
          >
            Platforms
          </button>
        </div>

        {activeTab === 'types' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Add Test Type</h3>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newType.name}
                  onChange={(e) => setNewType(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-input px-4 py-2 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Short Name"
                  value={newType.shortName}
                  onChange={(e) => setNewType(prev => ({ ...prev, shortName: e.target.value }))}
                  className="glass-input px-4 py-2 rounded-xl"
                />
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newType.color}
                    onChange={(e) => setNewType(prev => ({ ...prev, color: e.target.value }))}
                    className="glass-input rounded-xl w-12 h-10"
                  />
                  <button
                    onClick={handleAddType}
                    className="glass-button px-4 py-2 rounded-xl flex-1"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Current Test Types</h3>
              <div className="space-y-2">
                {testTypes.map(type => (
                  <div key={type.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: type.color }}></div>
                      <span className="font-medium">{type.name}</span>
                      <span className="text-sm text-gray-400">({type.shortName})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveType(type.id)}
                      className="p-1 rounded hover:bg-white/10 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'platforms' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Add Platform</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Platform Name (Facebook, Google, TikTok)"
                  value={newPlatform.name}
                  onChange={(e) => setNewPlatform(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-input px-4 py-2 rounded-xl"
                />
                <button
                  onClick={handleAddPlatform}
                  className="glass-button px-4 py-2 rounded-xl"
                >
                  Add Platform
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Current Platforms</h3>
              <div className="space-y-2">
                {platforms.map(platform => {
                  const PlatformIcon = platform.iconComponent;
                  return (
                    <div key={platform.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {PlatformIcon && <PlatformIcon />}
                        <span className="font-medium">{platform.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemovePlatform(platform.id)}
                        className="p-1 rounded hover:bg-white/10 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Experiment;