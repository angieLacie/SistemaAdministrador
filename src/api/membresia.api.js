import { http } from "./https";

// ── Membresías ────────────────────────────────────────────
export const membresiasApi = {
  listar:  (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.periodo) params.append("periodo", filtros.periodo);
    if (filtros.search)  params.append("search",  filtros.search);
    const query = params.toString();
    return http.get(`/api/Membresia${query ? `?${query}` : ""}`);
  },
  resumen:  ()             => http.get("/api/Membresia/resumen"),
  obtener:  (id)           => http.get(`/api/Membresia/${id}`),
  reporte:  (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.periodo) params.append("periodo", filtros.periodo);
    const query = params.toString();
    return http.get(`/api/Membresia/reporte${query ? `?${query}` : ""}`);
  },
  crear:    (payload)      => http.post("/api/Membresia", payload),
  editar:   (id, payload)  => http.put(`/api/Membresia/${id}`, payload),
  eliminar: (id)           => http.del(`/api/Membresia/${id}`),
};

// ── OC Proveedor ──────────────────────────────────────────
export const membresiaOCApi = {
  listarPorMembresia: (idMembresia)   => http.get(`/api/MembresiaOC/membresia/${idMembresia}`),
  obtener:            (id)            => http.get(`/api/MembresiaOC/${id}`),
  crear:              (payload)       => http.post("/api/MembresiaOC", payload),
  editar:             (id, payload)   => http.put(`/api/MembresiaOC/${id}`, payload),
  eliminar:           (id)            => http.del(`/api/MembresiaOC/${id}`),
};

// ── HES Proveedor ─────────────────────────────────────────
export const membresiaHESApi = {
  listarPorOC: (idMembresiaOC)   => http.get(`/api/MembresiaHES/oc/${idMembresiaOC}`),
  obtener:     (id)              => http.get(`/api/MembresiaHES/${id}`),
  crear:       (payload)         => http.post("/api/MembresiaHES", payload),
  editar:      (id, payload)     => http.put(`/api/MembresiaHES/${id}`, payload),
  eliminar:    (id)              => http.del(`/api/MembresiaHES/${id}`),
};

// ── OC Cliente ────────────────────────────────────────────
export const membresiaOCClienteApi = {
  listarPorMembresia: (idMembresia)   => http.get(`/api/MembresiaOCCliente/membresia/${idMembresia}`),
  obtener:            (id)            => http.get(`/api/MembresiaOCCliente/${id}`),
  crear:              (payload)       => http.post("/api/MembresiaOCCliente", payload),
  editar:             (id, payload)   => http.put(`/api/MembresiaOCCliente/${id}`, payload),
  eliminar:           (id)            => http.del(`/api/MembresiaOCCliente/${id}`),
};

// ── HES Cliente ───────────────────────────────────────────
export const membresiaHESClienteApi = {
  listarPorOcCliente: (idOcCliente)   => http.get(`/api/MembresiaHESCliente/occliente/${idOcCliente}`),
  obtener:            (id)            => http.get(`/api/MembresiaHESCliente/${id}`),
  crear:              (payload)       => http.post("/api/MembresiaHESCliente", payload),
  editar:             (id, payload)   => http.put(`/api/MembresiaHESCliente/${id}`, payload),
  eliminar:           (id)            => http.del(`/api/MembresiaHESCliente/${id}`),
};

// ── Facturación ───────────────────────────────────────────
export const membresiaFacturacionApi = {
  listarPorHes: (idHesCliente)   => http.get(`/api/MembresiaFacturacion/hes/${idHesCliente}`),
  obtener:      (id)             => http.get(`/api/MembresiaFacturacion/${id}`),
  crear:        (payload)        => http.post("/api/MembresiaFacturacion", payload),
  editar:       (id, payload)    => http.put(`/api/MembresiaFacturacion/${id}`, payload),
  eliminar:     (id)             => http.del(`/api/MembresiaFacturacion/${id}`),
};
