function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  return sendJson(res, 200, {
    mode: 'local-ollama-cli',
    reply:
      'SHADOW313 is configured for Local Ollama CLI mode. Vercel cannot reach Ollama on your computer at localhost:11434. Run this locally instead:\n\nollama serve\nollama pull mistral:7b\nshadow313 config --set ai.backend ollama\nshadow313 config --set ai.endpoint http://localhost:11434\nshadow313 config --set ai.model mistral:7b\nshadow313 ask "hello"\n\nThe web page remains a static demo; live Ollama responses run from your local CLI.',
  });
};
