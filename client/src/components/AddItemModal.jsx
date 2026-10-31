import React, { useState, useEffect } from 'react';
import { X, Calendar, Package, Tag, DollarSign, MapPin, CheckCircle2 } from 'lucide-react';

export default function AddItemModal({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  userId,
  categories,
}) {
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Dairy & Eggs',
    quantity: 10,
    unit: 'units',
    expiryDate: '',
    costPrice: 5.0,
    storageLocation: 'Cold Vault A-1',
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setFormData({
        itemName: editItem.itemName || '',
        category: editItem.category || 'Dairy & Eggs',
        quantity: editItem.quantity || 1,
        unit: editItem.unit || 'units',
        expiryDate: editItem.expiryDate ? editItem.expiryDate.split('T')[0] : '',
        costPrice: editItem.costPrice || 0,
        storageLocation: editItem.storageLocation || 'Cold Vault A-1',
        notes: editItem.notes || '',
      });
    } else {
      // Default to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setFormData({
        itemName: '',
        category: 'Medicines & Pharma',
        quantity: 15,
        unit: 'units',
        expiryDate: defaultDate.toISOString().split('T')[0],
        costPrice: 8.5,
        storageLocation: 'Pharmacy Shelf B-3',
        notes: '',
      });
    }
    setError('');
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handlePresetDate = (daysOffset) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    setFormData((prev) => ({
      ...prev,
      expiryDate: target.toISOString().split('T')[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemName.trim()) {
      setError('Item name is required');
      return;
    }
    if (!formData.expiryDate) {
      setError('Expiration date is required for perishable tracking');
      return;
    }

    const payload = {
      ...formData,
      userId,
      quantity: Number(formData.quantity),
      costPrice: Number(formData.costPrice),
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {editItem ? 'Edit Perishable Item' : 'Add New Inventory Item'}
            </h3>
            <p className="modal-subtitle">
              Schema validated by Mongoose & automatically indexed into B-Tree tables
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close modal">
            <X size={18} />
          </button>
        </div>

        {error && <div className="modal-error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Item Name */}
            <div className="form-group span-2">
              <label className="form-label">Item Name *</label>
              <div className="input-with-icon">
                <Package size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="e.g. Paracetamol 650mg Tabs, Organic Whole Milk..."
                  className="input-field"
                />
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Unit */}
            <div className="form-group">
              <label className="form-label">Quantity & Unit *</label>
              <div className="quantity-inputs-row">
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="input-field qty-input"
                />
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="input-field unit-input"
                >
                  <option value="units">units</option>
                  <option value="strips">strips</option>
                  <option value="boxes">boxes</option>
                  <option value="bottles">bottles</option>
                  <option value="packs">packs</option>
                  <option value="kg">kg</option>
                  <option value="liters">liters</option>
                </select>
              </div>
            </div>

            {/* Expiration Date with quick testing presets */}
            <div className="form-group span-2">
              <div className="label-with-presets">
                <label className="form-label">Expiration Date *</label>
                <div className="quick-presets">
                  <span className="preset-label">Quick Test Presets:</span>
                  <button
                    type="button"
                    onClick={() => handlePresetDate(-2)}
                    className="preset-btn preset-danger"
                    title="Set date to 2 days ago"
                  >
                    -2d (Expired)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetDate(2)}
                    className="preset-btn preset-warning"
                    title="Set date to 2 days ahead"
                  >
                    +2d (Critical)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetDate(6)}
                    className="preset-btn preset-alert"
                    title="Set date to 6 days ahead"
                  >
                    +6d (Expiring)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetDate(45)}
                    className="preset-btn preset-safe"
                    title="Set date to 45 days ahead"
                  >
                    +45d (Fresh)
                  </button>
                </div>
              </div>
              <div className="input-with-icon">
                <Calendar size={16} className="input-icon" />
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Unit Cost Price */}
            <div className="form-group">
              <label className="form-label">Unit Cost ($)</label>
              <div className="input-with-icon">
                <DollarSign size={16} className="input-icon" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Storage Location */}
            <div className="form-group">
              <label className="form-label">Storage Location</label>
              <div className="input-with-icon">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  placeholder="e.g. Cold Vault A-1, Shelf B-3"
                  className="input-field"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group span-2">
              <label className="form-label">Notes / Storage Instructions</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional batch notes or vendor tracking..."
                className="input-field"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>{editItem ? 'Save Changes' : 'Add to Inventory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
