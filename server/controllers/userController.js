const User = require('../models/User');

// Get all users or get default active user
exports.getUsers = async (req, res) => {
  try {
    let users = await User.find().sort({ createdAt: 1 });
    if (users.length === 0) {
      // Auto-seed default user if collection is empty
      const defaultUser = await User.create({
        name: 'Dr. Evelyn Reed',
        email: 'evelyn.reed@apexpharma.com',
        role: 'Pharmacist',
        organization: 'Apex Healthcare & Retail Hub',
      });
      users = [defaultUser];
    }
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, organization } = req.body;
    const user = await User.create({ name, email, role, organization });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
