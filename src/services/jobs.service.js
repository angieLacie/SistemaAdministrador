import { jobsApi } from "../api/jobs.api";

export const jobsService = {
  listar:        async (filtros)     => await jobsApi.listar(filtros),
  obtener:       async (id)          => await jobsApi.obtener(id),
  crear:         async (payload)     => await jobsApi.crear(payload),       // ← NUEVO
  editar:        async (id, payload) => await jobsApi.editar(id, payload),
  cambiarEstado: async (id, payload) => await jobsApi.cambiarEstado(id, payload),
};