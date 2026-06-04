import { httpGestion } from "./https";

export const proyectosApi = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado)   params.append("estado",   filtros.estado);
    if (filtros.analista) params.append("analista",  filtros.analista);
    if (filtros.periodo)  params.append("periodo",   filtros.periodo);
    if (filtros.search)   params.append("search",    filtros.search);
    const query = params.toString();
    return httpGestion.get(`/api/Proyectos${query ? `?${query}` : ""}`);
  },
  resumen:         ()           => httpGestion.get("/api/Proyectos/resumen"),
  vistaMensual:    (anio, mes, filtros = {}) => {
    const params = new URLSearchParams({ anio, mes });
    if (filtros.analista) params.append('analista', filtros.analista);
    if (filtros.estado)   params.append('estado',   filtros.estado);
    if (filtros.search)   params.append('search',   filtros.search);
    return httpGestion.get(`/api/Proyectos/vista-mensual?${params.toString()}`);
  },
  obtener:         (id)         => httpGestion.get(`/api/Proyectos/${id}`),
  crear:           (payload)    => httpGestion.post("/api/Proyectos", payload),
  editar:          (id, payload)=> httpGestion.put(`/api/Proyectos/${id}`, payload),
  eliminar:        (id)         => httpGestion.del(`/api/Proyectos/${id}`),
  updateCronograma:    (id, payload)        => httpGestion.put(`/api/Proyectos/${id}/cronograma`, payload),
  dashboard:           ()                   => httpGestion.get("/api/Proyectos/dashboard"),
  disponiblesParaMes:  (anio, mes)          => httpGestion.get(`/api/Proyectos/disponibles-para-mes?anio=${anio}&mes=${mes}`),
  copiarPeriodo:       (payload)            => httpGestion.post("/api/Proyectos/copiar-periodo", payload),
};

export const proyectoOCProveedorApi = {
  listarPorProyecto: (codProy)        => httpGestion.get(`/api/ProyectoOCProveedor/proyecto/${codProy}`),
  crear:             (payload)        => httpGestion.post("/api/ProyectoOCProveedor", payload),
  editar:            (id, payload)    => httpGestion.put(`/api/ProyectoOCProveedor/${id}`, payload),
  eliminar:          (id)             => httpGestion.del(`/api/ProyectoOCProveedor/${id}`),
  addHES:            (idOC, payload)  => httpGestion.post(`/api/ProyectoOCProveedor/${idOC}/hes`, payload),
  updateHES:         (id, payload)    => httpGestion.put(`/api/ProyectoOCProveedor/hes/${id}`, payload),
  deleteHES:         (id)             => httpGestion.del(`/api/ProyectoOCProveedor/hes/${id}`),
};

export const proyectoOCClienteApi = {
  listarPorProyecto: (codProy)        => httpGestion.get(`/api/ProyectoOCCliente/proyecto/${codProy}`),
  crear:             (payload)        => httpGestion.post("/api/ProyectoOCCliente", payload),
  editar:            (id, payload)    => httpGestion.put(`/api/ProyectoOCCliente/${id}`, payload),
  eliminar:          (id)             => httpGestion.del(`/api/ProyectoOCCliente/${id}`),
  addHES:            (idOC, payload)  => httpGestion.post(`/api/ProyectoOCCliente/${idOC}/hes`, payload),
  updateHES:         (id, payload)    => httpGestion.put(`/api/ProyectoOCCliente/hes/${id}`, payload),
  deleteHES:         (id)             => httpGestion.del(`/api/ProyectoOCCliente/hes/${id}`),
};

export const proyectoHorasApi = {
  getByProyecto:         (codProy)          => httpGestion.get(`/api/ProyectoHoras/proyecto/${codProy}`),
  updateHoras:           (codProy, payload) => httpGestion.put(`/api/ProyectoHoras/proyecto/${codProy}`, payload),
  addHorasFuncional:     (payload)          => httpGestion.post("/api/ProyectoHoras/funcional", payload),
  updateHorasFuncional:  (id, payload)      => httpGestion.put(`/api/ProyectoHoras/funcional/${id}`, payload),
  deleteHorasFuncional:  (id)               => httpGestion.del(`/api/ProyectoHoras/funcional/${id}`),
};

export const proyectoControlMensualApi = {
  listarPorProyecto: (codProy)       => httpGestion.get(`/api/ProyectoControlMensual/proyecto/${codProy}`),
  crear:             (payload)       => httpGestion.post("/api/ProyectoControlMensual", payload),
  editar:            (id, payload)   => httpGestion.put(`/api/ProyectoControlMensual/${id}`, payload),
  eliminar:          (id)            => httpGestion.del(`/api/ProyectoControlMensual/${id}`),
};