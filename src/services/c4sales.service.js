import { c4SalesApi } from "../api/c4sales.api";

export const c4SalesService = {
  listar:         async (filtros)      => await c4SalesApi.listar(filtros),
  resumen:        async ()             => await c4SalesApi.resumen(),
  obtener:        async (id)           => await c4SalesApi.obtener(id),
  historial:      async (id)           => await c4SalesApi.historial(id),
  crear:          async (payload)      => await c4SalesApi.crear(payload),
  editar:         async (id, payload)  => await c4SalesApi.editar(id, payload),
  cambiarPersonal:async (id, payload)  => await c4SalesApi.cambiarPersonal(id, payload),
  eliminar:       async (id)           => await c4SalesApi.eliminar(id),
};
