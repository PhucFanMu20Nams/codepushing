const express = require('express');
const router = express.Router();
const { productCache } = require('../utils/cacheManager');
const { verifyToken } = require('../controllers/authController');

// GET /api/cache/stats - Get cache statistics (admin only)
router.get('/stats', verifyToken, (req, res) => {
  try {
    const stats = productCache.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ success: false, message: 'Error getting cache stats' });
  }
});

// POST /api/cache/clear - Clear cache (admin only)
router.post('/clear', verifyToken, (req, res) => {
  try {
    productCache.clear();
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ success: false, message: 'Error clearing cache' });
  }
});

module.exports = router;
