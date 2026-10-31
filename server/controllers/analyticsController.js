const Item = require('../models/Item');
const User = require('../models/User');
const mongoose = require('mongoose');

// ========================================================
// ADVANCED DATABASE PIPELINE 1: LIVE ALERTS AGGREGATION
// ========================================================
// Shifts heavy multi-condition date calculation & classification directly to MongoDB engine
exports.getLiveAlerts = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const matchStage = {
      $or: [
        { expiryDate: { $lte: sevenDaysFromNow } }, // Expired or expiring within 7 days
        { quantity: { $lt: 5 } },                   // Critical low stock threshold
      ],
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      matchStage.userId = new mongoose.Types.ObjectId(userId);
    }

    const pipeline = [
      {
        $match: matchStage,
      },
      {
        $addFields: {
          // Compute remaining days directly inside MongoDB using date math
          daysRemaining: {
            $round: [
              {
                $divide: [
                  { $subtract: ['$expiryDate', '$$NOW'] },
                  1000 * 60 * 60 * 24, // milliseconds in a day
                ],
              },
              1,
            ],
          },
          alertType: {
            $switch: {
              branches: [
                {
                  case: { $lt: ['$expiryDate', '$$NOW'] },
                  then: 'EXPIRED',
                },
                {
                  case: {
                    $and: [
                      { $gte: ['$expiryDate', '$$NOW'] },
                      {
                        $lte: [
                          '$expiryDate',
                          new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                        ],
                      },
                    ],
                  },
                  then: 'CRITICAL_EXPIRY', // Within 3 days
                },
                {
                  case: {
                    $and: [
                      {
                        $gt: [
                          '$expiryDate',
                          new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                        ],
                      },
                      { $lte: ['$expiryDate', sevenDaysFromNow] },
                    ],
                  },
                  then: 'EXPIRING_SOON', // Within 4-7 days
                },
                {
                  case: { $lt: ['$quantity', 5] },
                  then: 'LOW_STOCK',
                },
              ],
              default: 'ATTENTION_NEEDED',
            },
          },
        },
      },
      {
        // Sort by urgency: earliest expiry first, then lowest quantity
        $sort: { expiryDate: 1, quantity: 1 },
      },
    ];

    const alerts = await Item.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// ADVANCED DATABASE PIPELINE 2: MULTI-FACET METRICS & AGGREGATION
