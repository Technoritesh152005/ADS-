import React from 'react';
import { Search, Filter, ArrowUpDown, PlusCircle, Trash2, Edit3, Calendar, MapPin, Tag } from 'lucide-react';

export default function InventoryTable({
  items,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  sortOrder,
  onSortChange,
  onRestock,
  onDelete,
  onEdit,
}) {
  const getDaysUntilExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (item) => {
    const days = getDaysUntilExpiry(item.expiryDate);

    if (days < 0) {
      return (
        <span className="badge badge-expired">
          Expired {Math.abs(days)}d ago
        </span>
      );
    }
    if (days <= 3) {
      return (
        <span className="badge badge-critical">
          Expires in {days} {days === 1 ? 'day' : 'days'}
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="badge badge-warning">
          Expires in {days} days
        </span>
      );
    }
    if (item.quantity < 5) {
      return (
        <span className="badge badge-warning">
          Low Stock ({item.quantity})
        </span>
      );
    }
    return (
      <span className="badge badge-healthy">
        Fresh ({days}d left)
      </span>
    );
  };

  return (
    <div className="inventory-section glass-panel">
      {/* Controls Bar: Search, Category, Status, Sort */}
      <div className="table-controls-wrapper">
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            id="input-inventory-search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items by name (e.g., Amoxicillin, Milk, Yogurt)..."
            className="input-field search-input"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="clear-search-btn"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          <div className="filter-group">
            <Filter size={15} className="filter-icon" />
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="input-field select-filter"
            >
              <option value="all">All Health Statuses</option>
              <option value="expired">Expired Only</option>
              <option value="expiring_soon">Expiring Soon (≤ 7 Days)</option>
              <option value="low_stock">Low Stock (&lt; 5 Units)</option>
              <option value="healthy">Healthy / Safe Inventory</option>
            </select>
          </div>

          <div className="filter-group">
            <ArrowUpDown size={15} className="filter-icon" />
            <select
              id="select-sort-by"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                onSortChange(sb, so);
              }}
              className="input-field select-filter"
            >
              <option value="expiryDate-asc">Expiry Date (Earliest First)</option>
              <option value="expiryDate-desc">Expiry Date (Latest First)</option>
              <option value="quantity-asc">Quantity (Lowest First)</option>
              <option value="quantity-desc">Quantity (Highest First)</option>
              <option value="costPrice-desc">Unit Cost (Highest First)</option>
              <option value="itemName-asc">Item Name (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-pills-row">
        <button
          onClick={() => onSelectCategory('All')}
          className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Name & Batch</th>
              <th>Category</th>
              <th>Stock Level</th>
              <th>Expiration Date</th>
              <th>Location</th>
              <th>Unit Cost</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-table-cell">
                  <div className="empty-state">
                    <Search size={32} className="text-dim" />
                    <h4>No inventory items match your query</h4>
                    <p>Try resetting filters or adding new items.</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isLow = item.quantity < 5;
                const formattedDate = new Date(item.expiryDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <tr key={item._id} className="table-row-hover">
                    {/* Item Name & Batch */}
                    <td>
                      <div className="item-name-cell">
                        <span className="item-name">{item.itemName}</span>
                        <span className="item-batch mono">{item.batchNumber}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="category-tag">
                        <Tag size={12} />
                        {item.category}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td>
                      <div className="quantity-cell">
                        <span className={`quantity-number ${isLow ? 'text-low-stock' : ''}`}>
                          {item.quantity}
                        </span>
                        <span className="quantity-unit">{item.unit}</span>
                      </div>
                    </td>

                    {/* Expiry Date */}
                    <td>
                      <div className="expiry-cell">
                        <span className="expiry-date-text">
                          <Calendar size={13} className="text-muted" />
                          {formattedDate}
                        </span>
                      </div>
                    </td>

                    {/* Storage Location */}
                    <td>
                      <span className="location-text">
                        <MapPin size={13} className="text-dim" />
                        {item.storageLocation || 'Warehouse'}
                      </span>
                    </td>

                    {/* Cost */}
                    <td>
                      <span className="mono cost-text">
                        ${(item.costPrice || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td>{getStatusBadge(item)}</td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="table-actions">
                        <button
                          onClick={() => onRestock(item._id, 10)}
                          className="action-icon-btn btn-action-restock"
                          title="Restock +10 units (MongoDB $inc)"
                        >
                          <PlusCircle size={15} />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="action-icon-btn btn-action-edit"
                          title="Edit item details"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(item._id)}
                          className="action-icon-btn btn-action-delete"
                          title="Delete / Discard item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer-bar">
        <span className="text-muted text-sm">
          Showing <strong>{items.length}</strong> items • Indexed B-Tree Sort Active
        </span>
      </div>
    </div>
  );
}
