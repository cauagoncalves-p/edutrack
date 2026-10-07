const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const { getDashboard } = require('../controllers/dashboard.controller');

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Retorna progresso por disciplina, resumo geral e próximas tarefas
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dados do dashboard
 */
router.get('/', authMiddleware, getDashboard);

module.exports = router;