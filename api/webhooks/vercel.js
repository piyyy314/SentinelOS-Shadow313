const crypto = require('crypto');
const MAX_BODY_BYTES = Number(process.env.WEBHOOK_MAX_BODY_BYTES || 256 * 1024);
const RATE_LIMIT_WINDOW_SECONDS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 60);
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_SECONDS * 1000;
const WEBHOOK_RATE_LIMIT_MAX = Number(process.env.WEBHOOK_RATE_LIMIT_MAX || 60);
const rateLimitHits = new Map();

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
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
      throw new Error('Request body too large');
    }
  }
  return body;
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(key, limit) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const hits = (rateLimitHits.get(key) || []).filter((timestamp) => timestamp > windowStart);
  if (hits.length >= limit) {
    rateLimitHits.set(key, hits);
    return false;
  }
  hits.push(now);
  rateLimitHits.set(key, hits);
  return true;
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

  if (!checkRateLimit(`vercel-webhook:${getClientIp(req)}`, WEBHOOK_RATE_LIMIT_MAX)) {
    res.setHeader('Retry-After', String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
    return sendJson(res, 429, { error: 'Too many requests. Please retry shortly.' });
  }

  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    console.error('VERCEL_WEBHOOK_SECRET is not configured');
    return sendJson(res, 503, { error: 'Webhook receiver is not configured' });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body';
    return sendJson(res, message === 'Request body too large' ? 413 : 400, { error: message });
  }
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
