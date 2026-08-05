import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, ArrowUp, ArrowDown, RefreshCw, 
  AlertTriangle, CheckCircle, Package, IndianRupee, History, AlertCircle
} from 'lucide-react';
import Card, { CardContent } from '../../components/Card';
import Button from '../../components/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Inventory = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State Management
  const [parts, setParts] = useState([]);
  const [totalParts, setTotalParts] = useState(0);
  const [metrics, setMetrics] = useState({
    totalParts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalInventoryValue: 0
  });
  const [history, setHistory] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('recentlyUpdated');
  
  // Pagination
  const [partsPage, setPartsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const limit = 5;

  // Modals
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedPartForStock, setSelectedPartForStock] = useState(null);

  // Modal Forms
  const [partForm, setPartForm] = useState({
    partNo: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    minStock: 0,
    category: ''
  });

  const [stockForm, setStockForm] = useState({
    quantity: 0,
    type: 'INCREASE',
    reason: ''
  });

  // Fetch Parts & Metrics
  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Parts with search, filter, sorting, pagination
      const partsRes = await api.get('/inventory', {
        params: {
          search: searchTerm || undefined,
          category: categoryFilter || undefined,
          sort: sortBy,
          page: partsPage,
          limit
        }
      });
      if (partsRes.data.success) {
        setParts(partsRes.data.data.parts || []);
        setTotalParts(partsRes.data.data.total || 0);
      }

      // 2. Fetch Metrics
      const metricsRes = await api.get('/inventory/metrics');
      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data);
      }

      // 3. Fetch Stock History
      const historyRes = await api.get('/inventory/history', {
        params: {
          page: historyPage,
          limit
        }
      });
      if (historyRes.data.success) {
        setHistory(historyRes.data.data.history || []);
        setHistoryTotal(historyRes.data.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      setError('Could not fetch inventory assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [searchTerm, categoryFilter, sortBy, partsPage, historyPage]);

  // Handle Part Create/Update
  const handlePartSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingPart) {
        res = await api.patch(`/inventory/${editingPart.id}`, partForm);
      } else {
        res = await api.post('/inventory', partForm);
      }

      if (res.data.success) {
        setPartModalOpen(false);
        setEditingPart(null);
        resetPartForm();
        fetchInventoryData();
      }
    } catch (err) {
      console.error('Failed to save spare part:', err);
      alert(err.response?.data?.message || 'Error occurred while saving part.');
    }
  };

  // Handle Stock Adjustment
  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartForStock) return;
    try {
      const res = await api.post(`/inventory/${selectedPartForStock.id}/adjust`, stockForm);
      if (res.data.success) {
        setStockModalOpen(false);
        setSelectedPartForStock(null);
        setStockForm({ quantity: 0, type: 'INCREASE', reason: '' });
        fetchInventoryData();
      }
    } catch (err) {
      console.error('Failed to adjust stock:', err);
      alert(err.response?.data?.message || 'Error occurred during stock adjustment.');
    }
  };

  // Handle Soft Delete
  const handleDeletePart = async (id) => {
    if (!window.confirm('Are you sure you want to remove this spare part from the catalog?')) return;
    try {
      const res = await api.delete(`/inventory/${id}`);
      if (res.data.success) {
        fetchInventoryData();
      }
    } catch (err) {
      console.error('Failed to delete part:', err);
      alert(err.response?.data?.message || 'Error deleting spare part.');
    }
  };

  const resetPartForm = () => {
    setPartForm({
      partNo: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
      minStock: 0,
      category: ''
    });
  };

  const openEditModal = (part) => {
    setEditingPart(part);
    setPartForm({
      partNo: part.partNo,
      name: part.name,
      description: part.description || '',
      price: part.price,
      stock: part.stock,
      minStock: part.minStock,
      category: part.category
    });
    setPartModalOpen(true);
  };

  const openStockModal = (part) => {
    setSelectedPartForStock(part);
    setStockModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Inventory Management</h1>
          <p className="text-gray-400">Monitor stock levels, allocate repairs parts, and audit ledger history.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchInventoryData}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white p-3 rounded-xl transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {isAdmin && (
            <Button onClick={() => { resetPartForm(); setEditingPart(null); setPartModalOpen(true); }} className="flex items-center gap-2">
              <Plus size={18} /> Register Spare Part
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Catalog</p>
              <h3 className="text-2xl font-bold text-white">{metrics.totalParts} Parts</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Package size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className={metrics.lowStockCount > 0 ? 'border-accent-amber/50 bg-accent-amber/5' : ''}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Low Stock Warning</p>
              <h3 className="text-2xl font-bold text-white">{metrics.lowStockCount} Items</h3>
            </div>
            <div className={`p-3.5 rounded-xl ${metrics.lowStockCount > 0 ? 'bg-accent-amber/20 text-accent-amber' : 'bg-white/5 text-gray-400'}`}>
              <AlertTriangle size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className={metrics.outOfStockCount > 0 ? 'border-accent-red/50 bg-accent-red/5' : ''}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Out of Stock</p>
              <h3 className="text-2xl font-bold text-white">{metrics.outOfStockCount} Items</h3>
            </div>
            <div className={`p-3.5 rounded-xl ${metrics.outOfStockCount > 0 ? 'bg-accent-red/20 text-accent-red' : 'bg-white/5 text-gray-400'}`}>
              <AlertCircle size={22} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Inventory Value</p>
              <h3 className="text-2xl font-bold text-white">₹{metrics.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
              <IndianRupee size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Parts Catalog & Sidebar Widgets */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Parts Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white">Parts Inventory Catalog</h3>
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPartsPage(1); }}
                    className="bg-charcoal-900 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-red w-48"
                    placeholder="Search catalog..."
                  />
                </div>
                {/* Category Filter */}
                <select 
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPartsPage(1); }}
                  className="bg-charcoal-900 border border-white/10 text-gray-300 py-2 px-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-red"
                >
                  <option value="">All Categories</option>
                  <option value="Engine Parts">Engine Parts</option>
                  <option value="Brake Parts">Brake Parts</option>
                  <option value="Filters">Filters</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Body Parts">Body Parts</option>
                </select>
                {/* Sorting */}
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-charcoal-900 border border-white/10 text-gray-300 py-2 px-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-red"
                >
                  <option value="recentlyUpdated">Recently Updated</option>
                  <option value="name">Name</option>
                  <option value="stock">Stock Level</option>
                  <option value="price">Price</option>
                </select>
              </div>
            </div>
            
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Part Number</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium text-right">Unit Price</th>
                    <th className="p-4 font-medium text-center">Stock</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                  {parts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">No parts found matching criteria.</td>
                    </tr>
                  ) : (
                    parts.map(part => {
                      const isOutOfStock = part.stock === 0;
                      const isLowStock = part.stock <= part.minStock && part.stock > 0;
                      
                      return (
                        <tr key={part.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-white">{part.partNo}</td>
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-white">{part.name}</div>
                              {part.description && <div className="text-xs text-gray-500 truncate max-w-xs">{part.description}</div>}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                              {part.category}
                            </span>
                          </td>
                          <td className="p-4 text-right font-medium text-white">₹{part.price.toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                isOutOfStock ? 'bg-red-500/20 text-red-400' :
                                isLowStock ? 'bg-amber-500/20 text-amber-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {part.stock} / {part.minStock} (Min)
                              </span>
                              {isOutOfStock && <span className="text-[10px] text-red-400 mt-1 font-bold">Out of Stock</span>}
                              {isLowStock && <span className="text-[10px] text-amber-400 mt-1 font-bold">Low Stock Warning</span>}
                            </div>
                          </td>
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            <button 
                              onClick={() => openStockModal(part)}
                              className="text-xs bg-white/5 hover:bg-white/10 text-white px-2.5 py-1.5 rounded-lg border border-white/10 transition-all"
                            >
                              Adjust Stock
                            </button>
                            {isAdmin && (
                              <>
                                <button 
                                  onClick={() => openEditModal(part)}
                                  className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all inline-flex align-middle"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeletePart(part.id)}
                                  className="text-red-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all inline-flex align-middle"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
            
            {/* Pagination Controls */}
            {totalParts > limit && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between">
                <button
                  disabled={partsPage === 1}
                  onClick={() => setPartsPage(p => Math.max(1, p - 1))}
                  className="bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 transition-all"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500">Page {partsPage} of {Math.ceil(totalParts / limit)}</span>
                <button
                  disabled={partsPage * limit >= totalParts}
                  onClick={() => setPartsPage(p => p + 1)}
                  className="bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* History Audit Logs */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <History size={18} className="text-accent-red" />
              <h3 className="font-semibold text-white">Stock Audit History</h3>
            </div>
            <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">No adjustments logged yet.</div>
              ) : (
                history.map((log) => {
                  const isPositive = log.type === 'INCREASE' || (log.type === 'ADJUST' && log.quantity > 0);
                  
                  return (
                    <div key={log.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 text-xs relative overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white font-mono">{log.part.partNo}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                          log.type === 'INCREASE' ? 'bg-green-500/10 text-green-400' :
                          log.type === 'DECREASE' ? 'bg-red-500/10 text-red-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {log.type} ({log.quantity})
                        </span>
                      </div>
                      <p className="text-gray-400 font-medium">{log.part.name}</p>
                      <p className="text-gray-500 italic">"{log.reason}"</p>
                      <div className="flex justify-between text-[10px] text-gray-600 border-t border-white/5 pt-2">
                        <span>By: {log.user?.name || 'System'}</span>
                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
            
            {/* History Pagination */}
            {historyTotal > limit && (
              <div className="p-3 border-t border-white/5 flex items-center justify-between">
                <button
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  className="bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white text-[10px] px-2 py-1.5 rounded-lg border border-white/10 transition-all"
                >
                  Prev
                </button>
                <span className="text-[10px] text-gray-500">Page {historyPage} of {Math.ceil(historyTotal / limit)}</span>
                <button
                  disabled={historyPage * limit >= historyTotal}
                  onClick={() => setHistoryPage(p => p + 1)}
                  className="bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white text-[10px] px-2 py-1.5 rounded-lg border border-white/10 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Part Form Modal (Create/Edit) */}
      <AnimatePresence>
        {partModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-charcoal-800 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-xl font-bold text-white border-b border-white/5 pb-2">
                {editingPart ? `Edit Spare Part: ${editingPart.partNo}` : 'Register New Spare Part'}
              </h3>
              
              <form onSubmit={handlePartSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Part Number</label>
                    <input 
                      type="text" 
                      value={partForm.partNo}
                      onChange={(e) => setPartForm({ ...partForm, partNo: e.target.value })}
                      className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-accent-red text-sm"
                      placeholder="e.g. SM-SPK-100"
                      required
                      disabled={!!editingPart} // PartNo shouldn't be edited once registered
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Part Name</label>
                    <input 
                      type="text" 
                      value={partForm.name}
                      onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                      className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-accent-red text-sm"
                      placeholder="Platinum Spark Plug"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
                  <textarea 
                    value={partForm.description}
                    onChange={(e) => setPartForm({ ...partForm, description: e.target.value })}
                    className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-1 focus:ring-accent-red text-sm h-20"
                    placeholder="Provide details about specs, vehicle compatibility..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                    <select 
                      value={partForm.category}
                      onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                      className="w-full bg-charcoal-900 border border-white/10 text-white py-2.5 px-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-red"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Engine Parts">Engine Parts</option>
                      <option value="Brake Parts">Brake Parts</option>
                      <option value="Filters">Filters</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Body Parts">Body Parts</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Unit Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={partForm.price}
                      onChange={(e) => setPartForm({ ...partForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-accent-red text-sm"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Initial Stock Count</label>
                    <input 
                      type="number" 
                      value={partForm.stock}
                      onChange={(e) => setPartForm({ ...partForm, stock: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-accent-red text-sm"
                      min="0"
                      required
                      disabled={!!editingPart} // Stock should be adjusted via adjustStock modal
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Low Stock Alert Min</label>
                    <input 
                      type="number" 
                      value={partForm.minStock}
                      onChange={(e) => setPartForm({ ...partForm, minStock: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-accent-red text-sm"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setPartModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Spare Part</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {stockModalOpen && selectedPartForStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-charcoal-800 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-xl font-bold text-white border-b border-white/5 pb-2">
                Adjust Stock: {selectedPartForStock.name}
              </h3>
              <p className="text-xs text-gray-400">Current Stock Level: <span className="font-mono text-white font-bold">{selectedPartForStock.stock} units</span></p>
              
              <form onSubmit={handleStockSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Adjustment Type</label>
                  <select 
                    value={stockForm.type}
                    onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })}
                    className="w-full bg-charcoal-900 border border-white/10 text-white py-2.5 px-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-red"
                    required
                  >
                    <option value="INCREASE">Restock (INCREASE)</option>
                    <option value="DECREASE">Deduct (DECREASE)</option>
                    <option value="ADJUST">Overwrite (ADJUST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-accent-red text-sm"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Reason / Notes</label>
                  <input 
                    type="text" 
                    value={stockForm.reason}
                    onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                    className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-accent-red text-sm"
                    placeholder="e.g. Restock shipment #1043"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                  <Button type="button" variant="secondary" onClick={() => { setStockModalOpen(false); setSelectedPartForStock(null); }}>Cancel</Button>
                  <Button type="submit">Submit Adjustment</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
