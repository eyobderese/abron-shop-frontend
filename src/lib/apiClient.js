const API_BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

let accessToken = null;
let refreshPromise = null;

function errorMessage(payload, fallback) {
  if (Array.isArray(payload?.message)) return payload.message.join(', ');
  return payload?.message || fallback;
}

async function parse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (response) => {
        const payload = await parse(response);
        if (!response.ok) throw new Error(errorMessage(payload, 'Session expired'));
        accessToken = payload.accessToken;
        return payload;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, options = {}, retry = true) {
  const headers = new Headers(options.headers || {});
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body:
      options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
  });

  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    try {
      await refreshAccessToken();
      return request(path, options, false);
    } catch {
      accessToken = null;
    }
  }

  const payload = await parse(response);
  if (!response.ok) {
    const error = new Error(errorMessage(payload, `Request failed (${response.status})`));
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, file) => {
    const body = new FormData();
    body.append('file', file);
    return request(path, { method: 'POST', body });
  },
};

export const authApi = {
  async login(email, password) {
    const result = await request('/auth/login', { method: 'POST', body: { email, password } }, false);
    accessToken = result.accessToken;
    return result;
  },
  async restore() {
    try {
      return await refreshAccessToken();
    } catch {
      accessToken = null;
      return null;
    }
  },
  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' }, false);
    } finally {
      accessToken = null;
    }
  },
};
