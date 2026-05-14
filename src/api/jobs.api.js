import { httpGestion } from "./https";

export const jobsApi = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.tipo)   params.append("tipo",   filtros.tipo);
    if (filtros.estado) params.append("estado", filtros.estado);
    const query = params.toString();
    return httpGestion.get(`/api/Jobs${query ? `?${query}` : ""}`);
  },
  obtener:       (id)          => httpGestion.get(`/api/Jobs/${id}`),
  crear:         (payload)     => httpGestion.post(`/api/Jobs`, payload),        // ← NUEVO
  editar:        (id, payload) => httpGestion.put(`/api/Jobs/${id}`, payload),
  cambiarEstado: (id, payload) => httpGestion.put(`/api/Jobs/${id}/estado`, payload),
};