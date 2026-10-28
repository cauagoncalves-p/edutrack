const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const { tutorRateLimit } = require('../middlewares/rateLimit.middleware');
const {
    createConversation,
    listConversations,
    getConversation,
    updateConversation,
    deleteConversation,
    sendMessage
} = require('../controllers/tutor.controller');

/**
 * @swagger
 * /tutor/conversations:
 *   post:
 *     summary: Cria uma conversa com o tutor (opcionalmente vinculada a uma disciplina)
 *     tags: [Tutor]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject_id:
 *                 type: integer
 *               mode:
 *                 type: string
 *                 enum: [teacher, exercises, review, socratic]
 *     responses:
 *       201:
 *         description: Conversa criada
 *       404:
 *         description: Disciplina não encontrada
 *   get:
 *     summary: Lista as conversas do usuário (filtro opcional por disciplina)
 *     tags: [Tutor]
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de conversas
 */
router.post('/conversations', authMiddleware, createConversation);
router.get('/conversations', authMiddleware, listConversations);

/**
 * @swagger
 * /tutor/conversations/{id}:
 *   get:
 *     summary: Retorna uma conversa com suas mensagens
 *     tags: [Tutor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversa e mensagens
 *       404:
 *         description: Conversa não encontrada
 *   put:
 *     summary: Altera o modo de estudo da conversa
 *     tags: [Tutor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mode]
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [teacher, exercises, review, socratic]
 *     responses:
 *       200:
 *         description: Conversa atualizada
 *       404:
 *         description: Conversa não encontrada
 *   delete:
 *     summary: Exclui uma conversa e suas mensagens
 *     tags: [Tutor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversa excluída
 *       404:
 *         description: Conversa não encontrada
 */
router.get('/conversations/:id', authMiddleware, getConversation);
router.put('/conversations/:id', authMiddleware, updateConversation);
router.delete('/conversations/:id', authMiddleware, deleteConversation);

/**
 * @swagger
 * /tutor/conversations/{id}/messages:
 *   post:
 *     summary: Envia uma mensagem ao tutor e recebe a resposta da IA
 *     tags: [Tutor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *     responses:
 *       200:
 *         description: Resposta do tutor
 *       400:
 *         description: Mensagem vazia ou grande demais
 *       404:
 *         description: Conversa não encontrada
 *       429:
 *         description: Limite de mensagens atingido
 *       503:
 *         description: Tutor indisponível
 */
router.post('/conversations/:id/messages', authMiddleware, tutorRateLimit, sendMessage);

module.exports = router;