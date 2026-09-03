const { sql, poolPromise } = require('../config/db');

// Status permitidos — usado para validar antes de mandar pro banco
// (evita depender só da CHECK constraint do SQL Server para dar feedback claro)
const VALID_STATUSES = ['pending', 'in_progress', 'completed'];

// Função auxiliar reaproveitada em várias operações: confirma que a
// disciplina informada existe E pertence ao usuário logado.
// Retorna true/false — evita repetir essa query em cada função
async function subjectBelongsToUser(pool, subjectId, userId) {
    const result = await pool.request()
        .input('subjectId', sql.Int, subjectId)
        .input('userId', sql.Int, userId)
        .query('SELECT id FROM subjects WHERE id = @subjectId AND user_id = @userId');

    return result.recordset.length > 0;
}

// CREATE — cria uma tarefa vinculada a uma disciplina
async function createTask(req, res) {
    const { subject_id, title, description, due_date, status } = req.body;

    if (!subject_id) {
        return res.status(400).json({ error: 'subject_id é obrigatório.' });
    }

    if (!title || title.trim().length < 2) {
        return res.status(400).json({ error: 'Título precisa ter pelo menos 2 caracteres.' });
    }

    // Se um status foi enviado, precisa ser um dos valores válidos.
    // Se não veio nenhum, deixamos undefined e o banco aplica o DEFAULT ('pending')
    if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Status inválido. Use um de: ${VALID_STATUSES.join(', ')}` });
    }

    try {
        const pool = await poolPromise;

        // Passo de segurança essencial: antes de criar a tarefa,
        // confirma que essa disciplina existe E é do usuário logado.
        // Sem isso, alguém poderia criar tarefas em disciplinas de outra pessoa
        // só sabendo o id (ex: subject_id = 7 de outro usuário)
        const belongsToUser = await subjectBelongsToUser(pool, subject_id, req.userId);
        if (!belongsToUser) {
            return res.status(404).json({ error: 'Disciplina não encontrada.' });
        }

        const result = await pool.request()
            .input('subjectId', sql.Int, subject_id)
            .input('title', sql.VarChar, title.trim())
            .input('description', sql.VarChar, description || null)
            .input('dueDate', sql.Date, due_date || null)
            .input('status', sql.VarChar, status || 'pending')
            .query(`
                INSERT INTO academic_tasks (subject_id, title, description, due_date, status)
                OUTPUT INSERTED.*
                VALUES (@subjectId, @title, @description, @dueDate, @status)
            `);

        res.status(201).json({ message: 'Tarefa criada com sucesso.', task: result.recordset[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar tarefa.' });
    }
}

// READ (lista) — retorna as tarefas de UMA disciplina específica
async function getTasksBySubject(req, res) {
    const { subjectId } = req.params;

    try {
        const pool = await poolPromise;

        // Mesma checagem de posse: só lista tarefas se a disciplina for do usuário
        const belongsToUser = await subjectBelongsToUser(pool, subjectId, req.userId);
        if (!belongsToUser) {
            return res.status(404).json({ error: 'Disciplina não encontrada.' });
        }

        const result = await pool.request()
            .input('subjectId', sql.Int, subjectId)
            .query('SELECT * FROM academic_tasks WHERE subject_id = @subjectId ORDER BY due_date ASC');

        res.json({ tasks: result.recordset });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar tarefas.' });
    }
}

// UPDATE — edita uma tarefa (incluindo mudar status)
async function updateTask(req, res) {
    const { id } = req.params;
    const { title, description, due_date, status } = req.body;

    if (!title || title.trim().length < 2) {
        return res.status(400).json({ error: 'Título precisa ter pelo menos 2 caracteres.' });
    }

    if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Status inválido. Use um de: ${VALID_STATUSES.join(', ')}` });
    }

    try {
        const pool = await poolPromise;

        // Aqui a checagem de posse é feita direto no UPDATE, via JOIN —
        // uma forma mais enxuta de fazer a mesma verificação que fizemos
        // separadamente no createTask, sem precisar de uma query extra antes
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, req.userId)
            .input('title', sql.VarChar, title.trim())
            .input('description', sql.VarChar, description || null)
            .input('dueDate', sql.Date, due_date || null)
            .input('status', sql.VarChar, status || 'pending')
            .query(`
                UPDATE t
                SET t.title = @title, t.description = @description,
                    t.due_date = @dueDate, t.status = @status
                OUTPUT INSERTED.*
                FROM academic_tasks t
                INNER JOIN subjects s ON s.id = t.subject_id
                WHERE t.id = @id AND s.user_id = @userId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }

        res.json({ message: 'Tarefa atualizada com sucesso.', task: result.recordset[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
    }
}

// DELETE — remove uma tarefa
async function deleteTask(req, res) {
    const { id } = req.params;

    try {
        const pool = await poolPromise;

        // Mesmo padrão de JOIN usado no update, agora para o delete
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, req.userId)
            .query(`
                DELETE t
                OUTPUT DELETED.id
                FROM academic_tasks t
                INNER JOIN subjects s ON s.id = t.subject_id
                WHERE t.id = @id AND s.user_id = @userId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }

        res.json({ message: 'Tarefa excluída com sucesso.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao excluir tarefa.' });
    }
}

module.exports = { createTask, getTasksBySubject, updateTask, deleteTask };