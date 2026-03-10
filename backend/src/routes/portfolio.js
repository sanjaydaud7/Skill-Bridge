const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPortfolio, getMyPortfolio } = require('../controllers/portfolioController');

router.get('/me', protect, getMyPortfolio);
router.get('/:username', getPortfolio);   // Public

module.exports = router;
