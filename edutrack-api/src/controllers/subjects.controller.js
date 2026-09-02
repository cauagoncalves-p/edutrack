const { sql, poolPromise } = require('../config/db');

// CREATE — cria uma nova disciplina vinculada ao usuário logado
async function createSubject(req, res) {
    const { name, teacher, workload_hours, description, start_date, end_date } = req.body;

    // Único campo realmente obrigatório é o nome —
    // os demais fazem sentido como opcionais (nem todo mundo
    // sabe carga horária ou datas no momento do cadastro)
    if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: 'Nome da disciplina precisa ter pelo menos 2 caracteres.' });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('userId', sql.Int, req.userId)
            .input('name', sql.VarChar, name.trim())
            .input('teacher', sql.VarChar, teacher || null)
            .input('workloadHours', sql.Int, workload_hours || null)
            .input('description', sql.VarChar, description || null)
            .input('startDate', sql.Date, start_date || null)
            .input('endDate', sql.Date, end_date || null)
            .query(`
                INSERT INTO subjects (user_id, name, teacher, workload_hours, description, start_date, end_date)
                OUTPUT INSERTED.*
                VALUES (@userId, @name, @teacher, @workloadHours, @description, @startDate, @endDate)
            `);

        res.status(201).json({ message: 'Disciplina criada com sucesso.', subject: result.recordset[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar disciplina.' });
    }
}

// READ (lista) — retorna só as disciplinas do usuário logado
async function getSubjects(req, res) {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('userId', sql.Int, req.userId)
            .query('SELECT * FROM subjects WHERE user_id = @userId ORDER BY created_at DESC');

        res.json({ subjects: result.recordset });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar disciplinas.' });
    }
}

// UPDATE — edita uma disciplina, mas só se pertencer ao usuário logado
async function updateSubject(req, res) {
    const { id } = req.params;
    const { name, teacher, workload_hours, description, start_date, end_date } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: 'Nome da disciplina precisa ter pelo menos 2 caracteres.' });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, req.userId)
            .input('name', sql.VarChar, name.trim())
            .input('teacher', sql.VarChar, teacher || null)
            .input('workloadHours', sql.Int, workload_hours || null)
            .input('description', sql.VarChar, description || null)
            .input('startDate', sql.Date, start_date || null)
            .input('endDate', sql.Date, end_date || null)
            .query(`
                UPDATE subjects
                SET name = @name, teacher = @teacher, workload_hours = @workloadHours,
                    description = @description, start_date = @startDate, end_date = @endDate
                OUTPUT INSERTED.*
                WHERE id = @id AND user_id = @userId
            `);

        // Se nenhuma linha foi afetada, ou a disciplina não existe,
        // ou não pertence a esse usuário — nos dois casos, resposta é a mesma
        // (não revelamos qual dos dois motivos foi, por segurança)
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Disciplina não encontrada.' });
        }

        res.json({ message: 'Disciplina atualizada com sucesso.', subject: result.recordset[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar disciplina.' });
    }
}

// DELETE — remove uma disciplina, só se pertencer ao usuário logado
async function deleteSubject(req, res) {
    const { id } = req.params;

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, req.userId)
            .query('DELETE FROM subjects OUTPUT DELETED.id WHERE id = @id AND user_id = @userId');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Disciplina não encontrada.' });
        }

        res.json({ message: 'Disciplina excluída com sucesso.' });

    } catch (err) {
        // Erro 547: violação de FK — significa que existem tarefas
        // vinculadas a essa disciplina, então o banco recusa o delete
        if (err.number === 547) {
            return res.status(409).json({ error: 'Não é possível excluir: existem tarefas vinculadas a esta disciplina.' });
        }
        console.error(err);
        res.status(500).json({ error: 'Erro ao excluir disciplina.' });
    }
}

module.exports = { createSubject, getSubjects, updateSubject, deleteSubject };