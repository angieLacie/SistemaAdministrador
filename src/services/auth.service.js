import { authApi } from "../api/auth.api";

const TOKEN_KEY   = "token";
const USUARIO_KEY = "usuario";

export const authService = {
  login: async (usuario, clave) => {
    const res = await authApi.login({ usuario, clave });
    localStorage.setItem(TOKEN_KEY,   res.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(res.usuario));
    return res;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  getUsuario: () => {
    const u = localStorage.getItem(USUARIO_KEY);
    return u ? JSON.parse(u) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  },

  cambiarClave: async (payload) => await authApi.cambiarClave(payload),
};