// ========================================================
// Uses $facet to compute KPIs, Category Summaries, and Urgency distribution in 1 query
exports.getDashboardMetrics = async (req, res) => {
  try {
    const { userId } = req.query;
    const matchStage = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      matchStage.userId = new mongoose.Types.ObjectId(userId);
    }

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const metricsPipeline = [
      { $match: matchStage },
      {
        $facet: {
          // Facet A: Overall Key Performance Indicators (KPIs)
          kpis: [
            {
              $group: {
                _id: null,
                totalItems: { $sum: 1 },
                totalStockQuantity: { $sum: '$quantity' },
                inventoryValuation: {
                  $sum: { $multiply: ['$quantity', '$costPrice'] },
                },
                expiredCount: {
                  $sum: {
                    $cond: [{ $lt: ['$expiryDate', now] }, 1, 0],
                  },
                },
                expiringSoonCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ['$expiryDate', now] },
                          { $lte: ['$expiryDate', sevenDaysFromNow] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                lowStockCount: {
                  $sum: {
                    $cond: [{ $lt: ['$quantity', 5] }, 1, 0],
                  },
                },
              },
            },
          ],
          // Facet B: Category distribution & health
          categoryBreakdown: [
            {
              $group: {
                _id: '$category',
                itemCount: { $sum: 1 },
                totalUnits: { $sum: '$quantity' },
                expiredUnits: {
                  $sum: {
                    $cond: [{ $lt: ['$expiryDate', now] }, '$quantity', 0],
                  },
                },
              },
            },
            { $sort: { itemCount: -1 } },
          ],
        },
      },
    ];

    const result = await Item.aggregate(metricsPipeline);
    const kpis = result[0]?.kpis[0] || {
      totalItems: 0,
      totalStockQuantity: 0,
      inventoryValuation: 0,
      expiredCount: 0,
      expiringSoonCount: 0,
      lowStockCount: 0,
    };
    const categoryBreakdown = result[0]?.categoryBreakdown || [];

    res.status(200).json({
      success: true,
      data: {
        kpis,
        categoryBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// ADVANCED DATABASE FEATURE 3: LIVE EXPLAIN QUERY ANALYZER
// ========================================================
// Evaluator tool: Compares IXSCAN (Indexed B-Tree) vs COLLSCAN (Table Scan)
exports.runExplainBenchmark = async (req, res) => {
  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);

    const queryFilter = { expiryDate: { $lte: targetDate } };

    // 1. Run with Index Scan (using idx_item_expiryDate)
    const indexedExplain = await Item.collection
      .find(queryFilter)
      .hint({ expiryDate: 1 })
      .explain('executionStats');

    // 2. Run with Forced Collection Scan ($natural table scan)
    const unindexedExplain = await Item.collection
      .find(queryFilter)
      .hint({ $natural: 1 })
      .explain('executionStats');

    const totalCollectionCount = await Item.countDocuments();

    // Helper to extract stage metrics
    const parseExplain = (explainOutput) => {
      const stats = explainOutput.executionStats || {};
      const winningPlan = explainOutput.queryPlanner?.winningPlan || {};

      let inputStage = winningPlan.inputStage || {};
      let stageName = winningPlan.stage;
      if (stageName === 'FETCH' && inputStage.stage) {
        stageName = `${stageName} -> ${inputStage.stage}`;
      }

      return {
        stage: stageName,
        executionTimeMillis: stats.executionTimeMillis ?? 0,
        totalDocsExamined: stats.totalDocsExamined ?? 0,
        totalKeysExamined: stats.totalKeysExamined ?? 0,
        nReturned: stats.nReturned ?? 0,
        executionSuccess: stats.executionSuccess ?? true,
      };
    };

    const indexedStats = parseExplain(indexedExplain);
    const unindexedStats = parseExplain(unindexedExplain);

    // Calculate optimization metrics
    const docsSaved = Math.max(0, unindexedStats.totalDocsExamined - indexedStats.totalDocsExamined);
    const efficiencyRatio = unindexedStats.totalDocsExamined > 0 && indexedStats.totalDocsExamined > 0
      ? (unindexedStats.totalDocsExamined / indexedStats.totalDocsExamined).toFixed(2) + 'x'
      : 'Optimal';

    res.status(200).json({
      success: true,
      data: {
        totalCollectionCount,
        queryExecuted: JSON.stringify(queryFilter),
        indexed: {
          ...indexedStats,
          indexUsed: 'idx_item_expiryDate (B-Tree Index)',
          description: 'Uses MongoDB B-Tree index pointers to locate matching leaf nodes directly in O(log N) time, examining zero unrelated documents.',
        },
        unindexed: {
          ...unindexedStats,
          indexUsed: 'COLLSCAN (No Index / Full Table Scan)',
          description: 'Forced to scan every single document on disk sequentially from memory/storage in O(N) time.',
        },
        comparison: {
          docsSaved,
          efficiencyRatio,
          academicConclusion: `The index eliminated scanning ${docsSaved} redundant documents (${efficiencyRatio} efficiency gain). In production datasets with millions of rows, COLLSCAN causes I/O bottlenecks and high latency, while IXSCAN executes in sub-millisecond time.`,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// SEEDING AND STRESS TEST GENERATOR
// ========================================================
exports.seedData = async (req, res) => {
  try {
    const { count = 50, clearExisting = true } = req.body;
    const countNum = parseInt(count, 10);

    // Ensure at least one user exists
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: 'Dr. Evelyn Reed',
        email: 'evelyn.reed@apexpharma.com',
        role: 'Pharmacist',
        organization: 'Apex Healthcare & Retail Hub',
      });
    }

    if (clearExisting) {
      await Item.deleteMany({});
    }

    const categories = [
      { name: 'Dairy & Eggs', items: ['Organic Whole Milk', 'Greek Yogurt', 'Cheddar Cheese Block', 'Free-range Brown Eggs', 'Salted Butter', 'Heavy Cream', 'Mozzarella Ball'], unit: 'units' },
      { name: 'Bakery', items: ['Sourdough Artisanal Loaf', 'Brioche Burger Buns', 'Croissant Box (4pk)', 'Whole Wheat Bread', 'Blueberry Muffins', 'Bagel Pack (6pk)'], unit: 'boxes' },
      { name: 'Medicines & Pharma', items: ['Amoxicillin 500mg Caps', 'Paracetamol 650mg Tabs', 'Cough Suppressant Syrup', 'Vitamin C 1000mg Effervescent', 'Ibuprofen 400mg', 'Antiseptic Solution 500ml', 'Insulin Glargine Pen'], unit: 'strips' },
      { name: 'Produce & Fruits', items: ['Organic Hass Avocados', 'Fresh Baby Spinach', 'Roma Tomatoes 1kg', 'Crisp Gala Apples', 'Ripe Cavendish Bananas', 'Fresh Blueberries 250g'], unit: 'packs' },
      { name: 'Meat & Seafood', items: ['Fresh Atlantic Salmon Fillet', 'Free-range Chicken Breast', 'Ground Lean Beef 500g', 'Tiger Prawns 400g', 'Turkey Bacon Rashers'], unit: 'packs' },
      { name: 'Pantry & Canned', items: ['Organic Chickpeas 400g', 'Italian Plum Tomatoes Can', 'Extra Virgin Olive Oil 1L', 'Basmati Rice 5kg', 'Organic Coconut Milk', 'Almond Butter 350g'], unit: 'units' },
      { name: 'Beverages', items: ['Fresh Squeezed Orange Juice', 'Cold Brew Coffee 1L', 'Sparkling Mineral Water', 'Matcha Green Tea Drink', 'Oat Milk Barista 1L'], unit: 'bottles' },
      { name: 'Personal Care', items: ['Gentle Hydrating Cleanser', 'SPF 50+ Sunscreen Lotion', 'Antibacterial Hand Sanitizer', 'Moisturizing Hand Cream'], unit: 'bottles' },
    ];

    const storageLocations = [
      'Cold Vault A-1', 'Cold Vault A-2', 'Pharmacy Shelf B-3',
      'Ambient Rack C-4', 'Produce Chiller D-1', 'Freezer Unit E-2', 'Dry Storage Room 1'
    ];

    const itemsToInsert = [];
    const now = new Date();

    for (let i = 0; i < countNum; i++) {
      const catObj = categories[Math.floor(Math.random() * categories.length)];
      const baseItem = catObj.items[Math.floor(Math.random() * catObj.items.length)];
      const itemName = i > 40 ? `${baseItem} - Batch #${i}` : baseItem;

      // Realistic expiry date distribution:
      // ~15% expired (-1 to -10 days)
      // ~20% critical (1 to 3 days)
      // ~25% expiring soon (4 to 7 days)
      // ~40% safe / fresh (8 to 90 days)
      const rand = Math.random();
      let dayOffset = 0;
      if (rand < 0.15) {
        dayOffset = -(Math.floor(Math.random() * 10) + 1); // expired
      } else if (rand < 0.35) {
        dayOffset = Math.floor(Math.random() * 3) + 1; // 1-3 days
      } else if (rand < 0.60) {
        dayOffset = Math.floor(Math.random() * 4) + 4; // 4-7 days
      } else {
        dayOffset = Math.floor(Math.random() * 80) + 8; // 8-90 days
      }

      const expiryDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const quantity = Math.random() < 0.25 ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 45) + 5;
      const costPrice = parseFloat((Math.random() * 40 + 3).toFixed(2));

      itemsToInsert.push({
        userId: user._id,
        itemName,
        category: catObj.name,
        quantity,
        unit: catObj.unit,
        expiryDate,
        costPrice,
        batchNumber: `LOT-${Math.floor(100000 + Math.random() * 900000)}`,
        storageLocation: storageLocations[Math.floor(Math.random() * storageLocations.length)],
        notes: dayOffset < 0 ? 'Item passed shelf expiration threshold' : 'Standard inventory intake',
      });
    }

    const inserted = await Item.insertMany(itemsToInsert);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} items into database!`,
      count: inserted.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
