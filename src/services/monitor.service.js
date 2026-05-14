import { precioCeroApi, interfazApi, dashboardApi, facturacionApi, tamanoBaseDatosApi } from "../api/monitor.api";


export const precioCeroService = {
  resumen: async ()             => await precioCeroApi.resumen(),
  precio:  async (filtros)      => await precioCeroApi.precio(filtros),
  costo:   async (filtros)      => await precioCeroApi.costo(filtros),
};


export const interfazService = {
  resumen:      async ()          => await interfazApi.resumen(),
  ventas:       async (filtros)   => await interfazApi.ventas(filtros),
  movimientos:  async (filtros)   => await interfazApi.movimientos(filtros),
};
export const dashboardService = {
  sincronizacion: async () => await dashboardApi.sincronizacion(),
};
 
export const tamanoBaseDatosService = {
  resumen:  ()                   => tamanoBaseDatosApi.resumen(),
  ultimos:  (filtros)            => tamanoBaseDatosApi.ultimos(filtros),
  historial: (tiendaId, filtros) => tamanoBaseDatosApi.historial(tiendaId, filtros),
};

export const facturacionService = {
  resumen:    (periodo)            => facturacionApi.resumen(periodo),
  pendientes: (periodo, filtros)   => facturacionApi.pendientes(periodo, filtros),
  anulados:   (periodo, filtros)   => facturacionApi.anulados(periodo, filtros),
  errores: (periodo, filtros) => facturacionApi.errores(periodo, filtros),
  diferencias: (periodo, filtros) => facturacionApi.diferencias(periodo, filtros),
};