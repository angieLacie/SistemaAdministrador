import { httpMonitor } from "./https";

export const precioCeroApi = {
  resumen: () => httpMonitor.get("/api/PrecioCero/resumen"),
  precio:  (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.tienda) params.append("tienda", filtros.tienda);
    if (filtros.search) params.append("search", filtros.search);
    const query = params.toString();
    return httpMonitor.get(`/api/PrecioCero/precio${query ? `?${query}` : ""}`);
  },
  costo:   (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.tienda) params.append("tienda", filtros.tienda);
    if (filtros.search) params.append("search", filtros.search);
    const query = params.toString();
    return httpMonitor.get(`/api/PrecioCero/costo${query ? `?${query}` : ""}`);
  },
};

export const interfazApi = {
  resumen: () => httpMonitor.get("/api/Interfaz/resumen"),
  ventas: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.fecha)  params.append("fecha",  filtros.fecha);
    if (filtros.tienda) params.append("tienda", filtros.tienda);
    if (filtros.tabla)  params.append("tabla",  filtros.tabla);
    if (filtros.estado) params.append("estado", filtros.estado);
    const query = params.toString();
    return httpMonitor.get(`/api/Interfaz/ventas${query ? `?${query}` : ""}`);
  },
  movimientos: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.fecha)        params.append("fecha",        filtros.fecha);
    if (filtros.tabla)        params.append("tabla",        filtros.tabla);
    if (filtros.centroOrigen) params.append("centroOrigen", filtros.centroOrigen);
    if (filtros.estado)       params.append("estado",       filtros.estado);
    const query = params.toString();
    return httpMonitor.get(`/api/Interfaz/movimientos${query ? `?${query}` : ""}`);
  },
};

export const dashboardApi = {
  sincronizacion: () => httpMonitor.get("/api/Dashboard/sincronizacion"),
};

export const tamanoBaseDatosApi = {
  resumen: () => httpMonitor.get("/api/TamanoBaseDatos/resumen"),
  ultimos: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.tiendaId) params.append("tiendaId", filtros.tiendaId);
    if (filtros.estado)   params.append("estado",   filtros.estado);
    const q = params.toString();
    return httpMonitor.get(`/api/TamanoBaseDatos${q ? `?${q}` : ""}`);
  },
  historial: (tiendaId, filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.nombreBaseDatos) params.append("nombreBaseDatos", filtros.nombreBaseDatos);
    if (filtros.dias)            params.append("dias",            filtros.dias);
    const q = params.toString();
    return httpMonitor.get(`/api/TamanoBaseDatos/historial/${tiendaId}${q ? `?${q}` : ""}`);
  },
};

export const integracionEnviosApi = {
  resumen: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.cliente) params.append('cliente', filtros.cliente);
    if (filtros.fecha)   params.append('fecha',   filtros.fecha);
    const q = params.toString();
    return httpMonitor.get(`/api/IntegracionEnvios/resumen${q ? `?${q}` : ''}`);
  },
  filtros: () => httpMonitor.get('/api/IntegracionEnvios/filtros'),
  envios: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.cliente)    params.append('cliente',    filtros.cliente);
    if (filtros.estado)     params.append('estado',     filtros.estado);
    if (filtros.periodo)    params.append('periodo',    filtros.periodo);
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros.search)     params.append('search',     filtros.search);
    const q = params.toString();
    return httpMonitor.get(`/api/IntegracionEnvios${q ? `?${q}` : ''}`);
  },
};

export const personalApi = {
  filtros: () => httpMonitor.get('/api/Personal/filtros'),
  lista: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.empresa)       params.append('empresa',       filtros.empresa);
    if (filtros.puesto)        params.append('puesto',        filtros.puesto);
    if (filtros.estadoLaboral) params.append('estadoLaboral', filtros.estadoLaboral);
    if (filtros.search)        params.append('search',        filtros.search);
    const q = params.toString();
    return httpMonitor.get(`/api/Personal${q ? `?${q}` : ''}`);
  },
};

export const lineasCorporativasApi = {
  resumen:  (periodo)        => httpMonitor.get(`/api/LineasCorporativas/resumen${periodo ? `?periodo=${periodo}` : ''}`),
  filtros:  ()               => httpMonitor.get('/api/LineasCorporativas/filtros'),
  actualizar: (id, data)     => httpMonitor.put(`/api/LineasCorporativas/${id}`, data),
  copiarPeriodo: (periodoOrigen, forzar = false) =>
    httpMonitor.post('/api/LineasCorporativas/copiar-periodo', { periodoOrigen, forzar }),
  lineas:   (filtros = {})   => {
    const params = new URLSearchParams();
    if (filtros.periodo)       params.append('periodo',       filtros.periodo);
    if (filtros.operador)      params.append('operador',      filtros.operador);
    if (filtros.estado)        params.append('estado',        filtros.estado);
    if (filtros.empresa)       params.append('empresa',       filtros.empresa);
    if (filtros.estadoLaboral) params.append('estadoLaboral', filtros.estadoLaboral);
    if (filtros.puesto)        params.append('puesto',        filtros.puesto);
    if (filtros.search)        params.append('search',        filtros.search);
    const q = params.toString();
    return httpMonitor.get(`/api/LineasCorporativas${q ? `?${q}` : ''}`);
  },
};

export const facturacionApi = {
  resumen: (periodo) =>
    httpMonitor.get(`/api/Facturacion/resumen?periodo=${periodo}`),

  pendientes: (periodo, filtros = {}) => {
    const params = new URLSearchParams({ periodo });
    if (filtros.empresa) params.append('empresa', filtros.empresa);
    if (filtros.search)  params.append('search',  filtros.search);
    return httpMonitor.get(`/api/Facturacion/pendientes-sunat?${params}`);
  },

  anulados: (periodo, filtros = {}) => {
    const params = new URLSearchParams({ periodo });
    if (filtros.empresa) params.append('empresa', filtros.empresa);
    if (filtros.search)  params.append('search',  filtros.search);
    return httpMonitor.get(`/api/Facturacion/anulados-rms?${params}`);
  },

errores: (periodo, filtros = {}) => {
  const params = new URLSearchParams();
  if (periodo)         params.append('periodo', periodo);
  if (filtros.empresa) params.append('empresa', filtros.empresa);
  if (filtros.search)  params.append('search',  filtros.search);
  const q = params.toString();
  return httpMonitor.get(`/api/Facturacion/errores-factus${q ? `?${q}` : ''}`);
},
diferencias: (periodo, filtros = {}) => {
  const params = new URLSearchParams({ periodo });
  if (filtros.empresa) params.append('empresa', filtros.empresa);
  if (filtros.search)  params.append('search',  filtros.search);
  return httpMonitor.get(`/api/Facturacion/diferencias?${params}`);
},
};