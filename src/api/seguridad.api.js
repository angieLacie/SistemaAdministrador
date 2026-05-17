import { httpSeguridad } from "./https";

export const usuariosApi = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado)   params.append("estado",   filtros.estado);
    if (filtros.search)   params.append("search",   filtros.search);
    if (filtros.page)     params.append("page",     filtros.page);
    if (filtros.pageSize) params.append("pageSize", filtros.pageSize);
    const query = params.toString();
    return httpSeguridad.get(`/api/Usuarios${query ? `?${query}` : ""}`);
  },
  obtener:       (id)          => httpSeguridad.get(`/api/Usuarios/${id}`),
  crear:         (payload)     => httpSeguridad.post("/api/Usuarios", payload),
  editar:        (id, payload) => httpSeguridad.put(`/api/Usuarios/${id}`, payload),
  cambiarEstado: (id, payload) => httpSeguridad.put(`/api/Usuarios/${id}/estado`, payload),
  actualizarClave:(id, payload)=> httpSeguridad.put(`/api/Usuarios/${id}/clave`, payload), 
  cambiarPerfilUsuario: (id, payload) => httpSeguridad.put(`/api/Usuarios/usuario/${id}`, payload),
  eliminar:      (id)          => httpSeguridad.del(`/api/Usuarios/${id}`),
};

export const perfilesApi = {
  listar:      (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append("estado", filtros.estado);
    const query = params.toString();
    return httpSeguridad.get(`/api/Perfiles${query ? `?${query}` : ""}`);
  },
  obtener:     (id)          => httpSeguridad.get(`/api/Perfiles/${id}`),
  crear:       (payload)     => httpSeguridad.post("/api/Perfiles", payload),
  editar:      (id, payload) => httpSeguridad.put(`/api/Perfiles/${id}`, payload),
  eliminar:    (id)          => httpSeguridad.del(`/api/Perfiles/${id}`),
  asignar:     (payload)     => httpSeguridad.post("/api/Perfiles/asignar", payload),
  desasignar:  (usuarioId, perfilId) => httpSeguridad.del(`/api/Perfiles/desasignar?usuarioId=${usuarioId}&perfilId=${perfilId}`),
};

export const dashboardApi = {
  get: () => httpSeguridad.get("/api/Dashboard"),
};

export const perfilTiendaApi = {
  listarPorPerfil:      (perfilId)      => httpSeguridad.get(`/api/PerfilTienda/perfil/${perfilId}`),
  tiendasDisponibles:   (perfilId)      => httpSeguridad.get(`/api/PerfilTienda/tiendas-disponibles/${perfilId}`),
  asignar:              (payload)       => httpSeguridad.post("/api/PerfilTienda", payload),
  desasignar:           (id)            => httpSeguridad.del(`/api/PerfilTienda/${id}`),
  usuariosPerfil: (perfilId) => httpSeguridad.get(`/api/PerfilTienda/usuarios-perfil/${perfilId}`),
};
export const empleadosApi = {
  listar:       (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado)  params.append("estado",  filtros.estado);
    if (filtros.tienda)  params.append("tienda",  filtros.tienda);
    if (filtros.puesto)  params.append("puesto",  filtros.puesto);
    if (filtros.origen !== undefined && filtros.origen !== '') params.append("origen", filtros.origen);
    if (filtros.search)  params.append("search",  filtros.search);
    const query = params.toString();
    return httpSeguridad.get(`/api/Empleados${query ? `?${query}` : ""}`);
  },
  resumen:      ()             => httpSeguridad.get("/api/Empleados/resumen"),
  obtener:      (id)           => httpSeguridad.get(`/api/Empleados/${id}`),
  crear:        (payload)      => httpSeguridad.post("/api/Empleados", payload),
  editar:       (id, payload)  => httpSeguridad.put(`/api/Empleados/${id}`, payload),
  cambiarEstado:(id, payload)  => httpSeguridad.put(`/api/Empleados/${id}/estado`, payload),
};

export const sistemasApi = {
  listar:  (estado)        => httpSeguridad.get(`/api/Sistemas${estado ? `?estado=${estado}` : ""}`),
  obtener: (id)            => httpSeguridad.get(`/api/Sistemas/${id}`),
  crear:   (payload)       => httpSeguridad.post("/api/Sistemas", payload),
  editar:  (id, payload)   => httpSeguridad.put(`/api/Sistemas/${id}`, payload),
  eliminar:(id)            => httpSeguridad.del(`/api/Sistemas/${id}`),
};

