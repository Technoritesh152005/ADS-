import React from 'react';
import { Boxes, AlertOctagon, Clock4, TrendingDown, DollarSign } from 'lucide-react';

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
      title: 'Total Products',
      value: kpis.totalItems,
      subValue: `${kpis.totalStockQuantity} total units in stock`,
      icon: Boxes,
      color: 'blue',
      badge: 'All Stock',
    },
    {
      id: 'expired',
      title: 'Expired Products',
      value: kpis.expiredCount,
      subValue: 'Action needed: discard or replace',
      icon: AlertOctagon,
      color: 'red',
      isPulse: kpis.expiredCount > 0,
      badge: 'Expired',
    },
    {
      id: 'expiring_soon',
      title: 'Expiring Soon',
      value: kpis.expiringSoonCount,
      subValue: 'Expiring within the next 7 days',
      icon: Clock4,
      color: 'amber',
      badge: 'Next 7 Days',
    },
    {
      id: 'low_stock',
      title: 'Low Stock Alert',
      value: kpis.lowStockCount,
      subValue: 'Fewer than 5 units remaining',
      icon: TrendingDown,
      color: 'orange',
      badge: 'Reorder Soon',
    },
    {
      id: 'healthy',
      title: 'Estimated Stock Value',
      value: `$${(kpis.inventoryValuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subValue: 'Current total inventory worth',
      icon: DollarSign,
      color: 'emerald',
      badge: 'Total Worth',
    },
  ];

  return (
    <section className="dashboard-stats-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Inventory Overview</h2>
          <p className="section-subtitle">
            Live stock health, expiration alerts, and inventory valuation at a glance
          </p>
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
              className={`stat-card stat-card-${card.color} ${isActive ? 'active' : ''} ${card.isPulse ? 'card-pulse' : ''}`}
              role="button"
              tabIndex={0}
              title={`Click to filter list by ${card.title}`}
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
                {isActive && <span className="stat-active-indicator">● Filter Active</span>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
