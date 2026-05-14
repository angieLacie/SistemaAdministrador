import { httpNotificaciones } from "./https";

export const notificacionesApi = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.status !== undefined && filtros.status !== '') params.append('status', filtros.status);
    if (filtros.mode) params.append('mode', filtros.mode);
    if (filtros.destinationType) params.append('destinationType', filtros.destinationType);
    if (filtros.buscar) params.append('buscar', filtros.buscar);
    return httpNotificaciones.get(`/api/NotificationProcess?${params.toString()}`);
  },

  resumen: () =>
    httpNotificaciones.get('/api/NotificationProcess/resumen'),

  obtener: (id) =>
    httpNotificaciones.get(`/api/NotificationProcess/${id}`),

  crear: (data) =>
    httpNotificaciones.post('/api/NotificationProcess', data),

  actualizar: (id, data) =>
    httpNotificaciones.put(`/api/NotificationProcess/${id}`, data),

  eliminar: (id) =>
    httpNotificaciones.del(`/api/NotificationProcess/${id}`),

  listarDetalle: (processId) =>
    httpNotificaciones.get(`/api/NotificationProcess/${processId}/detail`),

  crearDetalle: (processId, data) =>
    httpNotificaciones.post(`/api/NotificationProcess/${processId}/detail`, data),

  actualizarDetalle: (processId, item, data) =>
    httpNotificaciones.put(`/api/NotificationProcess/${processId}/detail/${item}`, data),

  eliminarDetalle: (processId, item) =>
    httpNotificaciones.del(`/api/NotificationProcess/${processId}/detail/${item}`),
};
