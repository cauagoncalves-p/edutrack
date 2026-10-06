const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const { getAdvancedProgress, getRecommendations } = require('../controllers/insights.controller');

router.get('/progress', authMiddleware, getAdvancedProgress);
router.get('/recommendations', authMiddleware, getRecommendations);

module.exports = router;