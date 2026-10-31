import React, { useState } from 'react';
import { X, RotateCcw, Package2, Sparkles } from 'lucide-react';

export default function SeedModal({
  isOpen,
  onClose,
  onSeed,
}) {
  const [count, setCount] = useState(50);
  const [clearExisting, setClearExisting] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSeed(count, clearExisting);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Package2 size={20} className="text-emerald" />
            <h3 className="modal-title">Load Sample Inventory</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <p className="modal-subtitle">
            Quickly fill your inventory with realistic perishable products (groceries, dairy, bakery, pharmaceuticals) with realistic expiration dates.
          </p>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Select Sample Size</label>
            <div className="seed-options-grid">
              {[
                { qty: 50, label: '50 Products', desc: 'Standard Demo' },
                { qty: 250, label: '250 Products', desc: 'Medium Catalog' },
                { qty: 1000, label: '1,000 Products', desc: 'High Volume Test' },
              ].map((opt) => (
                <div
                  key={opt.qty}
                  onClick={() => setCount(opt.qty)}
                  className={`seed-option-card ${count === opt.qty ? 'active' : ''}`}
                >
                  <span className="seed-option-qty">{opt.label}</span>
                  <span className="seed-option-desc">{opt.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
              />
              <span>Replace current inventory with this new sample dataset</span>
            </label>
          </div>

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <RotateCcw size={16} className={loading ? 'spin' : ''} />
              <span>{loading ? 'Loading Products...' : `Generate ${count} Products`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
