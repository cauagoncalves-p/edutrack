import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import ChatMessage from '../../components/ChatMessage';
import './Tutor.css';

// Keep in sync with TUTOR_MAX_MESSAGE_CHARS in the API .env
const MAX_CHARS = 2000;

const MODES = [
    { id: 'teacher', label: 'Professor', icon: '📖', hint: 'Explica passo a passo, com exemplos' },
    { id: 'exercises', label: 'Exercícios', icon: '📝', hint: 'Uma questão por vez, com correção' },
    { id: 'review', label: 'Revisão', icon: '🔁', hint: 'Resumos e perguntas de revisão' },
    { id: 'socratic', label: 'Socrático', icon: '💭', hint: 'Guia com perguntas, sem entregar a resposta' }
];

function getSuggestions(mode, subjectName) {
    const about = subjectName ? ` sobre ${subjectName}` : '';

    if (mode === 'exercises') {
        return [
            `Me faça uma questão de múltipla escolha${about}`,
            `Quero um exercício discursivo${about}`,
            'Comece com o nível iniciante'
        ];
    }
    if (mode === 'review') {
        return [
            `Faça um resumo dos principais conceitos${about}`,
            `Me faça perguntas de revisão${about}`,
            'Quais assuntos devo reforçar?'
        ];
    }
    if (mode === 'socratic') {
        return [
            `Quero entender melhor um conceito${about}. Me guie com perguntas`,
            'Me ajude a resolver um problema sem dar a resposta pronta',
            'Faça perguntas para eu raciocinar'
        ];
    }
    return subjectName
        ? [
              `Explique os conceitos principais de ${subjectName}`,
              `Dê um exemplo prático de ${subjectName}`,
              'Em quais tarefas devo focar primeiro?'
          ]
        : [
              'Explique o que é uma chave estrangeira',
              'Como funciona a autenticação com JWT?',
              'Qual a diferença entre PUT e PATCH?'
          ];
}

