const express = require('express');
const router = express.Router();

const { signup, login, forgotPassword, resetPassword} = require('../controllers/auth.controller');

router.post('/signup', signup);
router.post('/login', login)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;