import React, { useState, useEffect } from 'react';
import { X, Save, Upload, FileText, AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';

export function AddEditProductModal({ 
  isOpen, 
  onClose, 
  onSave, 
  product = null 
}) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    minStock: '',
    status: 'active',
    supplier: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        minStock: product.minStock || '',
        status: product.status || 'active',
        supplier: product.supplier || ''
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        minStock: '',
        status: 'active',
        supplier: ''
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 10
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card-large rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
                placeholder="SKU-123"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
              placeholder="Electronics, Clothing, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
              placeholder="Product description..."
              rows="3"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Stock *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Min Stock
              </label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-white bg-white/5"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
                placeholder="Supplier name"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="glass-button px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glass-button-primary px-4 py-2 flex items-center gap-2"
            >
              <Save size={18} />
              {product ? 'Update' : 'Create'} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ImportProductsModal({ 
  isOpen, 
  onClose, 
  onImport 
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      
      Papa.parse(selectedFile, {
        complete: (result) => {
          if (result.data && result.data.length > 0) {
            setPreview(result.data.slice(0, 5));
          }
        },
        header: true,
        skipEmptyLines: true
      });
    }
  };

  const handleImport = () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    Papa.parse(file, {
      complete: (result) => {
        if (result.data && result.data.length > 0) {
          onImport(result.data);
          onClose();
        } else {
          setError('No valid data found in file');
        }
      },
      header: true,
      skipEmptyLines: true
    });
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Sample Product',
        sku: 'SKU-001',
        category: 'Electronics',
        description: 'Product description',
        price: '99.99',
        stock: '100',
        minStock: '10',
        status: 'active',
        supplier: 'Supplier Name'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card-large rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Import Products</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-4 border-l-4 border-blue-400/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-400 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-white mb-1">Import Instructions</h3>
                <p className="text-sm text-white/60">
                  Upload a CSV file with product data. The file should include columns for:
                  name, sku, category, description, price, stock, minStock, status, and supplier.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Download size={14} />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Select CSV File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex items-center justify-center gap-3 w-full p-8 glass-card border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors"
              >
                <Upload size={24} className="text-white/60" />
                <div>
                  <p className="text-white font-medium">
                    {file ? file.name : 'Click to upload CSV file'}
                  </p>
                  <p className="text-sm text-white/40">or drag and drop</p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-400/20 border border-red-400/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Preview (First 5 rows)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {Object.keys(preview[0]).map(key => (
                        <th key={key} className="text-left p-2 text-white/60">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-b border-white/5">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="p-2 text-white/80">
                            {value || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="glass-button px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file}
              className="glass-button-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={18} />
              Import Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}