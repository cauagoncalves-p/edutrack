const axios = require('axios');

class LlmError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'LlmError';
        // CONFIG | RATE_LIMITED | TIMEOUT | UNAVAILABLE | EMPTY
        this.code = code;
    }
}

// Read at call time so changes to .env (after a restart) are always respected
function getConfig() {
    return {
        provider: (process.env.LLM_PROVIDER || 'gemini').toLowerCase(),
        apiKey: process.env.LLM_API_KEY,
        model: process.env.LLM_MODEL,
        maxOutputTokens: parseInt(process.env.LLM_MAX_OUTPUT_TOKENS, 10) || 2048,
        timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS, 10) || 30000
    };
}

async function callGemini({ systemPrompt, messages }, config) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`;

    const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        // Gemini uses the role "model" where we store "assistant"
        contents: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        })),
        generationConfig: {
            maxOutputTokens: config.maxOutputTokens,
            temperature: 0.7
        }
    };

    const response = await axios.post(url, body, {
        headers: { 'x-goog-api-key': config.apiKey, 'Content-Type': 'application/json' },
        timeout: config.timeoutMs
    });

    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text || '').join('').trim();

    if (!text) {
        throw new LlmError('EMPTY', 'Provider returned an empty response');
    }
    return text;
}

// To support another provider, add a function here and set LLM_PROVIDER
const providers = { gemini: callGemini };

async function generate(request) {
    const config = getConfig();

    if (!config.apiKey || !config.model) {
        console.error('LLM_API_KEY or LLM_MODEL is not set');
        throw new LlmError('CONFIG', 'LLM is not configured');
    }

    const call = providers[config.provider];
    if (!call) {
        console.error(`Unknown LLM_PROVIDER: ${config.provider}`);
        throw new LlmError('CONFIG', 'Unknown LLM provider');
    }

    try {
        return await call(request, config);
    } catch (err) {
        if (err instanceof LlmError) throw err;

        // Never log the whole axios error: it includes request headers (the API key)
        const status = err.response?.status;
        console.error('LLM request failed:', { status, code: err.code, data: err.response?.data });

        if (err.code === 'ECONNABORTED') throw new LlmError('TIMEOUT', 'Provider timed out');
        if (status === 429) throw new LlmError('RATE_LIMITED', 'Provider rate limit reached');
        if (status === 401 || status === 403 || status === 404) throw new LlmError('CONFIG', 'Provider rejected credentials or model');
        throw new LlmError('UNAVAILABLE', 'Provider unavailable');
    }
}

module.exports = { generate, LlmError };