export default function Tutor() {
    const [searchParams] = useSearchParams();

    const [subjects, setSubjects] = useState([]);
    const [subjectId, setSubjectId] = useState('');
    const [mode, setMode] = useState('teacher');

    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const endRef = useRef(null);
    const textareaRef = useRef(null);

    const selectedSubject = subjects.find((s) => String(s.id) === subjectId) || null;
    const activeMode = MODES.find((m) => m.id === mode);
    const conversationStarted = conversationId !== null;

    // Loads the subjects and applies the ?subject=ID deep link (from the tasks page)
    useEffect(() => {
        api.get('/subjects')
            .then((res) => {
                const list = res.data.subjects;
                setSubjects(list);

                const fromUrl = searchParams.get('subject');
                if (fromUrl && list.some((s) => String(s.id) === fromUrl)) {
                    setSubjectId(fromUrl);
                }
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keeps the newest message in view
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    // Makes the textarea grow with its content (up to a limit)
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, [input]);

    async function sendMessage(text) {
        const content = text.trim();
        if (!content || sending) return;

        setError('');
        setSending(true);
        setInput('');
        // Optimistic bubble: shows the user message immediately
        setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: 'user', content }]);

        let id = conversationId;
        let createdNow = false;

        try {
            // The conversation is created lazily, on the first message,
            // with the subject and mode chosen at that moment
            if (!id) {
                const created = await api.post('/tutor/conversations', {
                    mode,
                    subject_id: subjectId ? Number(subjectId) : undefined
                });
                id = created.data.conversation.id;
                createdNow = true;
                setConversationId(id);
            }

            const response = await api.post(`/tutor/conversations/${id}/messages`, { content });

            setMessages((prev) => [
                ...prev,
                { id: `ai-${Date.now()}`, role: 'assistant', content: response.data.message.content }
            ]);
        } catch (err) {
            // Removes the optimistic bubble and gives the text back so the user can retry
            setMessages((prev) => prev.slice(0, -1));
            setInput(content);
            setError(err.response?.data?.error || 'Não foi possível falar com o tutor. Verifique sua conexão.');

            // Avoids leaving an empty conversation behind
            if (createdNow) {
                api.delete(`/tutor/conversations/${id}`).catch(() => {});
                setConversationId(null);
            }
        } finally {
            setSending(false);
        }
    }

    async function changeMode(newMode) {
        if (newMode === mode || sending) return;

        // Before the first message there is nothing to update on the server
        if (!conversationId) {
            setMode(newMode);
            return;
        }

        try {
            await api.put(`/tutor/conversations/${conversationId}`, { mode: newMode });
            setMode(newMode);
            setError('');
            const label = MODES.find((m) => m.id === newMode).label;
            setMessages((prev) => [
                ...prev,
                { id: `note-${Date.now()}`, role: 'note', content: `Modo alterado para ${label}` }
            ]);
        } catch (err) {
            setError(err.response?.data?.error || 'Não foi possível trocar o modo de estudo.');
        }
    }

    // Keeps the chosen subject and mode, so the next conversation starts configured
    function startNewConversation() {
        if (sending) return;
        setConversationId(null);
        setMessages([]);
        setInput('');
        setError('');
    }

    function handleKeyDown(e) {
        // Enter sends, Shift+Enter breaks the line (ignored while an IME is composing)
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-content">
                <div className="chat-page">
                    <div className="chat-header">
                        <div>
                            <h1 className="chat-title">Tutor Virtual</h1>
                            <p className="chat-subtitle">Estude com um professor particular de IA</p>
                        </div>
                        <button
                            type="button"
                            className="chat-new-btn"
                            onClick={startNewConversation}
                            disabled={sending || messages.length === 0}
                        >
                            + Nova conversa
                        </button>
                    </div>

                    <div className="chat-toolbar">
                        <div className="chat-subject-field">
                            <label className="chat-toolbar-label" htmlFor="chat-subject">Disciplina</label>
                            <select
                                id="chat-subject"
                                className="chat-select"
                                value={subjectId}
                                onChange={(e) => setSubjectId(e.target.value)}
                                disabled={conversationStarted || sending}
                                title={conversationStarted ? 'Para trocar de disciplina, inicie uma nova conversa' : ''}
                            >
                                <option value="">Conversa geral (sem disciplina)</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="chat-modes" role="group" aria-label="Modo de estudo">
                            {MODES.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    className={`chat-mode ${mode === m.id ? 'chat-mode-active' : ''}`}
                                    title={m.hint}
                                    onClick={() => changeMode(m.id)}
                                    disabled={sending}
                                >
                                    {m.icon} {m.label}
                                </button>
                            ))}
                        </div>

                        <p className="chat-hint">
                            {activeMode.icon} {activeMode.hint}
                            {selectedSubject
                                ? ` · O tutor conhece a descrição e as tarefas de ${selectedSubject.name}`
                                : ' · Sem disciplina: o tutor usa conhecimento geral'}
                        </p>
                    </div>

                    <div className="chat-panel">
                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <div className="chat-welcome">
                                    <div className="chat-welcome-icon">🎓</div>
                                    <p className="chat-welcome-title">
                                        {selectedSubject ? `Vamos estudar ${selectedSubject.name}?` : 'Olá! Eu sou o seu Tutor Virtual'}
                                    </p>
                                    <p className="chat-welcome-text">
                                        Pergunte o que quiser, ou comece por uma das sugestões abaixo.
                                    </p>
                                    <div className="chat-suggestions">
                                        {getSuggestions(mode, selectedSubject?.name).map((text) => (
                                            <button
                                                key={text}
                                                type="button"
                                                className="chat-suggestion"
                                                onClick={() => sendMessage(text)}
                                            >
                                                {text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((m) => (
                                <ChatMessage key={m.id} role={m.role} content={m.content} />
                            ))}

                            {sending && (
                                <div className="chat-row chat-row-ai">
                                    <div className="chat-avatar">🎓</div>
                                    <div className="chat-bubble chat-bubble-ai">
                                        <div className="chat-typing" aria-label="O tutor está digitando">
                                            <span /><span /><span />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={endRef} />
                        </div>

                        {error && (
                            <div className="chat-error" role="alert">
                                <span>{error}</span>
                                <button type="button" onClick={() => setError('')} aria-label="Fechar aviso">✕</button>
                            </div>
                        )}

                        {input.length > MAX_CHARS * 0.8 && (
                            <p className="chat-counter">{input.length}/{MAX_CHARS}</p>
                        )}

                        <div className="chat-composer">
                            <textarea
                                ref={textareaRef}
                                className="chat-input"
                                rows={1}
                                placeholder="Digite sua pergunta..."
                                aria-label="Mensagem para o tutor"
                                value={input}
                                maxLength={MAX_CHARS}
                                disabled={sending}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                type="button"
                                className="chat-send"
                                onClick={() => sendMessage(input)}
                                disabled={sending || !input.trim()}
                            >
                                Enviar
                            </button>
                        </div>
                    </div>

                    <p className="chat-disclaimer">O tutor pode cometer erros. Confira informações importantes.</p>
                </div>
            </main>
        </div>
    );
}