export const modulosApi = {
  listar:  (filtros = {})  => {
    const params = new URLSearchParams();
    if (filtros.sistema) params.append("sistema", filtros.sistema);
    if (filtros.estado)  params.append("estado",  filtros.estado);
    return httpSeguridad.get(`/api/Modulos${params.toString() ? `?${params}` : ""}`);
  },
  obtener: (id)            => httpSeguridad.get(`/api/Modulos/${id}`),
  crear:   (payload)       => httpSeguridad.post("/api/Modulos", payload),
  editar:  (id, payload)   => httpSeguridad.put(`/api/Modulos/${id}`, payload),
  eliminar:(id)            => httpSeguridad.del(`/api/Modulos/${id}`),
};

export const opcionesApi = {
  listar:  (filtros = {})  => {
    const params = new URLSearchParams();
    if (filtros.modulo) params.append("modulo", filtros.modulo);
    if (filtros.estado) params.append("estado", filtros.estado);
    return httpSeguridad.get(`/api/Opciones${params.toString() ? `?${params}` : ""}`);
  },
  obtener: (opcion, modulo) => httpSeguridad.get(`/api/Opciones/${opcion}/${modulo}`),
  crear:   (payload)        => httpSeguridad.post("/api/Opciones", payload),
  editar:  (opcion, modulo, payload) => httpSeguridad.put(`/api/Opciones/${opcion}/${modulo}`, payload),
  eliminar:(opcion, modulo) => httpSeguridad.del(`/api/Opciones/${opcion}/${modulo}`),
};

export const funcionesApi = {
  listar:  (filtros = {})  => {
    const params = new URLSearchParams();
    if (filtros.opcion) params.append("opcion", filtros.opcion);
    if (filtros.modulo) params.append("modulo", filtros.modulo);
    return httpSeguridad.get(`/api/Funciones${params.toString() ? `?${params}` : ""}`);
  },
  obtener: (opcion, modulo, funcion) => httpSeguridad.get(`/api/Funciones/${opcion}/${modulo}/${funcion}`),
  crear:   (payload)       => httpSeguridad.post("/api/Funciones", payload),
  editar:  (opcion, modulo, funcion, payload) => httpSeguridad.put(`/api/Funciones/${opcion}/${modulo}/${funcion}`, payload),
  eliminar:(opcion, modulo, funcion) => httpSeguridad.del(`/api/Funciones/${opcion}/${modulo}/${funcion}`),
};

export const accesosPerfilApi = {
  getByPerfil:       (perfilId)       => httpSeguridad.get(`/api/AccesosPerfil/perfil/${perfilId}`),
  asignar:           (payload)        => httpSeguridad.post("/api/AccesosPerfil", payload),
  actualizarPermisos:(payload)        => httpSeguridad.put("/api/AccesosPerfil", payload),
  quitar:            (opcion, modulo, funcion, perfil) =>
    httpSeguridad.del(`/api/AccesosPerfil?opcion=${opcion}&modulo=${modulo}&funcion=${funcion}&perfil=${perfil}`),
  misAccesos: (perfilId, sistema) => 
    httpSeguridad.get(`/api/AccesosPerfil/accesos/${perfilId}${sistema ? `?sistema=${sistema}` : ''}`),
};

export const tiendasApi = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.empresa) params.append('empresa', filtros.empresa);
    if (filtros.buscar)  params.append('buscar',  filtros.buscar);
    if (filtros.zona)    params.append('zona',    filtros.zona);
    const q = params.toString();
    return httpSeguridad.get(`/api/Tiendas${q ? `?${q}` : ''}`);
  },
  empresas: () => httpSeguridad.get('/api/Empresas'),
  zonas:    () => httpSeguridad.get('/api/Tiendas/zonas'),
};

export const vistaPerfilApi = {
  //getByPerfil:    (perfilId)       => httpSeguridad.get(`/api/VistaPerfil/perfil/${perfilId}`),
  getEmpresas:    ()               => httpSeguridad.get("/api/VistaPerfil/empresas"),
  asignar:        (payload)        => httpSeguridad.post("/api/VistaPerfil", payload),
  //cambiarDefault: (id, payload)    => httpSeguridad.put(`/api/VistaPerfil/${id}/default`, payload),
  desasignar:     (id)             => httpSeguridad.del(`/api/VistaPerfil/${id}`),
  getByPerfil: (perfilId, empresa) => 
    httpSeguridad.get(`/api/VistaPerfil/perfil/${perfilId}${empresa ? `?empresa=${empresa}` : ''}`),
  cambiarDefault: (id) => httpSeguridad.put(`/api/VistaPerfil/${id}/default`, null),
  getDisponibles: (perfilId, empresa) =>
    httpSeguridad.get(`/api/VistaPerfil/disponibles/${perfilId}?empresa=${empresa}`),

};