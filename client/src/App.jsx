import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import LiveAlertsBanner from './components/LiveAlertsBanner';
import InventoryTable from './components/InventoryTable';
import AddItemModal from './components/AddItemModal';
import ExplainBenchmarkModal from './components/ExplainBenchmarkModal';
import SeedModal from './components/SeedModal';
import Toast from './components/Toast';
import { api } from './utils/api';

const CATEGORIES = [
  'Dairy & Eggs',
  'Bakery',
  'Medicines & Pharma',
  'Produce & Fruits',
  'Meat & Seafood',
  'Pantry & Canned',
  'Beverages',
  'Personal Care',
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('expiryDate');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'success' });
    }, 4000);
  };

  // 1. Initial User Fetch
  useEffect(() => {
    async function initUser() {
      try {
        const res = await api.getUsers();
        if (res.data && res.data.length > 0) {
          setCurrentUser(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to load user info:', err);
      }
    }
    initUser();
  }, []);

  // 2. Fetch Aggregation Metrics & Live Alerts
  const fetchAnalytics = useCallback(async () => {
    try {
      const [metricsRes, alertsRes] = await Promise.all([
        api.getMetrics(currentUser?._id),
        api.getLiveAlerts(currentUser?._id),
      ]);
      setMetrics(metricsRes.data);
      setAlerts(alertsRes.data || []);
    } catch (err) {
      console.error('Failed to load summary metrics:', err);
    }
  }, [currentUser]);

  // 3. Fetch Items with current filters
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getItems({
        userId: currentUser?._id,
        category: selectedCategory,
        search: searchQuery,
        status: statusFilter,
        sortBy,
        sortOrder,
      });
      setItems(res.data || []);
    } catch (err) {
      showToast(err.message || 'Error loading inventory', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedCategory, searchQuery, statusFilter, sortBy, sortOrder]);

  // Trigger loads on mount and when filters/user change
  useEffect(() => {
    fetchAnalytics();
    fetchItems();
  }, [fetchAnalytics, fetchItems]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleSaveItem = async (formData) => {
    try {
      if (editingItem) {
        await api.updateItem(editingItem._id, formData);
        showToast(`Updated "${formData.itemName}" successfully!`, 'success');
      } else {
        const payload = {
          ...formData,
          userId: currentUser?._id || formData.userId,
        };
        await api.createItem(payload);
        showToast(`Added "${formData.itemName}" to inventory!`, 'success');
      }
      setIsAddModalOpen(false);
      await fetchItems();
      await fetchAnalytics();
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
      throw err;
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product from inventory?')) {
      return;
    }
    try {
      await api.deleteItem(id);
      showToast('Product removed from inventory', 'info');
      fetchItems();
      fetchAnalytics();
    } catch (err) {
      showToast(err.message || 'Failed to remove product', 'error');
    }
  };

  const handleQuickRestock = async (id, amount = 10) => {
    try {
      await api.quickRestock(id, amount);
      showToast(`Restocked +${amount} units!`, 'success');
      fetchItems();
      fetchAnalytics();
    } catch (err) {
      showToast(err.message || 'Failed to restock product', 'error');
    }
  };

  const handleSeedData = async (count, clearExisting) => {
    try {
      const res = await api.seedData(count, clearExisting);
      showToast(res.message || `Loaded ${res.count} products!`, 'success');
      fetchItems();
      fetchAnalytics();
    } catch (err) {
      showToast(err.message || 'Failed to load sample products', 'error');
    }
  };

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onOpenAddModal={handleOpenAdd}
        onOpenExplainModal={() => setIsExplainModalOpen(true)}
        onOpenSeedModal={() => setIsSeedModalOpen(true)}
        totalItems={items.length}
      />

      <main className="container">
        {/* Clean Dashboard Stats Cards */}
        <DashboardStats
          metrics={metrics}
          activeStatusFilter={statusFilter}
          onSelectStatusFilter={(filterId) => setStatusFilter(filterId)}
        />

        {/* Attention Needed Banner */}
        <LiveAlertsBanner
          alerts={alerts}
          onRestock={handleQuickRestock}
          onDelete={handleDeleteItem}
        />

        {/* Main Product Inventory Table */}
        <InventoryTable
          items={items}
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          statusFilter={statusFilter}
          onStatusChange={(s) => setStatusFilter(s)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
          }}
          onRestock={handleQuickRestock}
          onDelete={handleDeleteItem}
          onEdit={handleOpenEdit}
        />
      </main>

      {/* Add / Edit Product Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSaveItem}
        editItem={editingItem}
        userId={currentUser?._id}
        categories={CATEGORIES}
      />

      {/* Performance & Index Test Modal */}
      <ExplainBenchmarkModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        onDataChanged={() => {
          fetchItems();
          fetchAnalytics();
        }}
        onShowToast={showToast}
      />

      {/* Sample Data Modal */}
      <SeedModal
        isOpen={isSeedModalOpen}
        onClose={() => setIsSeedModalOpen(false)}
        onSeed={handleSeedData}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
