import { authService } from '@/services/auth.service';

const getAuthHeaders = () => {
  const token = authService.getToken();
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

const handleUnauthorized = () => {
  authService.logout();
  window.location.replace('/auth/login');
  throw new Error('Sesión expirada');
};

// ── Licencias ─────────────────────────────────────────
//const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://localhost:7279";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://10.9.1.113:7279";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {})
    },
    ...options
  });

  if (res.status === 401) { handleUnauthorized(); return; }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status} ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export const http = {
  get:  (path)        => request(path),
  post: (path, body)  => request(path, { method: "POST",   body: JSON.stringify(body) }),
  put:  (path, body)  => request(path, { method: "PUT",    body: JSON.stringify(body) }),
  del:  (path)        => request(path, { method: "DELETE" }),
};

// ── Gestion / Proyectos ───────────────────────────────
 const API_GESTION_BASE = import.meta.env.VITE_API_GESTION_URL || "http://10.9.1.113:7035";
//const API_GESTION_BASE = import.meta.env.VITE_API_GESTION_URL || "https://localhost:7035";
  
async function requestGestion(path, options = {}) {
  const res = await fetch(`${API_GESTION_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {})
    },
    ...options
  });

  if (res.status === 401) { handleUnauthorized(); return; }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status} ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export const httpGestion = {
  get:  (path)        => requestGestion(path),
  post: (path, body)  => requestGestion(path, { method: "POST",   body: JSON.stringify(body) }),
  put:  (path, body)  => requestGestion(path, { method: "PUT",    body: JSON.stringify(body) }),
  del:  (path)        => requestGestion(path, { method: "DELETE" }),
};

// ── Seguridad / Accesos ───────────────────────────────
 const API_SEGURIDAD_BASE = import.meta.env.VITE_API_SEGURIDAD_URL || "http://10.9.1.113:7191";
 //const API_SEGURIDAD_BASE = import.meta.env.VITE_API_SEGURIDAD_URL || "https://localhost:7191";

async function requestSeguridad(path, options = {}) {
  const res = await fetch(`${API_SEGURIDAD_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {})
    },
    ...options
  });

  if (res.status === 401) { handleUnauthorized(); return; }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status} ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export const httpSeguridad = {
  get:  (path)        => requestSeguridad(path),
  post: (path, body)  => requestSeguridad(path, { method: "POST",   body: JSON.stringify(body) }),
  put:  (path, body)  => requestSeguridad(path, { method: "PUT",    body: JSON.stringify(body) }),
  del:  (path)        => requestSeguridad(path, { method: "DELETE" }),
};

// ── Monitor ───────────────────────────────────────────
const API_MONITOR_BASE = import.meta.env.VITE_API_MONITOR_URL || "http://10.9.1.113:7235";
 //const API_MONITOR_BASE = import.meta.env.VITE_API_MONITOR_URL || "http://localhost:5145";

async function requestMonitor(path, options = {}) {
  const res = await fetch(`${API_MONITOR_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {})
    },
    ...options
  });

  if (res.status === 401) { handleUnauthorized(); return; }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status} ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export const httpMonitor = {
  get:  (path)        => requestMonitor(path),
  post: (path, body)  => requestMonitor(path, { method: "POST",   body: JSON.stringify(body) }),
  put:  (path, body)  => requestMonitor(path, { method: "PUT",    body: JSON.stringify(body) }),
  del:  (path)        => requestMonitor(path, { method: "DELETE" }),
};

// ── Auth — sin interceptor (login no requiere token) ──
const API_AUTH_BASE = import.meta.env.VITE_API_AUTH_URL || "http://10.9.1.113:7006";
 //const API_AUTH_BASE = import.meta.env.VITE_API_AUTH_URL || "https://localhost:7006";

async function requestAuth(path, options = {}) {
  const res = await fetch(`${API_AUTH_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status} ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export const httpAuth = {
  post: (path, body) => requestAuth(path, { method: "POST", body: JSON.stringify(body) }),
};

// ── Notificaciones ────────────────────────────────────
const API_NOTIF_BASE = import.meta.env.VITE_API_NOTIF_URL || "http://10.9.1.113:7400";
// const API_NOTIF_BASE = import.meta.env.VITE_API_NOTIF_URL || "https://localhost:7400";

async function requestNotificaciones(path, options = {}) {
  const res = await fetch(`${API_NOTIF_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {})
    },
    ...options
  });

  if (res.status === 401) { handleUnauthorized(); return; }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status} ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export const httpNotificaciones = {
  get:  (path)       => requestNotificaciones(path),
  post: (path, body) => requestNotificaciones(path, { method: "POST", body: JSON.stringify(body) }),
  put:  (path, body) => requestNotificaciones(path, { method: "PUT",  body: JSON.stringify(body) }),
  del:  (path)       => requestNotificaciones(path, { method: "DELETE" }),
};