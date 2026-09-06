const { sql, poolPromise } = require('../config/db');

async function getDashboard(req, res) {
    try {
        const pool = await poolPromise;

        // Query 1: progresso por disciplina (a que já tínhamos)
        const subjectsResult = await pool.request()
            .input('userId', sql.Int, req.userId)
            .query(`
                SELECT
                    s.id,
                    s.name,
                    s.workload_hours,
                    COUNT(t.id) AS total_tasks,
                    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
                    CASE
                        WHEN COUNT(t.id) = 0 THEN 0
                        ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100
                    END AS progress_pct
                FROM subjects s
                LEFT JOIN academic_tasks t ON t.subject_id = s.id
                WHERE s.user_id = @userId
                GROUP BY s.id, s.name, s.workload_hours
                ORDER BY s.name
            `);

        // Query 2: resumo geral (contadores simples)
        const summaryResult = await pool.request()
            .input('userId', sql.Int, req.userId)
            .query(`
                SELECT
                    COUNT(DISTINCT s.id) AS total_subjects,
                    COUNT(t.id) AS total_tasks,
                    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
                    SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_tasks,
                    SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tasks
                FROM subjects s
                LEFT JOIN academic_tasks t ON t.subject_id = s.id
                WHERE s.user_id = @userId
            `);

        // Query 3: tarefas não concluídas, ordenadas pela data mais próxima primeiro.
        // NULL em due_date vai por último (ISNULL substitui NULL por uma data bem no futuro só para efeito de ordenação)
        const upcomingResult = await pool.request()
            .input('userId', sql.Int, req.userId)
            .query(`
                SELECT TOP 6
                    t.id, t.title, t.due_date, t.status,
                    s.name AS subject_name,
                    CASE WHEN t.due_date < CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END AS is_overdue
                FROM academic_tasks t
                INNER JOIN subjects s ON s.id = t.subject_id
                WHERE s.user_id = @userId AND t.status != 'completed'
                ORDER BY ISNULL(t.due_date, '9999-12-31') ASC
            `);

        res.json({
            dashboard: subjectsResult.recordset,
            summary: summaryResult.recordset[0],
            upcomingTasks: upcomingResult.recordset
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar dashboard.' });
    }
}

module.exports = { getDashboard };