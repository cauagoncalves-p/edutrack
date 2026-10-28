const { sql, poolPromise } = require('../config/db');
const llm = require('../services/llm.service');
const { MODES, buildSystemPrompt } = require('../services/tutor.prompts');

const MAX_MESSAGE_CHARS = parseInt(process.env.TUTOR_MAX_MESSAGE_CHARS, 10) || 2000;
const HISTORY_LIMIT = parseInt(process.env.TUTOR_HISTORY_LIMIT, 10) || 20;
const DAILY_LIMIT = parseInt(process.env.TUTOR_DAILY_LIMIT, 10) || 100;
const DEFAULT_TITLE = 'Nova conversa';

const LLM_ERROR_RESPONSES = {
    RATE_LIMITED: [429, 'O tutor está com muitas solicitações no momento. Tente novamente em instantes.'],
    TIMEOUT: [504, 'O tutor demorou demais para responder. Tente novamente.'],
    CONFIG: [503, 'O tutor ainda não está configurado corretamente.'],
    UNAVAILABLE: [503, 'O tutor está indisponível no momento. Tente novamente em instantes.'],
    EMPTY: [502, 'O tutor não conseguiu gerar uma resposta. Tente reformular a pergunta.']
};

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// Ownership check reused by every conversation endpoint
async function findOwnConversation(pool, conversationId, userId) {
    const result = await pool.request()
        .input('id', sql.Int, conversationId)
        .input('userId', sql.Int, userId)
        .query(`
            SELECT id, user_id, subject_id, mode, title
            FROM tutor_conversations
            WHERE id = @id AND user_id = @userId
        `);
    return result.recordset[0] || null;
}

