const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const {
    createTask,
    getTasksBySubject,
    updateTask,
    deleteTask
} = require('../controllers/tasks.controller');

router.post('/', authMiddleware, createTask);
router.get('/subject/:subjectId', authMiddleware, getTasksBySubject);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;