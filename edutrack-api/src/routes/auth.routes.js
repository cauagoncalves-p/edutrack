const express = require('express');
const router = express.Router();

// Importa a função que acabamos de escrever
const { signup, login} = require('../controllers/auth.controller');

// Define a rota POST /auth/signup, ligando-a à função signup
router.post('/signup', signup);
router.post('/login', login)

// Exporta o router para o server.js poder usá-lo
module.exports = router;