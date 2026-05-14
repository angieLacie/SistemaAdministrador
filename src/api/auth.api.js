import { httpAuth } from "./https";

export const authApi = {
  login:        (payload) => httpAuth.post("/api/Auth/login", payload),
  cambiarClave: (payload) => httpAuth.post("/api/Auth/cambiar-clave", payload),
};