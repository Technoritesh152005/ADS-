const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_inventory_db', {
      autoIndex: true, // Automatically build indexes defined in schemas
    });
    console.log(`[MongoDB Connected]: Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
