import React from 'react';
import { Package, AlertOctagon, Clock, AlertTriangle, DollarSign, Layers } from 'lucide-react';

export default function DashboardStats({ metrics, activeStatusFilter, onSelectStatusFilter }) {
  const kpis = metrics?.kpis || {
    totalItems: 0,
    totalStockQuantity: 0,
    inventoryValuation: 0,
    expiredCount: 0,
    expiringSoonCount: 0,
    lowStockCount: 0,
  };

  const cards = [
    {
      id: 'all',
      title: 'Total Tracked Items',
      value: kpis.totalItems,
      subValue: `${kpis.totalStockQuantity} total units across categories`,
      icon: Package,
      color: 'blue',
      badge: 'B-Tree Indexed',
    },
    {
      id: 'expired',
      title: 'Expired Items',
      value: kpis.expiredCount,
      subValue: 'Requires immediate disposal',
      icon: AlertOctagon,
      color: 'red',
      isPulse: kpis.expiredCount > 0,
      badge: 'Critical Alert',
    },
    {
      id: 'expiring_soon',
      title: 'Expiring Soon (≤ 7 Days)',
      value: kpis.expiringSoonCount,
      subValue: 'Needs markdown or priority usage',
      icon: Clock,
      color: 'orange',
      badge: '$match Stage',
    },
    {
      id: 'low_stock',
      title: 'Low Stock (< 5 Units)',
      value: kpis.lowStockCount,
      subValue: 'Below minimum safety reorder level',
      icon: AlertTriangle,
      color: 'yellow',
      badge: 'Compound Index',
    },
    {
      id: 'healthy',
      title: 'Inventory Valuation',
      value: `$${(kpis.inventoryValuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subValue: 'Computed via $multiply & $sum',
      icon: DollarSign,
      color: 'emerald',
      badge: '$facet Pipeline',
    },
  ];

  return (
    <section className="dashboard-stats-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Live Inventory Health</h2>
          <p className="section-subtitle">
            Aggregation metrics computed directly inside MongoDB via multi-stage <code>$facet</code> pipeline
          </p>
        </div>
        <div className="db-concept-badge">
          <Layers size={14} />
          <span>Single-Pass $facet Pipeline</span>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = activeStatusFilter === card.id;

          return (
            <div
              key={card.id}
              onClick={() => onSelectStatusFilter(card.id)}
              className={`stat-card stat-card-${card.color} ${isActive ? 'active' : ''} ${card.isPulse ? 'pulse-critical' : ''}`}
              role="button"
              tabIndex={0}
              title={`Click to filter by ${card.title}`}
            >
              <div className="stat-card-header">
                <span className="stat-card-title">{card.title}</span>
                <div className={`stat-icon-wrapper stat-icon-${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>

              <div className="stat-card-body">
                <span className="stat-value">{card.value}</span>
                <span className={`stat-badge badge-${card.color}`}>{card.badge}</span>
              </div>

              <div className="stat-card-footer">
                <span className="stat-subvalue">{card.subValue}</span>
                {isActive && <span className="stat-active-indicator">● Active Filter</span>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
