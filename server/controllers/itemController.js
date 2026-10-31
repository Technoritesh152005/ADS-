const Item = require('../models/Item');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all items with search, filter, and sorting
exports.getItems = async (req, res) => {
  try {
    const { userId, category, search, status, sortBy = 'expiryDate', sortOrder = 'asc' } = req.query;

    const query = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.itemName = { $regex: search, $options: 'i' };
    }

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    if (status === 'expired') {
      query.expiryDate = { $lt: now };
    } else if (status === 'expiring_soon') {
      query.expiryDate = { $gte: now, $lte: sevenDaysFromNow };
    } else if (status === 'low_stock') {
      query.quantity = { $lt: 5 };
    } else if (status === 'healthy') {
      query.expiryDate = { $gt: sevenDaysFromNow };
      query.quantity = { $gte: 5 };
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const items = await Item.find(query).sort(sortObj).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single item
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('userId', 'name email');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    if (!req.body.userId || !mongoose.Types.ObjectId.isValid(req.body.userId)) {
      let defaultUser = await User.findOne();
      if (!defaultUser) {
        defaultUser = await User.create({
          name: 'Store Manager',
          email: 'manager@store.com',
          role: 'Store Manager',
          organization: 'Apex Retail & Health',
        });
      }
      req.body.userId = defaultUser._id;
    }
    const item = await Item.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, message: 'Item successfully discarded / removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atomic Restock using MongoDB $inc operator
exports.quickRestock = async (req, res) => {
  try {
    const { amount = 10 } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity: Number(amount) } },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
