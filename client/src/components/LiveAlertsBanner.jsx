import React from 'react';
import { AlertCircle, PlusCircle, Trash2, ShieldAlert, ChevronRight } from 'lucide-react';

export default function LiveAlertsBanner({ alerts, onRestock, onDelete }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alerts-empty-banner">
        <ShieldAlert size={20} className="text-emerald" />
        <span>All perishable items are fresh and stock levels are optimal! Zero critical alerts detected by aggregation.</span>
      </div>
    );
  }

  return (
    <div className="live-alerts-container">
      <div className="alerts-header">
        <div className="alerts-title-row">
          <div className="alerts-beacon"></div>
          <h3 className="alerts-title">Active Database Alerts ({alerts.length})</h3>
          <span className="badge badge-academic-tag">MongoDB $match + $addFields Pipeline</span>
        </div>
        <p className="alerts-subtitle">
          Real-time query matching <code>expiryDate ≤ (now + 7 days) OR quantity &lt; 5</code> with server-computed date differentials
        </p>
      </div>

      <div className="alerts-scroll-row">
        {alerts.slice(0, 8).map((item) => {
          const isExpired = item.alertType === 'EXPIRED' || item.daysRemaining < 0;
          const isCritical = item.alertType === 'CRITICAL_EXPIRY';
          const isLowStock = item.alertType === 'LOW_STOCK';

          let alertClass = 'alert-warning';
          let alertLabel = `${item.daysRemaining} days left`;
          if (isExpired) {
            alertClass = 'alert-expired';
            alertLabel = `EXPIRED (${Math.abs(item.daysRemaining)}d ago)`;
          } else if (isCritical) {
            alertClass = 'alert-critical';
            alertLabel = `CRITICAL (${item.daysRemaining}d left)`;
          } else if (isLowStock) {
            alertClass = 'alert-low';
            alertLabel = `LOW STOCK (${item.quantity} ${item.unit})`;
          }

          return (
            <div key={item._id} className={`alert-card ${alertClass}`}>
              <div className="alert-card-top">
                <span className={`alert-pill ${alertClass}`}>{alertLabel}</span>
                <span className="alert-category">{item.category}</span>
              </div>

              <h4 className="alert-item-name" title={item.itemName}>{item.itemName}</h4>

              <div className="alert-details">
                <span>Stock: <strong>{item.quantity} {item.unit}</strong></span>
                <span>•</span>
                <span>Loc: {item.storageLocation || 'Warehouse'}</span>
              </div>

              <div className="alert-actions">
                <button
                  onClick={() => onRestock(item._id, 10)}
                  className="btn btn-sm alert-btn-restock"
                  title="Quick restock 10 units via MongoDB $inc operator"
                >
                  <PlusCircle size={13} />
                  <span>+10</span>
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="btn btn-sm alert-btn-discard"
                  title="Remove or discard item"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
