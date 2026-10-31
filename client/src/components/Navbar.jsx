import React from 'react';
import { Database, Plus, Sparkles, RefreshCw, ShieldCheck, User } from 'lucide-react';

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
        {/* Brand / Title */}
        <div className="brand-group">
          <div className="brand-icon">
            <Database size={22} className="text-emerald" />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">ExpiTrack<span className="brand-trademark">™</span></h1>
              <span className="badge badge-academic-tag">Advanced DBMS</span>
            </div>
            <p className="brand-subtitle">
              Smart Perishable Inventory & Expiry Pipeline • MongoDB B-Tree Engine
            </p>
          </div>
        </div>

        {/* Database Status Pill */}
        <div className="db-status-pill">
          <span className="status-dot"></span>
          <span className="mono status-text">
            MongoDB 127.0.0.1:27017 | <strong className="text-emerald">Active Indexes (4)</strong>
          </span>
        </div>

        {/* Action Controls */}
        <div className="navbar-actions">
          {/* Seed Data Button */}
          <button
            id="btn-seed-data"
            onClick={onOpenSeedModal}
            className="btn btn-secondary btn-sm"
            title="Seed sample data or run high-volume stress test"
          >
            <RefreshCw size={15} />
            <span>Seed Data</span>
          </button>

          {/* Academic Benchmark Modal Trigger */}
          <button
            id="btn-open-explain-modal"
            onClick={onOpenExplainModal}
            className="btn btn-academic btn-sm"
            title="Live EXPLAIN() Query Plan Analyzer comparing IXSCAN vs COLLSCAN"
          >
            <Sparkles size={15} />
            <span>EXPLAIN Benchmark</span>
          </button>

          {/* Add Item Button */}
          <button
            id="btn-add-item"
            onClick={onOpenAddModal}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>

          {/* Current User Badge */}
          {user && (
            <div className="user-profile-badge" title={`Logged in as ${user.name} (${user.role})`}>
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
