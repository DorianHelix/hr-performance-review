import React, { useState } from 'react';
import {
  Package, ChevronDown, ChevronRight, Layers, AlertTriangle,
  Settings, Trash2, Plus, Upload, FileDown
} from 'lucide-react';
import { TruncatedTooltip } from './LiquidTooltip';

// Sample data based on the CSV structure
const SAMPLE_PRODUCTS = [
  {
    id: 'prod-1',
    handle: 'gerincbarat-anatomiai-parna',
    name: 'Gerincbarát Anatómiai Párna Ergonomikus Kialakítással',
    category: 'Health & Beauty',
    status: 'active',
    totalStock: 45,
    hasVariants: true,
    variants: [
      {
        id: 'var-1-1',
        variant_name: '1 darab',
        variant_sku: 'GAPEK-001-1',
        variant_price: 22999,
        cost_per_item: 12000,
        stock: 20
      },
      {
        id: 'var-1-2',
        variant_name: '2 darab',
        variant_sku: 'GAPEK-001-2',
        variant_price: 44999,
        cost_per_item: 24000,
        stock: 15
      },
      {
        id: 'var-1-3',
        variant_name: '3 darab',
        variant_sku: 'GAPEK-001-3',
        variant_price: 59999,
        cost_per_item: 36000,
        stock: 10
      }
    ]
  },
  {
    id: 'prod-2',
    handle: 'homecare-zip-tapasz',
    name: 'HomeCare Zip Állítható Sebzáró Tapasz Szett',
    category: 'Medical Supplies',
    status: 'active',
    totalStock: 150,
    hasVariants: true,
    variants: [
      {
        id: 'var-2-1',
        variant_name: '1 szett',
        variant_sku: 'HCZIP-001-1',
        variant_price: 6999,
        cost_per_item: 2600,
        stock: 75
      },
      {
        id: 'var-2-2',
        variant_name: '2 szett',
        variant_sku: 'HCZIP-001-2',
        variant_price: 12499,
        cost_per_item: 5200,
        stock: 50
      },
      {
        id: 'var-2-3',
        variant_name: '3 szett',
        variant_sku: 'HCZIP-001-3',
        variant_price: 16999,
        cost_per_item: 7800,
        stock: 25
      }
    ]
  },
  {
    id: 'prod-3',
    handle: 'bodyguide-pod-merleg',
    name: 'BodyGuide Pod Teljes-test elemző okosmérleg',
    category: 'Health & Beauty',
    status: 'draft',
    totalStock: 8,
    hasVariants: false,
    variants: [],
    sku: 'BODYPO-DR-0183',
    price: 45999,
    cost_per_item: 15000,
    stock: 8
  },
  {
    id: 'prod-4',
    handle: 'comfytoes-labujj',
    name: 'ComfyToes Lábujjkiegyenesítő és Bütyök Korrektor',
    category: 'Foot Care',
    status: 'active',
    totalStock: 5,
    hasVariants: true,
    variants: [
      {
        id: 'var-4-1',
        variant_name: '1 pár',
        variant_sku: 'COMFY-001-1',
        variant_price: 6999,
        cost_per_item: 1631,
        stock: 3
      },
      {
        id: 'var-4-2',
        variant_name: '2 pár',
        variant_sku: 'COMFY-001-2',
        variant_price: 12999,
        cost_per_item: 3262,
        stock: 2
      },
      {
        id: 'var-4-3',
        variant_name: '3 pár',
        variant_sku: 'COMFY-001-3',
        variant_price: 16999,
        cost_per_item: 4893,
        stock: 0
      }
    ]
  }
];

