import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import ChatMessage from '../../components/ChatMessage';
import './Tutor.css';

// Keep in sync with TUTOR_MAX_MESSAGE_CHARS in the API .env
const MAX_CHARS = 2000;

const SUGGESTIONS = [
    'Explique o que é uma chave estrangeira',
    'Como funciona a autenticação com JWT?',
    'Qual a diferença entre PUT e PATCH?'
];

export default function Tutor() {
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const endRef = useRef(null);
    const textareaRef = useRef(null);

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
            // The conversation is created lazily, on the first message
            if (!id) {
                const created = await api.post('/tutor/conversations', { mode: 'teacher' });
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
                            <p className="chat-subtitle">Tire dúvidas e estude com um professor particular de IA</p>
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

                    <div className="chat-panel">
                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <div className="chat-welcome">
                                    <div className="chat-welcome-icon">🎓</div>
                                    <p className="chat-welcome-title">Olá! Eu sou o seu Tutor Virtual</p>
                                    <p className="chat-welcome-text">
                                        Pergunte qualquer coisa sobre o que você está estudando. Posso explicar conceitos,
                                        dar exemplos e ajudar com exercícios.
                                    </p>
                                    <div className="chat-suggestions">
                                        {SUGGESTIONS.map((text) => (
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