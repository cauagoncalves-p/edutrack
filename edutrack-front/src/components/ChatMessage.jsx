import ReactMarkdown from 'react-markdown';

// User messages are plain text; AI answers are rendered as Markdown.
// react-markdown does not render raw HTML, so AI output cannot inject markup.
export default function ChatMessage({ role, content }) {
      if (role === 'note') {
        return <div className="chat-note">{content}</div>;
    }

    const isUser = role === 'user';

    return (
        <div className={`chat-row ${isUser ? 'chat-row-user' : 'chat-row-ai'}`}>
            {!isUser && <div className="chat-avatar">🎓</div>}
            <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                {isUser ? (
                    <p className="chat-text">{content}</p>
                ) : (
                    <div className="chat-markdown">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}