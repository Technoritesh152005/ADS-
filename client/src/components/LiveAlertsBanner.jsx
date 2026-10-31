import React from 'react';
import { AlertCircle, PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';

export default function LiveAlertsBanner({ alerts, onRestock, onDelete }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alerts-empty-banner">
        <CheckCircle2 size={18} className="text-emerald" />
        <span>All clear! Every product is fresh and stock levels are healthy.</span>
      </div>
    );
  }

  return (
    <div className="live-alerts-container">
      <div className="alerts-header">
        <div className="alerts-title-row">
          <div className="alerts-beacon"></div>
          <h3 className="alerts-title">Items Needing Attention ({alerts.length})</h3>
        </div>
        <p className="alerts-subtitle">
          Review products that are expired, nearing their expiration date, or running low on stock.
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
            alertLabel = `Expired (${Math.abs(item.daysRemaining)}d ago)`;
          } else if (isCritical) {
            alertClass = 'alert-critical';
            alertLabel = `Expires in ${item.daysRemaining}d`;
          } else if (isLowStock) {
            alertClass = 'alert-low';
            alertLabel = `Low Stock (${item.quantity} left)`;
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
                <span>{item.storageLocation || 'Main Shelf'}</span>
              </div>

              <div className="alert-actions">
                <button
                  onClick={() => onRestock(item._id, 10)}
                  className="btn btn-sm alert-btn-restock"
                  title="Quickly add 10 units to stock"
                >
                  <PlusCircle size={13} />
                  <span>+10 Stock</span>
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="btn btn-sm alert-btn-discard"
                  title="Remove this product"
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
