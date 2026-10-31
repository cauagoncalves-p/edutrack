import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

// Defined outside the component so the plugin list is not recreated on every render.
// ignoreMissing: unknown languages render as plain code instead of throwing an error.
const REHYPE_PLUGINS = [[rehypeHighlight, { ignoreMissing: true }]];

// User messages are plain text; AI answers are rendered as Markdown.
// react-markdown does not render raw HTML, so AI output cannot inject markup.
export default function ChatMessage({ role, content }) {
    // Local note shown when the study mode changes (never sent to the AI)
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
                        <ReactMarkdown rehypePlugins={REHYPE_PLUGINS}>{content}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}