const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    itemName: {
      type: String,
      required: [true, 'Please provide the item name'],
      trim: true,
      maxlength: [120, 'Item name cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: [
        'Dairy & Eggs',
        'Bakery',
        'Medicines & Pharma',
        'Produce & Fruits',
        'Meat & Seafood',
        'Pantry & Canned',
        'Beverages',
        'Personal Care',
      ],
      default: 'Pantry & Canned',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 1,
    },
    unit: {
      type: String,
      default: 'units',
      enum: ['units', 'bottles', 'boxes', 'packs', 'kg', 'strips', 'liters'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiration date is strictly required for perishable tracking'],
    },
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative'],
      default: 0,
    },
    batchNumber: {
      type: String,
      default: () => 'LOT-' + Math.floor(100000 + Math.random() * 900000),
      trim: true,
    },
    storageLocation: {
      type: String,
      default: 'Cold Storage Room A',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ========================================================
// ADVANCED DATABASE OPTIMIZATIONS (INDEXING STRATEGY)
// ========================================================

// 1. Single-Field B-Tree Index for rapid date-range filtering ($lte, $gte)
// Eliminates full collection scan (COLLSCAN) -> Index Scan (IXSCAN)
ItemSchema.index({ expiryDate: 1 }, { name: 'idx_item_expiryDate' });

// 2. Multi-Key Compound Index for tenant-isolated expiry queries
ItemSchema.index({ userId: 1, expiryDate: 1 }, { name: 'idx_user_expiryDate' });

// 3. Multi-Key Compound Index for rapid low-stock alerts
ItemSchema.index({ userId: 1, quantity: 1 }, { name: 'idx_user_quantity' });

// 4. Category Index for fast grouping and filtering
ItemSchema.index({ category: 1 }, { name: 'idx_category' });

module.exports = mongoose.model('Item', ItemSchema);
