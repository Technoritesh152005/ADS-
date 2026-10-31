const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Item = require('../models/Item');

const seedInitialData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_inventory_db';
    console.log(`[Seeder] Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seeder] Cleaning existing demo collections...');
    await User.deleteMany({});
    await Item.deleteMany({});

    console.log('[Seeder] Creating primary Store Manager & Pharmacist user...');
    const user = await User.create({
      name: 'Dr. Evelyn Reed',
      email: 'evelyn.reed@apexpharma.com',
      role: 'Pharmacist',
      organization: 'Apex Healthcare & Retail Hub',
    });

    const now = new Date();
    const categories = [
      { name: 'Medicines & Pharma', items: ['Amoxicillin 500mg Caps', 'Paracetamol 650mg Tabs', 'Cough Suppressant Syrup', 'Vitamin C 1000mg Effervescent', 'Ibuprofen 400mg', 'Antiseptic Solution 500ml', 'Insulin Glargine Pen'], unit: 'strips', baseCost: 15.5 },
      { name: 'Dairy & Eggs', items: ['Organic Whole Milk 1L', 'Greek Yogurt 500g', 'Cheddar Cheese Block', 'Free-range Brown Eggs', 'Salted Butter 250g', 'Heavy Cream 300ml', 'Mozzarella Ball'], unit: 'units', baseCost: 4.8 },
      { name: 'Bakery', items: ['Sourdough Artisanal Loaf', 'Brioche Burger Buns', 'Croissant Box (4pk)', 'Whole Wheat Bread', 'Blueberry Muffins', 'Bagel Pack (6pk)'], unit: 'boxes', baseCost: 5.2 },
      { name: 'Produce & Fruits', items: ['Organic Hass Avocados', 'Fresh Baby Spinach 200g', 'Roma Tomatoes 1kg', 'Crisp Gala Apples', 'Ripe Cavendish Bananas', 'Fresh Blueberries 250g'], unit: 'packs', baseCost: 3.9 },
      { name: 'Meat & Seafood', items: ['Fresh Atlantic Salmon Fillet', 'Free-range Chicken Breast', 'Ground Lean Beef 500g', 'Tiger Prawns 400g', 'Turkey Bacon Rashers'], unit: 'packs', baseCost: 12.0 },
      { name: 'Pantry & Canned', items: ['Organic Chickpeas 400g', 'Italian Plum Tomatoes Can', 'Extra Virgin Olive Oil 1L', 'Basmati Rice 5kg', 'Organic Coconut Milk', 'Almond Butter 350g'], unit: 'units', baseCost: 6.5 },
      { name: 'Beverages', items: ['Fresh Squeezed Orange Juice', 'Cold Brew Coffee 1L', 'Sparkling Mineral Water', 'Matcha Green Tea Drink', 'Oat Milk Barista 1L'], unit: 'bottles', baseCost: 4.2 },
      { name: 'Personal Care', items: ['Gentle Hydrating Cleanser', 'SPF 50+ Sunscreen Lotion', 'Antibacterial Hand Sanitizer', 'Moisturizing Hand Cream'], unit: 'bottles', baseCost: 14.0 },
    ];

    const storageLocations = [
      'Cold Vault A-1', 'Cold Vault A-2', 'Pharmacy Shelf B-3',
      'Ambient Rack C-4', 'Produce Chiller D-1', 'Freezer Unit E-2', 'Dry Storage Room 1'
    ];

    const itemsToInsert = [];

    // Specific deterministic seed items for clear demo presentation
    // 1. Expired items (Expired 2 to 6 days ago)
    itemsToInsert.push(
      {
        userId: user._id,
        itemName: 'Amoxicillin 500mg Caps (Batch #092)',
        category: 'Medicines & Pharma',
        quantity: 8,
        unit: 'strips',
        expiryDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        costPrice: 18.5,
        batchNumber: 'LOT-902144',
        storageLocation: 'Pharmacy Shelf B-3',
        notes: 'Expired 4 days ago - immediate disposal required',
      },
      {
        userId: user._id,
        itemName: 'Organic Whole Milk 1L',
        category: 'Dairy & Eggs',
        quantity: 14,
        unit: 'bottles',
        expiryDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        costPrice: 4.5,
        batchNumber: 'LOT-781033',
        storageLocation: 'Cold Vault A-1',
        notes: 'Expired milk carton - discard',
      },
      {
        userId: user._id,
        itemName: 'Fresh Atlantic Salmon Fillet',
        category: 'Meat & Seafood',
        quantity: 6,
        unit: 'packs',
        expiryDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        costPrice: 22.0,
        batchNumber: 'LOT-673199',
        storageLocation: 'Freezer Unit E-2',
        notes: 'Best before past - spoiled',
      }
    );

    // 2. Critical Expiry items (expiring within 1 to 3 days)
    itemsToInsert.push(
      {
        userId: user._id,
        itemName: 'Insulin Glargine Pen (SoloStar)',
        category: 'Medicines & Pharma',
        quantity: 12,
        unit: 'boxes',
        expiryDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        costPrice: 45.0,
        batchNumber: 'LOT-341901',
        storageLocation: 'Cold Vault A-2',
        notes: 'Priority alert: Expiring in 24 hours!',
      },
      {
        userId: user._id,
        itemName: 'Greek Yogurt 500g (Honey Flavored)',
        category: 'Dairy & Eggs',
        quantity: 3, // Also low stock!
        unit: 'units',
        expiryDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        costPrice: 5.2,
        batchNumber: 'LOT-448210',
        storageLocation: 'Cold Vault A-1',
        notes: 'Expiring in 2 days and low inventory',
      },
      {
        userId: user._id,
        itemName: 'Fresh Baby Spinach 200g',
        category: 'Produce & Fruits',
        quantity: 7,
        unit: 'packs',
        expiryDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        costPrice: 3.8,
        batchNumber: 'LOT-559128',
        storageLocation: 'Produce Chiller D-1',
        notes: '3 days shelf-life remaining',
      }
    );

    // 3. Expiring Soon (4 to 7 days)
    itemsToInsert.push(
      {
        userId: user._id,
        itemName: 'Paracetamol 650mg Tabs',
        category: 'Medicines & Pharma',
        quantity: 2, // Low stock
        unit: 'strips',
        expiryDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        costPrice: 3.5,
        batchNumber: 'LOT-229041',
        storageLocation: 'Pharmacy Shelf B-3',
        notes: 'Low inventory and expiring in 5 days',
      },
      {
        userId: user._id,
        itemName: 'Croissant Box (4pk Fresh Baked)',
        category: 'Bakery',
        quantity: 10,
        unit: 'boxes',
        expiryDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        costPrice: 6.0,
        batchNumber: 'LOT-674322',
        storageLocation: 'Ambient Rack C-4',
        notes: 'Bakery batch shelf date: 6 days remaining',
      }
    );

    // 4. Generate 45 more items spread across safe/healthy dates (15 to 120 days)
    for (let i = 0; i < 45; i++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const name = cat.items[Math.floor(Math.random() * cat.items.length)];
      const daysAhead = Math.floor(Math.random() * 110) + 12; // 12 to 122 days ahead
      const qty = Math.floor(Math.random() * 50) + 6;

      itemsToInsert.push({
        userId: user._id,
        itemName: `${name} ${i % 3 === 0 ? '(Bulk Stock)' : ''}`.trim(),
        category: cat.name,
        quantity: qty,
        unit: cat.unit,
        expiryDate: new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000),
        costPrice: parseFloat((cat.baseCost + Math.random() * 5).toFixed(2)),
        batchNumber: `LOT-${Math.floor(100000 + Math.random() * 900000)}`,
        storageLocation: storageLocations[Math.floor(Math.random() * storageLocations.length)],
        notes: 'Standard verified stock',
      });
    }

    const inserted = await Item.insertMany(itemsToInsert);
    console.log(`[Seeder] Successfully populated ${inserted.length} items with B-Tree indexes!`);

    const indexes = await Item.collection.indexes();
    console.log('[Seeder] Built Indexes for Advanced DBMS:');
    indexes.forEach((idx) => console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`));

    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]:', err);
    process.exit(1);
  }
};

seedInitialData();
