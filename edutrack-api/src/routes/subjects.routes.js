const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const {
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject
} = require('../controllers/subjects.controller');

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Lista as disciplinas do usuário autenticado
 *     tags: [Subjects]
 *     responses:
 *       200:
 *         description: Lista de disciplinas
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.get('/', authMiddleware, getSubjects);

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Cria uma nova disciplina
 *     tags: [Subjects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               teacher:
 *                 type: string
 *               workload_hours:
 *                 type: integer
 *               description:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Disciplina criada com sucesso
 *       400:
 *         description: Nome inválido
 */
router.post('/', authMiddleware, createSubject);

/**
 * @swagger
 * /subjects/{id}:
 *   put:
 *     summary: Atualiza uma disciplina existente
 *     tags: [Subjects]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               teacher:
 *                 type: string
 *               workload_hours:
 *                 type: integer
 *               description:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Disciplina atualizada
 *       404:
 *         description: Disciplina não encontrada
 */
router.put('/:id', authMiddleware, updateSubject);

/**
 * @swagger
 * /subjects/{id}:
 *   delete:
 *     summary: Exclui uma disciplina
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Disciplina excluída com sucesso
 *       404:
 *         description: Disciplina não encontrada
 *       409:
 *         description: Existem tarefas vinculadas a esta disciplina
 */
router.delete('/:id', authMiddleware, deleteSubject);

module.exports = router;