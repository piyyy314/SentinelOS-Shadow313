const crypto = require('crypto');

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.end(JSON.stringify(payload));
}

async function readRawBody(req) {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');

  let body = '';
  for await (const chunk of req) body += chunk;
  return body;
}

function hasValidSignature(signature, body, secret) {
  const expected = crypto.createHmac('sha1', secret).update(body).digest('hex');
  if (!signature || signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    console.error('VERCEL_WEBHOOK_SECRET is not configured');
    return sendJson(res, 503, { error: 'Webhook receiver is not configured' });
  }

  const rawBody = await readRawBody(req);
  if (!hasValidSignature(req.headers['x-vercel-signature'], rawBody, secret)) {
    return sendJson(res, 403, { error: 'Invalid webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  console.log('Vercel webhook received', {
    deploymentId: event.payload?.deployment?.id,
    projectId: event.payload?.project?.id,
    type: event.type,
  });

  return sendJson(res, 200, { received: true });
};
