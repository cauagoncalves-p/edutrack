const { rateLimit } = require('express-rate-limit');

// Must run AFTER authMiddleware, because the limit is per user (req.userId)
const tutorRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: parseInt(process.env.TUTOR_RATE_PER_MINUTE, 10) || 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => `user-${req.userId}`,
    handler: (req, res) =>
        res.status(429).json({ error: 'Você está enviando mensagens rápido demais. Aguarde um instante.' })
});

module.exports = { tutorRateLimit };