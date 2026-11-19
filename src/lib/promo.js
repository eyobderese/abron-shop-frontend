import { api } from './apiClient';

// A marketer's shared link (?ref=CODE) is remembered for 30 days, so the code is
// still pre-filled if the customer browses around or comes back later.
const KEY = 'abron.promo';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CODE_RE = /^[A-Za-z0-9_-]{3,30}$/;

export function normalizePromo(code) {
  return String(code || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function getStoredPromo() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!raw?.code || Date.now() - raw.at > TTL_MS) return '';
    return raw.code;
  } catch {
    return '';
  }
}

function storePromo(code) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
  } catch {
    /* storage unavailable: the customer can still type the code */
  }
}

/** Reads ?ref= from the URL, remembers it, and counts one visit per browser session. */
export function captureRefFromSearch(search) {
  const ref = new URLSearchParams(search).get('ref');
  if (!ref || !CODE_RE.test(ref.trim())) return;
  const code = normalizePromo(ref);
  storePromo(code);
  let seen = false;
  try {
    const key = `abron.promo.visit.${code}`;
    seen = sessionStorage.getItem(key) === '1';
    sessionStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
  if (!seen) api.post('/promo-codes/visit', { code }).catch(() => {});
}
