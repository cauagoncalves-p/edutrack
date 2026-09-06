const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const { getDashboard } = require('../controllers/dashboard.controller');

router.get('/', authMiddleware, getDashboard);

module.exports = router;