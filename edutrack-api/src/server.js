require('dotenv').config();

const express = require('express');
const cors = require('cors')

const {sql, poolPromise} = require('./config/db.js')
const app = express();

const authRoutes = require('./routes/auth.routes.js')
const subjectsRoutes = require('./routes/subjects.routes');

app.use(cors())
app.use(express.json())

app.get('/health', async (req, res) => {
    try {
        // Espera a conexão do pool estar pronta (resolve a Promise)
        const pool = await poolPromise;

        // Executa uma query simples no banco: pega a data/hora atual
        // do SQL Server — se isso funcionar, o banco está acessível
        const result = await pool.request().query('SELECT GETDATE() AS agora');

        // Responde ao cliente (navegador/Postman) com status 200 (padrão)
        // e um JSON confirmando que tudo está ok
        res.json({
            status: 'ok',
            banco_conectado: true,
            hora_banco: result.recordset[0].agora
        });
    } catch (err) {
        // Se algo falhar (banco fora do ar, credencial errada, etc.),
        // cai aqui: imprime o erro no terminal para debug...
        console.error(err);

        // ...e responde ao cliente com status 500 (erro interno do servidor)
        // e uma mensagem explicando o que aconteceu
        res.status(500).json({ status: 'erro', banco_conectado: false, erro: err.message });
    }
});

app.use('/auth', authRoutes)
app.use('/subjects', subjectsRoutes);

// Define a porta em que o servidor vai rodar — usa a variável
// PORT do .env, ou 3000 como valor padrão caso ela não exista
const PORT = process.env.PORT || 3000;

// Inicia o servidor de fato, "escutando" requisições na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

