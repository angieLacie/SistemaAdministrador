import { http } from "./https";

// ── Oficinas ─────────────────────────────────────────────
export const oficinasApi = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado)     params.append("estado",     filtros.estado);
    if (filtros.idEmpresa)  params.append("idEmpresa",  filtros.idEmpresa);
    if (filtros.numeroOc)   params.append("numeroOc",   filtros.numeroOc);
    const query = params.toString();
    return http.get(`/api/Oficinas${query ? `?${query}` : ""}`);
  },
  resumen:        ()             => http.get("/api/Oficinas/resumen"),
  obtener:        (id)           => http.get(`/api/Oficinas/${id}`),
  historial:      (id)           => http.get(`/api/Oficinas/${id}/historial`),
  crear:          (payload)      => http.post("/api/Oficinas", payload),
  editar:         (id, payload)  => http.put(`/api/Oficinas/${id}`, payload),
  cambiarUsuario: (id, payload)  => http.put(`/api/Oficinas/${id}/cambiar-usuario`, payload),
  eliminar:       (id)           => http.del(`/api/Oficinas/${id}`),

  // ── Reporte consolidado ───────────────────────────────
  reporte: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado)    params.append("estado",    filtros.estado);
    if (filtros.idEmpresa) params.append("idEmpresa", filtros.idEmpresa);
    const query = params.toString();
    return http.get(`/api/Oficinas/reporte${query ? `?${query}` : ""}`);
  },
};

// ── Empresas ─────────────────────────────────────────────
export const empresasApi = {
  listar:  ()             => http.get("/api/Empresas"),
  obtener: (id)           => http.get(`/api/Empresas/${id}`),
  crear:   (payload)      => http.post("/api/Empresas", payload),
  editar:  (id, payload)  => http.put(`/api/Empresas/${id}`, payload),
  eliminar:(id)           => http.del(`/api/Empresas/${id}`),
};

// ── Ordenes de Compra (proveedor) ─────────────────────────
export const ordenesCompraApi = {
  listar:           (estado = "")  => http.get(`/api/OrdenesCompra${estado ? `?estado=${estado}` : ""}`),
  listarPorOficina: (idOficina)    => http.get(`/api/OrdenesCompra/oficina/${idOficina}`),  // ← esta línea
  obtener:          (id)           => http.get(`/api/OrdenesCompra/${id}`),
  crear:            (payload)      => http.post("/api/OrdenesCompra", payload),
  editar:           (id, payload)  => http.put(`/api/OrdenesCompra/${id}`, payload),
  eliminar:         (id)           => http.del(`/api/OrdenesCompra/${id}`),
};

// ── Orden CO (catálogo) ───────────────────────────────────
export const ordenCOApi = {
  listar:  (idEmpresa)    => http.get(`/api/OrdenCO${idEmpresa ? `?idEmpresa=${idEmpresa}` : ""}`),
  obtener: (id)           => http.get(`/api/OrdenCO/${id}`),
  crear:   (payload)      => http.post("/api/OrdenCO", payload),
  editar:  (id, payload)  => http.put(`/api/OrdenCO/${id}`, payload),
  eliminar:(id)           => http.del(`/api/OrdenCO/${id}`),
};

// ── HES Proveedor ─────────────────────────────────────────
export const hesApi = {
  listarPorOc: (idOc)         => http.get(`/api/Hes/oc/${idOc}`),
  obtener:     (id)           => http.get(`/api/Hes/${id}`),
  crear:       (payload)      => http.post("/api/Hes", payload),
  editar:      (id, payload)  => http.put(`/api/Hes/${id}`, payload),
  eliminar:    (id)           => http.del(`/api/Hes/${id}`),
};

// ── OC Cliente ────────────────────────────────────────────
export const ocClienteApi = {
  listarPorOficina: (idOficina)    => http.get(`/api/OcCliente/oficina/${idOficina}`),
  obtener:          (id)           => http.get(`/api/OcCliente/${id}`),
  crear:            (payload)      => http.post("/api/OcCliente", payload),
  editar:           (id, payload)  => http.put(`/api/OcCliente/${id}`, payload),
  eliminar:         (id)           => http.del(`/api/OcCliente/${id}`),
};

// ── HES Cliente ───────────────────────────────────────────
export const hesClienteApi = {
  listarPorOcCliente: (idOcCliente)    => http.get(`/api/HesCliente/occliente/${idOcCliente}`),
  obtener:            (id)             => http.get(`/api/HesCliente/${id}`),
  crear:              (payload)        => http.post("/api/HesCliente", payload),
  editar:             (id, payload)    => http.put(`/api/HesCliente/${id}`, payload),
  eliminar:           (id)             => http.del(`/api/HesCliente/${id}`),
};

// ── Facturación ───────────────────────────────────────────
export const facturacionApi = {
  listarPorHes:       (idHesCliente)   => http.get(`/api/Facturacion/hes/${idHesCliente}`),
  listarPorOcCliente: (idOcCliente)    => http.get(`/api/Facturacion/occliente/${idOcCliente}`),
  obtener:            (id)             => http.get(`/api/Facturacion/${id}`),
  crear:              (payload)        => http.post("/api/Facturacion", payload),
  editar:             (id, payload)    => http.put(`/api/Facturacion/${id}`, payload),
  eliminar:           (id)             => http.del(`/api/Facturacion/${id}`),
};
