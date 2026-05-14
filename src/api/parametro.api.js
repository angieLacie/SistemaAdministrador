import { httpSeguridad } from "./https";

export const parametroApi = {
  list: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.periodo) params.append("periodo", filtros.periodo);
    if (filtros.empresa) params.append("empresa", filtros.empresa);
    if (filtros.tienda)  params.append("tienda",  filtros.tienda);
    if (filtros.estado)  params.append("estado",  filtros.estado);
    if (filtros.valor)   params.append("valor",   filtros.valor);
    if (filtros.codigo)  params.append("codigo",  filtros.codigo);
    if (filtros.buscar)  params.append("buscar",  filtros.buscar);
    const query = params.toString();
    return httpSeguridad.get(`/api/Parametros${query ? `?${query}` : ""}`);
  },
  getById:      (id)       => httpSeguridad.get(`/api/Parametros/${id}`),
  create:       (data)     => httpSeguridad.post("/api/Parametros", data),
  update:       (id, data) => httpSeguridad.put(`/api/Parametros/${id}`, data),
  toggleEstado: (id)       => httpSeguridad.put(`/api/Parametros/${id}/estado`, {}),
  remove:       (id)       => httpSeguridad.del(`/api/Parametros/${id}`),
  listCodigos:  ()         => httpSeguridad.get("/api/Parametros/codigos"),
  listPeriodos: ()         => httpSeguridad.get("/api/Parametros/periodos"),
};