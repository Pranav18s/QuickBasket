const express = require('express');
const rateLimit = require('express-rate-limit');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const router = express.Router();
const assistantLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many assistant requests. Please wait a moment.' },
});

const SYSTEM_PROMPT = `You are QuickBasket's friendly grocery shopping assistant for a portfolio demo focused on Edappal and Vattamkulam, Kerala.
Help customers discover grocery items, plan simple shopping lists, and suggest alternatives.
Be concise, polite, and clear. Do not claim that a product is actually in stock, that a price is current, or that an order has been placed. The catalogue and stock are demo data.
Never request passwords, OTPs, full payment card details, or other sensitive secrets.
If asked about payment, delivery, or live inventory, explain that this demo does not yet process real orders or deliveries.`;

router.post('/chat', assistantLimiter, asyncHandler(async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : [];

  if (!message || message.length > 1200) {
    throw new ApiError(400, 'Message is required and must be 1,200 characters or fewer.');
  }

  const apiKey = process.env.AI_PROVIDER_API_KEY;
  if (!apiKey) {
    throw new ApiError(503, 'The AI assistant is not configured yet. Add AI_PROVIDER_API_KEY to the backend environment.');
  }

  const safeHistory = history
    .filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
    .map((item) => ({ role: item.role, content: item.content.slice(0, 1200) }));

  const baseUrl = (process.env.AI_PROVIDER_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  let providerResponse;
  try {
    providerResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...safeHistory,
          { role: 'user', content: message },
        ],
        temperature: 0.4,
        max_tokens: 350,
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new ApiError(502, 'The AI provider could not be reached. Please try again.');
  }

  if (!providerResponse.ok) {
    // Do not return provider response bodies or credentials to the browser.
    console.error('[AI] Provider request failed with status', providerResponse.status);
    throw new ApiError(providerResponse.status === 429 ? 429 : 502, 'The AI assistant is temporarily unavailable.');
  }

  const payload = await providerResponse.json();
  const reply = payload.choices?.[0]?.message?.content;
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new ApiError(502, 'The AI provider returned an empty response.');
  }

  res.json({ success: true, data: { reply: reply.trim(), model } });
}));

module.exports = router;
