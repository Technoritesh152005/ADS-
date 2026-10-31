import React from 'react';
import { Package2, Plus, Zap, RotateCcw, User, CheckCircle2 } from 'lucide-react';

export default function Navbar({
  user,
  onOpenAddModal,
  onOpenExplainModal,
  onOpenSeedModal,
  totalItems,
}) {
  return (
    <header className="navbar-wrapper">
      <div className="navbar-content">
        {/* Brand */}
        <div className="brand-group">
          <div className="brand-icon">
            <Package2 size={24} className="text-emerald" />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">ExpiTrack</h1>
              <span className="brand-badge">Freshness Manager</span>
            </div>
            <p className="brand-subtitle">
              Smart inventory and perishable goods tracking system
            </p>
          </div>
        </div>

        {/* System Status Pill */}
        <div className="system-status-pill">
          <span className="status-dot"></span>
          <span className="status-text">System Live • Real-time Sync</span>
        </div>

        {/* Action Controls */}
        <div className="navbar-actions">
          {/* Seed Demo Data Button */}
          <button
            id="btn-seed-data"
            onClick={onOpenSeedModal}
            className="btn btn-secondary btn-sm"
            title="Reset or load sample inventory data"
          >
            <RotateCcw size={15} />
            <span>Load Demo Data</span>
          </button>

          {/* Performance Test Modal Trigger */}
          <button
            id="btn-open-explain-modal"
            onClick={onOpenExplainModal}
            className="btn btn-benchmark btn-sm"
            title="Run speed test comparing indexed vs full database search"
          >
            <Zap size={15} />
            <span>Speed Test</span>
          </button>

          {/* Add Item Button */}
          <button
            id="btn-add-item"
            onClick={onOpenAddModal}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>

          {/* User Badge */}
          {user && (
            <div className="user-profile-badge" title={`Signed in as ${user.name}`}>
              <div className="user-avatar">
                <User size={14} />
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
