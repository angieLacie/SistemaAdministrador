import { http } from "./https";

export const c4SalesApi = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estadoPersonal) params.append("estadoPersonal", filtros.estadoPersonal);
    if (filtros.estadoLicencia) params.append("estadoLicencia", filtros.estadoLicencia);
    if (filtros.search)         params.append("search",         filtros.search);
    const query = params.toString();
    return http.get(`/api/C4Sales${query ? `?${query}` : ""}`);
  },
  resumen:        ()             => http.get("/api/C4Sales/resumen"),
  obtener:        (id)           => http.get(`/api/C4Sales/${id}`),
  historial:      (id)           => http.get(`/api/C4Sales/${id}/historial`),
  crear:          (payload)      => http.post("/api/C4Sales", payload),
  editar:         (id, payload)  => http.put(`/api/C4Sales/${id}`, payload),
  cambiarPersonal:(id, payload)  => http.put(`/api/C4Sales/${id}/cambiar-personal`, payload),
  eliminar:       (id)           => http.del(`/api/C4Sales/${id}`),
};
