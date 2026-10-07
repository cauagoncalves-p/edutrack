const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const { getMe, updateMe, changePassword } = require('../controllers/users.controller');

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Dados do usuário
 */
router.get('/me', authMiddleware, getMe);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Atualiza nome e/ou email do usuário autenticado
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *       409:
 *         description: Email já está em uso
 */
router.put('/me', authMiddleware, updateMe);

/**
 * @swagger
 * /users/me/password:
 *   put:
 *     summary: Altera a senha do usuário autenticado
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       401:
 *         description: Senha atual incorreta
 */
router.put('/me/password', authMiddleware, changePassword);

module.exports = router;