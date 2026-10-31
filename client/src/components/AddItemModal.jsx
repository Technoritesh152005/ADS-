import React, { useState, useEffect } from 'react';
import { X, Calendar, Package, Tag, DollarSign, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

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
    category: 'Produce & Fruits',
    quantity: 10,
    unit: 'units',
    expiryDate: '',
    costPrice: 5.0,
    storageLocation: 'Main Shelf',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setFormData({
        itemName: editItem.itemName || '',
        category: editItem.category || categories[0] || 'Produce & Fruits',
        quantity: editItem.quantity ?? 1,
        unit: editItem.unit || 'units',
        expiryDate: editItem.expiryDate ? editItem.expiryDate.split('T')[0] : '',
        costPrice: editItem.costPrice ?? 0,
        storageLocation: editItem.storageLocation || 'Main Shelf',
        notes: editItem.notes || '',
      });
    } else {
      // Default expiry date to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setFormData({
        itemName: '',
        category: categories[0] || 'Produce & Fruits',
        quantity: 10,
        unit: 'units',
        expiryDate: defaultDate.toISOString().split('T')[0],
        costPrice: 4.5,
        storageLocation: 'Main Shelf',
        notes: '',
      });
    }
    setError('');
    setSubmitting(false);
  }, [editItem, isOpen, categories]);

  if (!isOpen) return null;

  const handlePresetDate = (daysOffset) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    setFormData((prev) => ({
      ...prev,
      expiryDate: target.toISOString().split('T')[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName.trim()) {
      setError('Please provide a product name.');
      return;
    }
    if (!formData.expiryDate) {
      setError('Please select an expiration date.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        itemName: formData.itemName.trim(),
        category: formData.category,
        quantity: Number(formData.quantity) || 1,
        unit: formData.unit,
        expiryDate: new Date(formData.expiryDate).toISOString(),
        costPrice: Number(formData.costPrice) || 0,
        storageLocation: formData.storageLocation.trim() || 'Main Shelf',
        notes: formData.notes.trim(),
      };

      if (userId) {
        payload.userId = userId;
      }

      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {editItem ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="modal-subtitle">
              Enter product details and shelf-life to track freshness and stock
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close modal">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="modal-error-box">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Product Name */}
            <div className="form-group span-2">
              <label className="form-label">Product Name *</label>
              <div className="input-with-icon">
                <Package size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="e.g. Organic Whole Milk 1L, Paracetamol 500mg, Fresh Apples..."
                  className="input-field"
                  autoFocus
                />
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <div className="input-with-icon">
                <Tag size={16} className="input-icon" />
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
            </div>

            {/* Quantity & Unit */}
            <div className="form-group">
              <label className="form-label">Stock Quantity & Unit *</label>
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
                  <option value="packs">packs</option>
                  <option value="bottles">bottles</option>
                  <option value="boxes">boxes</option>
                  <option value="strips">strips</option>
                  <option value="kg">kg</option>
                  <option value="liters">liters</option>
                </select>
              </div>
            </div>

            {/* Expiration Date with quick presets */}
            <div className="form-group span-2">
              <div className="label-with-presets">
                <label className="form-label">Expiration Date *</label>
                <div className="quick-presets">
                  <span className="preset-label">Quick set:</span>
                  <button
                    type="button"
                    onClick={() => handlePresetDate(-2)}
                    className="preset-btn preset-danger"
                    title="Set to 2 days ago"
                  >
                    Expired (-2d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetDate(2)}
                    className="preset-btn preset-warning"
                    title="Set to 2 days from now"
                  >
                    Soon (+2d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetDate(7)}
                    className="preset-btn preset-alert"
                    title="Set to 1 week from now"
                  >
                    1 Week (+7d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetDate(30)}
                    className="preset-btn preset-safe"
                    title="Set to 1 month from now"
                  >
                    1 Month (+30d)
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

            {/* Unit Price */}
            <div className="form-group">
              <label className="form-label">Unit Price ($)</label>
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
                  placeholder="e.g. Fridge A, Shelf 2, Pantry"
                  className="input-field"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group span-2">
              <label className="form-label">Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional storage instructions or vendor details..."
                className="input-field"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <CheckCircle2 size={16} />
              <span>{submitting ? 'Saving...' : editItem ? 'Save Changes' : 'Add Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
