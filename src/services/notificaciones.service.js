import { notificacionesApi } from "@/api/notificaciones.api";

export const notificacionesService = {
  listar:            (filtros)              => notificacionesApi.listar(filtros),
  resumen:           ()                    => notificacionesApi.resumen(),
  obtener:           (id)                  => notificacionesApi.obtener(id),
  crear:             (data)               => notificacionesApi.crear(data),
  actualizar:        (id, data)            => notificacionesApi.actualizar(id, data),
  eliminar:          (id)                  => notificacionesApi.eliminar(id),
  listarDetalle:     (processId)           => notificacionesApi.listarDetalle(processId),
  crearDetalle:      (processId, data)     => notificacionesApi.crearDetalle(processId, data),
  actualizarDetalle: (processId, item, data) => notificacionesApi.actualizarDetalle(processId, item, data),
  eliminarDetalle:   (processId, item)     => notificacionesApi.eliminarDetalle(processId, item),
};
