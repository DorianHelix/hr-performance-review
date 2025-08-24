import React from 'react';
import { Package, Plus, Upload, Download, Trash2, RefreshCw } from 'lucide-react';

function ProductHeader({ 
  products, 
  isImportedMode, 
  onAddNew, 
  onImport, 
  onExport, 
  onDeleteAll, 
  onRefresh 
}) {
  return (
    <header className="glass-card-large mb-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-white mb-2">
            <div className="glass-card p-2 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-600/20 border-blue-400/30">
              <Package size={24} className="text-blue-300" />
            </div>
            Products
          </h1>
          <p className="text-white/60 text-lg">
            {isImportedMode 
              ? `Manage ${products.length} imported products from Shopify`
              : `Manage ${products.length} products in your inventory`
            }
          </p>
        </div>
        
        <div className="flex gap-3">
          {!isImportedMode && (
            <button
              onClick={onAddNew}
              className="glass-button-primary px-4 py-2 flex items-center gap-2 transform hover:scale-105 transition-all"
            >
              <Plus size={18} />
              Add Product
            </button>
          )}
          
          <button
            onClick={onImport}
            className="glass-button px-4 py-2 flex items-center gap-2 transform hover:scale-105 transition-all"
          >
            <Upload size={18} />
            Import
          </button>
          
          <button
            onClick={onExport}
            className="glass-button px-4 py-2 flex items-center gap-2 transform hover:scale-105 transition-all"
          >
            <Download size={18} />
            Export
          </button>
          
          {products.length > 0 && (
            <button
              onClick={onDeleteAll}
              className="py-2 px-4 bg-red-900/80 hover:bg-red-800 text-white font-semibold rounded-xl transition-all transform hover:scale-105 flex items-center gap-2 border border-red-700/50"
            >
              <Trash2 size={18} />
              Delete All ({products.length})
            </button>
          )}
          
          {isImportedMode && (
            <button
              onClick={onRefresh}
              className="glass-button-primary px-4 py-2 flex items-center gap-2 transform hover:scale-105 transition-all"
            >
              <RefreshCw size={18} />
              Refresh from Shopify
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default ProductHeader;