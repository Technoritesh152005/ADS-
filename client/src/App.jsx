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
        console.error('Failed to initialize user session:', err);
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
      console.error('Failed to load DB aggregation metrics:', err);
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

  // Trigger loads when user or filters change
  useEffect(() => {
    if (currentUser) {
      fetchAnalytics();
      fetchItems();
    }
  }, [currentUser, fetchAnalytics, fetchItems]);

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
        await api.createItem(formData);
        showToast(`Added "${formData.itemName}" to inventory!`, 'success');
      }
      setIsAddModalOpen(false);
      fetchItems();
      fetchAnalytics();
    } catch (err) {
      showToast(err.message || 'Failed to save item', 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to discard / write off this perishable item?')) {
      return;
    }
    try {
      await api.deleteItem(id);
      showToast('Item successfully removed from database', 'info');
      fetchItems();
      fetchAnalytics();
    } catch (err) {
      showToast(err.message || 'Failed to delete item', 'error');
    }
  };

  const handleQuickRestock = async (id, amount = 10) => {
    try {
      await api.quickRestock(id, amount);
      showToast(`Restocked +${amount} units via MongoDB $inc operator!`, 'success');
      fetchItems();
      fetchAnalytics();
    } catch (err) {
      showToast(err.message || 'Failed to restock item', 'error');
    }
  };

  const handleSeedData = async (count, clearExisting) => {
    try {
      const res = await api.seedData(count, clearExisting);
      showToast(res.message || `Populated ${res.count} items!`, 'success');
      fetchItems();
      fetchAnalytics();
    } catch (err) {
      showToast(err.message || 'Failed to seed database', 'error');
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
        {/* MongoDB $facet Metrics Cards */}
        <DashboardStats
          metrics={metrics}
          activeStatusFilter={statusFilter}
          onSelectStatusFilter={(filterId) => setStatusFilter(filterId)}
        />

        {/* MongoDB $match + $addFields Live Alerts Banner */}
        <LiveAlertsBanner
          alerts={alerts}
          onRestock={handleQuickRestock}
          onDelete={handleDeleteItem}
        />

        {/* Main Perishable Inventory Table */}
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

      {/* Add / Edit Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSaveItem}
        editItem={editingItem}
        userId={currentUser?._id}
        categories={CATEGORIES}
      />

      {/* Academic Query Plan Analyzer (EXPLAIN) Modal */}
      <ExplainBenchmarkModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        onDataChanged={() => {
          fetchItems();
          fetchAnalytics();
        }}
        onShowToast={showToast}
      />

      {/* Volume Seeder Modal */}
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
