const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const {
    createTask,
    getTasksBySubject,
    updateTask,
    deleteTask,
    searchTasks
} = require('../controllers/tasks.controller');

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Cria uma nova tarefa vinculada a uma disciplina
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject_id, title]
 *             properties:
 *               subject_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       404:
 *         description: Disciplina não encontrada
 */
router.post('/', authMiddleware, createTask);

/**
 * @swagger
 * /tasks/search:
 *   get:
 *     summary: Busca tarefas do usuário com filtros combináveis
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Busca por texto no título ou descrição
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de tarefas filtradas
 */
router.get('/search', authMiddleware, searchTasks);

/**
 * @swagger
 * /tasks/subject/{subjectId}:
 *   get:
 *     summary: Lista as tarefas de uma disciplina específica
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de tarefas da disciplina
 *       404:
 *         description: Disciplina não encontrada
 */
router.get('/subject/:subjectId', authMiddleware, getTasksBySubject);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Atualiza uma tarefa existente
 *     tags: [Tasks]
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
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *     responses:
 *       200:
 *         description: Tarefa atualizada
 *       404:
 *         description: Tarefa não encontrada
 */
router.put('/:id', authMiddleware, updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Exclui uma tarefa
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarefa excluída com sucesso
 *       404:
 *         description: Tarefa não encontrada
 */
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;