async function createConversation(req, res) {
    const { subject_id, mode = 'teacher' } = req.body || {};

    if (!MODES.includes(mode)) {
        return res.status(400).json({ error: `Modo inválido. Use um de: ${MODES.join(', ')}` });
    }

    try {
        const pool = await poolPromise;
        let subjectId = null;

        if (subject_id !== undefined && subject_id !== null) {
            subjectId = parseId(subject_id);
            if (!subjectId) {
                return res.status(400).json({ error: 'subject_id inválido.' });
            }

            const subject = await pool.request()
                .input('id', sql.Int, subjectId)
                .input('userId', sql.Int, req.userId)
                .query('SELECT id FROM subjects WHERE id = @id AND user_id = @userId');

            if (subject.recordset.length === 0) {
                return res.status(404).json({ error: 'Disciplina não encontrada.' });
            }
        }

        const result = await pool.request()
            .input('userId', sql.Int, req.userId)
            .input('subjectId', sql.Int, subjectId)
            .input('mode', sql.VarChar, mode)
            .input('title', sql.NVarChar(150), DEFAULT_TITLE)
            .query(`
                INSERT INTO tutor_conversations (user_id, subject_id, mode, title)
                OUTPUT INSERTED.*
                VALUES (@userId, @subjectId, @mode, @title)
            `);

        res.status(201).json({ conversation: result.recordset[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar conversa.' });
    }
}

async function listConversations(req, res) {
    let subjectFilter = null;
    if (req.query.subject_id !== undefined) {
        subjectFilter = parseId(req.query.subject_id);
        if (!subjectFilter) {
            return res.status(400).json({ error: 'subject_id inválido.' });
        }
    }

    try {
        const pool = await poolPromise;
        const request = pool.request().input('userId', sql.Int, req.userId);

        let query = `
            SELECT c.id, c.title, c.mode, c.subject_id, s.name AS subject_name,
                   c.created_at, c.updated_at
            FROM tutor_conversations c
            LEFT JOIN subjects s ON s.id = c.subject_id
            WHERE c.user_id = @userId
        `;

        if (subjectFilter) {
            request.input('subjectId', sql.Int, subjectFilter);
            query += ' AND c.subject_id = @subjectId';
        }

        query += ' ORDER BY c.updated_at DESC';

        const result = await request.query(query);
        res.json({ conversations: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao listar conversas.' });
    }
}

async function getConversation(req, res) {
    const conversationId = parseId(req.params.id);
    if (!conversationId) {
        return res.status(404).json({ error: 'Conversa não encontrada.' });
    }

    try {
        const pool = await poolPromise;
        const conversation = await findOwnConversation(pool, conversationId, req.userId);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversa não encontrada.' });
        }

        const messages = await pool.request()
            .input('conversationId', sql.Int, conversationId)
            .query(`
                SELECT id, role, content, created_at
                FROM tutor_messages
                WHERE conversation_id = @conversationId
                ORDER BY id ASC
            `);

        res.json({ conversation, messages: messages.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar conversa.' });
    }
}

async function updateConversation(req, res) {
    const conversationId = parseId(req.params.id);
    const { mode } = req.body || {};

    if (!MODES.includes(mode)) {
        return res.status(400).json({ error: `Modo inválido. Use um de: ${MODES.join(', ')}` });
    }
    if (!conversationId) {
        return res.status(404).json({ error: 'Conversa não encontrada.' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, conversationId)
            .input('userId', sql.Int, req.userId)
            .input('mode', sql.VarChar, mode)
            .query(`
                UPDATE tutor_conversations
                SET mode = @mode
                OUTPUT INSERTED.*
                WHERE id = @id AND user_id = @userId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Conversa não encontrada.' });
        }

        res.json({ conversation: result.recordset[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar conversa.' });
    }
}

async function deleteConversation(req, res) {
    const conversationId = parseId(req.params.id);
    if (!conversationId) {
        return res.status(404).json({ error: 'Conversa não encontrada.' });
    }

    try {
        const pool = await poolPromise;
        // Messages are removed by ON DELETE CASCADE
        const result = await pool.request()
            .input('id', sql.Int, conversationId)
            .input('userId', sql.Int, req.userId)
            .query('DELETE FROM tutor_conversations OUTPUT DELETED.id WHERE id = @id AND user_id = @userId');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Conversa não encontrada.' });
        }

        res.json({ message: 'Conversa excluída com sucesso.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao excluir conversa.' });
    }
}

async function sendMessage(req, res) {
    const conversationId = parseId(req.params.id);
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

    if (!content) {
        return res.status(400).json({ error: 'A mensagem não pode estar vazia.' });
    }
    if (content.length > MAX_MESSAGE_CHARS) {
        return res.status(400).json({ error: `A mensagem pode ter no máximo ${MAX_MESSAGE_CHARS} caracteres.` });
    }
    if (!conversationId) {
        return res.status(404).json({ error: 'Conversa não encontrada.' });
    }

    try {
        const pool = await poolPromise;

        const conversation = await findOwnConversation(pool, conversationId, req.userId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversa não encontrada.' });
        }

        // Daily limit: counts the user's messages stored today
        const usage = await pool.request()
            .input('userId', sql.Int, req.userId)
            .query(`
                SELECT COUNT(*) AS total
                FROM tutor_messages m
                INNER JOIN tutor_conversations c ON c.id = m.conversation_id
                WHERE c.user_id = @userId
                  AND m.role = 'user'
                  AND m.created_at >= CAST(GETDATE() AS DATE)
            `);

        if (usage.recordset[0].total >= DAILY_LIMIT) {
            return res.status(429).json({ error: 'Você atingiu o limite diário de mensagens do tutor. Volte amanhã.' });
        }

        // Subject context (the subject may have been deleted: subject_id is then NULL)
        let subject = null;
        let tasks = [];
        if (conversation.subject_id) {
            const subjectResult = await pool.request()
                .input('subjectId', sql.Int, conversation.subject_id)
                .input('userId', sql.Int, req.userId)
                .query(`
                    SELECT name, teacher, workload_hours, description
                    FROM subjects
                    WHERE id = @subjectId AND user_id = @userId
                `);
            subject = subjectResult.recordset[0] || null;

            if (subject) {
                const tasksResult = await pool.request()
                    .input('subjectId', sql.Int, conversation.subject_id)
                    .query(`
                        SELECT title, status, due_date
                        FROM academic_tasks
                        WHERE subject_id = @subjectId
                        ORDER BY due_date ASC
                    `);
                tasks = tasksResult.recordset;
            }
        }

        // Last N messages, oldest first
        const historyResult = await pool.request()
            .input('conversationId', sql.Int, conversation.id)
            .input('limit', sql.Int, HISTORY_LIMIT)
            .query(`
                SELECT TOP (@limit) role, content
                FROM tutor_messages
                WHERE conversation_id = @conversationId
                ORDER BY id DESC
            `);

        const history = historyResult.recordset.reverse();
        // The provider expects the conversation to start with a user message
        while (history.length > 0 && history[0].role !== 'user') {
            history.shift();
        }

        let answer;
        try {
            answer = await llm.generate({
                systemPrompt: buildSystemPrompt({ mode: conversation.mode, subject, tasks }),
                messages: [...history, { role: 'user', content }]
            });
        } catch (err) {
            if (err instanceof llm.LlmError) {
                const [status, message] = LLM_ERROR_RESPONSES[err.code] || LLM_ERROR_RESPONSES.UNAVAILABLE;
                return res.status(status).json({ error: message });
            }
            throw err;
        }

        // The first message becomes the conversation title
        const title = conversation.title === DEFAULT_TITLE
            ? content.replace(/\s+/g, ' ').slice(0, 60)
            : conversation.title;

        // Saved only after the AI answered, so a failed call never leaves an orphan question
        await pool.request()
            .input('conversationId', sql.Int, conversation.id)
            .input('userContent', sql.NVarChar(sql.MAX), content)
            .input('assistantContent', sql.NVarChar(sql.MAX), answer)
            .input('title', sql.NVarChar(150), title)
            .query(`
                SET XACT_ABORT ON;
                BEGIN TRANSACTION;
                INSERT INTO tutor_messages (conversation_id, role, content)
                VALUES (@conversationId, 'user', @userContent);
                INSERT INTO tutor_messages (conversation_id, role, content)
                VALUES (@conversationId, 'assistant', @assistantContent);
                UPDATE tutor_conversations
                SET updated_at = GETDATE(), title = @title
                WHERE id = @conversationId;
                COMMIT TRANSACTION;
            `);

        res.json({
            message: { role: 'assistant', content: answer },
            conversation: { id: conversation.id, title }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao enviar mensagem.' });
    }
}

module.exports = {
    createConversation,
    listConversations,
    getConversation,
    updateConversation,
    deleteConversation,
    sendMessage
};