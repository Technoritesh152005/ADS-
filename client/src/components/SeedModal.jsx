import React, { useState } from 'react';
import { X, RefreshCw, Database, CheckCircle2, Layers } from 'lucide-react';

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
            <Database size={20} className="text-emerald" />
            <h3 className="modal-title">Database Seeder & Volume Generator</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <p className="modal-subtitle">
            Populate MongoDB with realistic perishable goods (pharma, dairy, fresh bakery, produce) spanning expired, critical, and fresh expiry dates.
          </p>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Batch Size Selection</label>
            <div className="seed-options-grid">
              {[
                { qty: 50, label: '50 Items', desc: 'Standard Academic Demo' },
                { qty: 250, label: '250 Items', desc: 'Medium Store Catalog' },
                { qty: 1000, label: '1,000 Items', desc: 'Stress Test Benchmark' },
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
              <span>Clear existing items before generating fresh dataset</span>
            </label>
          </div>

          <div className="academic-tip-box">
            <Layers size={16} className="text-emerald" />
            <span>
              Tip: Inserting 1,000+ items noticeably demonstrates why B-Tree index scanning outperforms sequential collection scans.
            </span>
          </div>

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              <span>{loading ? 'Populating MongoDB...' : `Generate ${count} Items`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
