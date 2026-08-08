const AI_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-5.5';
const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  let body = '';
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

function normalizeMessages(input) {
  const rawMessages = Array.isArray(input.messages)
    ? input.messages
    : [{ role: 'user', content: String(input.message || '') }];

  return rawMessages
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: String(message.content || '').slice(0, 4000),
    }))
    .filter((message) => message.content.trim());
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL;

  // In deployed Vercel Functions the OIDC token arrives on the request as the
  // `x-vercel-oidc-token` header. The VERCEL_OIDC_TOKEN env var is only populated
  // during builds and local development. An API key remains the explicit fallback.
  const gatewayToken =
    req.headers['x-vercel-oidc-token'] ||
    process.env.VERCEL_OIDC_TOKEN ||
    process.env.AI_GATEWAY_API_KEY;
  if (!ollamaBaseUrl && !gatewayToken) {
    return sendJson(res, 503, {
      error: 'Configure AI Gateway or OLLAMA_BASE_URL.',
      fallback: true,
    });
  }
  if (ollamaBaseUrl && !process.env.OLLAMA_MODEL) {
    return sendJson(res, 503, {
      error: 'Set OLLAMA_MODEL for the local Ollama provider.',
      fallback: true,
    });
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (_error) {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  const messages = normalizeMessages(payload);
  if (!messages.length) {
    return sendJson(res, 400, { error: 'A message is required' });
  }

  try {
    const systemMessage = {
      role: 'system',
      content:
        'You are SHADOW313 QTE, a concise quantum-computing assistant for a static Vercel demo. Be accurate, label simulations clearly, and never claim real quantum hardware execution unless the user provides external results.',
    };
    const allMessages = [systemMessage, ...messages];

    if (ollamaBaseUrl) {
      const baseUrl = ollamaBaseUrl.replace(/\/$/, '') || DEFAULT_OLLAMA_URL;
      const ollamaResponse = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL,
          messages: allMessages,
          options: { temperature: 0.4, num_predict: 500 },
          stream: false,
        }),
      });

      if (!ollamaResponse.ok) {
        const detail = await ollamaResponse.text();
        console.error('Ollama error', ollamaResponse.status, detail.slice(0, 500));
        return sendJson(res, 502, {
          error: 'The local Ollama service encountered a temporary issue.',
          fallback: true,
        });
      }

      const data = await ollamaResponse.json();
      const reply = data?.message?.content?.trim();
      if (!reply) {
        return sendJson(res, 502, {
          error: 'The local Ollama service returned an empty response.',
          fallback: true,
        });
      }

      return sendJson(res, 200, { reply });
    }

    const gatewayResponse = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gatewayToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.AI_GATEWAY_MODEL || DEFAULT_MODEL,
        temperature: 0.4,
        max_tokens: 500,
        messages: allMessages,
      }),
    });

    if (!gatewayResponse.ok) {
      const detail = await gatewayResponse.text();
      console.error('AI Gateway error', gatewayResponse.status, detail.slice(0, 500));
      return sendJson(res, 502, {
        error: 'The AI service encountered a temporary issue.',
        fallback: true,
      });
    }

    const data = await gatewayResponse.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return sendJson(res, 502, {
        error: 'The AI service returned an empty response.',
        fallback: true,
      });
    }

    return sendJson(res, 200, { reply });
  } catch (error) {
    console.error('AI chat failed', error);
    return sendJson(res, 502, {
      error: 'The AI service encountered a temporary issue.',
      fallback: true,
    });
  }
};