function ProductVariantsDemo() {
  const [expandedProducts, setExpandedProducts] = useState({});
  const [products] = useState(SAMPLE_PRODUCTS);

  const toggleExpand = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Calculate stats
  const totalProducts = products.length;
  const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
  const totalStock = products.reduce((sum, p) => sum + p.totalStock, 0);
  const lowStockCount = products.filter(p => p.totalStock < 10).length;

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="glass-card-large p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <Package size={24} className="text-purple-300" />
              Product Variants UI Demo
            </h1>
            <p className="text-white/60">Showing how Shopify products with variants will be displayed</p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4">
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold text-white">{totalProducts}</div>
              <div className="text-xs text-white/60">Products</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold text-purple-400">{totalVariants}</div>
              <div className="text-xs text-white/60">Variants</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-400">{totalStock}</div>
              <div className="text-xs text-white/60">Total Stock</div>
            </div>
            {lowStockCount > 0 && (
              <div className="glass-card p-4 rounded-xl border-orange-500/30">
                <div className="text-2xl font-bold text-orange-400">{lowStockCount}</div>
                <div className="text-xs text-white/60">Low Stock</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card-large overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-white/70 font-medium w-10"></th>
              <th className="text-left p-4 text-white/70 font-medium">Product / Variant</th>
              <th className="text-left p-4 text-white/70 font-medium">SKU</th>
              <th className="text-left p-4 text-white/70 font-medium">Category</th>
              <th className="text-right p-4 text-white/70 font-medium">Sale Price</th>
              <th className="text-right p-4 text-white/70 font-medium">Cost</th>
              <th className="text-right p-4 text-white/70 font-medium">Stock</th>
              <th className="text-left p-4 text-white/70 font-medium">Status</th>
              <th className="text-center p-4 text-white/70 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <React.Fragment key={prod.id}>
                {/* Main Product Row */}
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    {prod.hasVariants && (
                      <button
                        onClick={() => toggleExpand(prod.id)}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                      >
                        {expandedProducts[prod.id] ? (
                          <ChevronDown size={16} className="text-white/60" />
                        ) : (
                          <ChevronRight size={16} className="text-white/60" />
                        )}
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-3">
                      {prod.hasVariants && (
                        <div className="mt-1">
                          <Layers size={16} className="text-purple-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <TruncatedTooltip content={prod.name} variant="default">
                          <div className="font-medium text-white truncate">
                            {prod.name}
                          </div>
                        </TruncatedTooltip>
                        <div className="text-xs text-white/40 mt-1">
                          Handle: {prod.handle}
                        </div>
                        {prod.hasVariants && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-purple-400">
                              {prod.variants.length} variants
                            </span>
                            {expandedProducts[prod.id] && (
                              <span className="text-xs text-white/30">
                                (click row to collapse)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-white/60 font-mono">
                      {prod.hasVariants ? (
                        <span className="text-white/30">Multiple</span>
                      ) : (
                        prod.sku || 'N/A'
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {prod.category && (
                      <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs">
                        {prod.category}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-white font-medium">
                      {prod.hasVariants ? (
                        <span className="text-white/50">Various</span>
                      ) : (
                        `${(prod.price || 0).toLocaleString()} Ft`
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-white/60">
                      {prod.hasVariants ? (
                        <span className="text-white/30">Various</span>
                      ) : (
                        `${(prod.cost_per_item || 0).toLocaleString()} Ft`
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={`font-medium flex items-center justify-end gap-2 ${
                      prod.totalStock < 10 ? 'text-orange-400' : 'text-white'
                    }`}>
                      <span>{prod.totalStock || prod.stock || 0}</span>
                      {prod.totalStock < 10 && prod.totalStock > 0 && (
                        <AlertTriangle size={14} className="text-orange-400" />
                      )}
                      {prod.totalStock === 0 && (
                        <span className="text-red-400 text-xs">Out</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs ${
                      prod.status === 'active' 
                        ? 'bg-green-500/20 text-green-300'
                        : prod.status === 'draft'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {prod.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-white/10 transition-colors">
                        <Settings size={14} className="text-white/70" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-500/20 transition-colors">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Variant Rows (when expanded) */}
                {expandedProducts[prod.id] && prod.variants.map((variant, idx) => (
                  <tr 
                    key={variant.id} 
                    className={`border-b border-white/5 bg-black/20 hover:bg-white/5 transition-colors ${
                      idx === prod.variants.length - 1 ? 'border-b-2 border-white/10' : ''
                    }`}
                  >
                    <td className="p-4"></td>
                    <td className="p-4 pl-14">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60"></div>
                        <div>
                          <div className="text-sm text-white/80">
                            {variant.variant_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-white/50 font-mono">
                        {variant.variant_sku || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white/20 text-xs">Inherited</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-white/80 text-sm">
                        {(variant.variant_price || 0).toLocaleString()} Ft
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-white/60 text-sm">
                        {(variant.cost_per_item || 0).toLocaleString()} Ft
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className={`text-sm font-medium ${
                        variant.stock < 10 ? 'text-orange-400' : 'text-white/80'
                      }`}>
                        {variant.stock || 0}
                        {variant.stock === 0 && (
                          <span className="ml-2 text-red-400 text-xs">Out</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white/20 text-xs">-</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <button className="p-1 rounded hover:bg-white/10 opacity-50 hover:opacity-100 transition-all">
                          <Settings size={12} className="text-white/50" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-purple-400" />
          <span>Product has variants</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60"></div>
          <span>Variant row</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-orange-400" />
          <span>Low stock warning</span>
        </div>
      </div>
    </div>
  );
}

export default ProductVariantsDemo;