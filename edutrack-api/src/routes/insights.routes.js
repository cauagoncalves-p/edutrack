const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const { getAdvancedProgress, getRecommendations } = require('../controllers/insights.controller');

/**
 * @swagger
 * /insights/progress:
 *   get:
 *     summary: Progresso avançado (ponderado por carga horária + previsão)
 *     tags: [Insights]
 *     responses:
 *       200:
 *         description: Progresso calculado pelo microsserviço Python
 *       503:
 *         description: Serviço de insights indisponível
 */
router.get('/progress', authMiddleware, getAdvancedProgress);

/**
 * @swagger
 * /insights/recommendations:
 *   get:
 *     summary: Recomendações de priorização de disciplinas atrasadas
 *     tags: [Insights]
 *     responses:
 *       200:
 *         description: Lista de recomendações ordenadas por urgência
 *       503:
 *         description: Serviço de insights indisponível
 */
router.get('/recommendations', authMiddleware, getRecommendations);

module.exports = router;