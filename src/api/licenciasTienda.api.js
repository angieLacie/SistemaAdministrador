import { http } from "./https";

export const licenciasTiendaApi = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.empresa) params.append("empresa", filtros.empresa);
    if (filtros.periodo) params.append("periodo", filtros.periodo);
    if (filtros.estado)  params.append("estado",  filtros.estado);
    if (filtros.search)  params.append("search",  filtros.search);
    const query = params.toString();
    return http.get(`/api/LicenciasTienda${query ? `?${query}` : ""}`);
  },
  resumen:    ()            => http.get("/api/LicenciasTienda/resumen"),
  obtener:    (id)          => http.get(`/api/LicenciasTienda/${id}`),
  crear:      (payload)     => http.post("/api/LicenciasTienda", payload),
  editar:     (id, payload) => http.put(`/api/LicenciasTienda/${id}`, payload),
  eliminar:   (id)          => http.del(`/api/LicenciasTienda/${id}`),
  addCaja:    (id, payload) => http.post(`/api/LicenciasTienda/${id}/caja`, payload),
  updateCaja: (id, idCaja, payload) => http.put(`/api/LicenciasTienda/${id}/caja/${idCaja}`, payload),
  deleteCaja: (id, idCaja) => http.del(`/api/LicenciasTienda/${id}/caja/${idCaja}`),
};

export const licenciaTiendaOCProvApi = {
  listarPorTienda: (idTienda)       => http.get(`/api/LicenciaTiendaOCProveedor/tienda/${idTienda}`),
  crear:           (payload)        => http.post("/api/LicenciaTiendaOCProveedor", payload),
  editar:          (id, payload)    => http.put(`/api/LicenciaTiendaOCProveedor/${id}`, payload),
  eliminar:        (id)             => http.del(`/api/LicenciaTiendaOCProveedor/${id}`),
  addHES:          (idOC, payload)  => http.post(`/api/LicenciaTiendaOCProveedor/${idOC}/hes`, payload),
  updateHES:       (id, payload)    => http.put(`/api/LicenciaTiendaOCProveedor/hes/${id}`, payload),
  deleteHES:       (id)             => http.del(`/api/LicenciaTiendaOCProveedor/hes/${id}`),
};

export const licenciaTiendaOCCliApi = {
  listarPorTienda: (idTienda)       => http.get(`/api/LicenciaTiendaOCCliente/tienda/${idTienda}`),
  crear:           (payload)        => http.post("/api/LicenciaTiendaOCCliente", payload),
  editar:          (id, payload)    => http.put(`/api/LicenciaTiendaOCCliente/${id}`, payload),
  eliminar:        (id)             => http.del(`/api/LicenciaTiendaOCCliente/${id}`),
  addHES:          (idOC, payload)  => http.post(`/api/LicenciaTiendaOCCliente/${idOC}/hes`, payload),
  updateHES:       (id, payload)    => http.put(`/api/LicenciaTiendaOCCliente/hes/${id}`, payload),
  deleteHES:       (id)             => http.del(`/api/LicenciaTiendaOCCliente/hes/${id}`),
};