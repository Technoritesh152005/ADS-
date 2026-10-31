const express = require('express');
const router = express.Router();
const {
  getLiveAlerts,
  getDashboardMetrics,
  runExplainBenchmark,
  seedData,
} = require('../controllers/analyticsController');

// Advanced Aggregation Routes
router.get('/alerts', getLiveAlerts);
router.get('/alerts/:userId', getLiveAlerts);
router.get('/metrics', getDashboardMetrics);

// DBMS Evaluation & Benchmark Tool
router.get('/explain-benchmark', runExplainBenchmark);
router.post('/seed', seedData);

module.exports = router;
