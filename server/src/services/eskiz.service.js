/**
 * Eskiz.uz SMS gateway service
 * Docs: https://documenter.getpostman.com/view/663428/RzfmES4z
 */
const env = require('../config/env');

const BASE_URL = 'https://notify.eskiz.uz/api';
let cachedToken = null;
let tokenExpiresAt = 0;

/* ── Get / refresh token ── */
const getToken = async () => {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const form = new URLSearchParams();
  form.append('email',    env.ESKIZ_EMAIL);
  form.append('password', env.ESKIZ_PASSWORD);

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Eskiz auth failed: ${text}`);
  }

  const data = await res.json();
  cachedToken   = data.data?.token;
  // Token is valid 29 days — refresh 1 day early
  tokenExpiresAt = now + 28 * 24 * 60 * 60 * 1000;

  return cachedToken;
};

/* ── Send SMS ── */
const sendSms = async (phone, message) => {
  const token = await getToken();

  // Normalize: remove +, spaces, dashes; ensure starts with 998
  const normalized = phone.replace(/\D/g, '');
  const to = normalized.startsWith('998') ? normalized : `998${normalized}`;

  const form = new URLSearchParams();
  form.append('mobile_phone', to);
  form.append('message',      message);
  form.append('from',         env.ESKIZ_FROM || '4546');
  form.append('callback_url', '');

  const res = await fetch(`${BASE_URL}/message/sms/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    // Token may have expired — clear cache and retry once
    if (res.status === 401) {
      cachedToken   = null;
      tokenExpiresAt = 0;
      return sendSms(phone, message);
    }
    const text = await res.text();
    throw new Error(`Eskiz SMS failed: ${text}`);
  }

  const data = await res.json();
  return data;
};

/* ── Send OTP via Eskiz nick template ── */
const sendOtp = async (phone, code) => {
  const token = await getToken();

  const normalized = phone.replace(/\D/g, '');
  const to = normalized.startsWith('998') ? normalized : `998${normalized}`;

  const form = new URLSearchParams();
  form.append('mobile_phone', to);
  form.append('message',      `Avtojon platformasiga kirish uchun tasdiqlash kodi: ${code}`);
  form.append('from',         env.ESKIZ_FROM || '4546');
  form.append('callback_url', '');
  form.append('nick',         env.ESKIZ_NICK || '');

  const res = await fetch(`${BASE_URL}/message/sms/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    if (res.status === 401) {
      cachedToken   = null;
      tokenExpiresAt = 0;
      return sendOtp(phone, code);
    }
    const text = await res.text();
    throw new Error(`Eskiz SMS failed: ${text}`);
  }

  return res.json();
};

module.exports = { sendSms, sendOtp };
