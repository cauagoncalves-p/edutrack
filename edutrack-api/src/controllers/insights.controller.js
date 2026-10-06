const axios = require('axios');
const { sql, poolPromise } = require('../config/db');

const INSIGHTS_SERVICE_URL = 'http://localhost:8000';

// Busca todas as disciplinas do usuário, cada uma já com suas tarefas aninhadas,
// no formato exato que o serviço Python espera receber
async function getSubjectsWithTasks(pool, userId) {
    const subjectsResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT id, name, workload_hours FROM subjects WHERE user_id = @userId');

    const subjects = subjectsResult.recordset;

    // Para cada disciplina, busca suas tarefas e já monta no formato esperado
    for (const subject of subjects) {
        const tasksResult = await pool.request()
            .input('subjectId', sql.Int, subject.id)
            .query('SELECT id, status, due_date FROM academic_tasks WHERE subject_id = @subjectId');

        subject.tasks = tasksResult.recordset.map(t => ({
            id: t.id,
            status: t.status,
            // O Python espera data no formato YYYY-MM-DD; devolve null se não houver prazo
            due_date: t.due_date ? t.due_date.toISOString().split('T')[0] : null
        }));
    }

    return subjects;
}

// Progresso avançado (ponderado por carga horária + previsão de conclusão)
async function getAdvancedProgress(req, res) {
    try {
        const pool = await poolPromise;
        const subjects = await getSubjectsWithTasks(pool, req.userId);

        // Repassa os dados para o microsserviço Python calcular
        const response = await axios.post(`${INSIGHTS_SERVICE_URL}/progress/advanced`, { subjects });

        res.json(response.data);

    } catch (err) {
        console.error(err);
        // Se o serviço Python estiver fora do ar, isso cai aqui
        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: 'Serviço de insights indisponível no momento.' });
        }
        res.status(500).json({ error: 'Erro ao calcular progresso avançado.' });
    }
}

// Recomendações de priorização
async function getRecommendations(req, res) {
    try {
        const pool = await poolPromise;
        const subjects = await getSubjectsWithTasks(pool, req.userId);

        const response = await axios.post(`${INSIGHTS_SERVICE_URL}/insights/recommendations`, { subjects });

        res.json(response.data);

    } catch (err) {
        console.error(err);
        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: 'Serviço de insights indisponível no momento.' });
        }
        res.status(500).json({ error: 'Erro ao gerar recomendações.' });
    }
}

module.exports = { getAdvancedProgress, getRecommendations };