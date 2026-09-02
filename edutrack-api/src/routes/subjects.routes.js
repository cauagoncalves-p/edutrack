const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const {
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject
} = require('../controllers/subjects.controller');

// Todas as rotas abaixo passam pelo authMiddleware antes do controller —
// isso garante que req.userId sempre existe quando o controller roda
router.post('/', authMiddleware, createSubject);
router.get('/', authMiddleware, getSubjects);
router.put('/:id', authMiddleware, updateSubject);
router.delete('/:id', authMiddleware, deleteSubject);

module.exports = router;