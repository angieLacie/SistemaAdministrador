 
import { usuariosApi, perfilesApi, dashboardApi, perfilTiendaApi, empleadosApi ,sistemasApi, modulosApi, opcionesApi, funcionesApi, accesosPerfilApi, vistaPerfilApi } from "../api/seguridad.api";
 

export const usuariosService = {
  listar:              async (filtros)      => await usuariosApi.listar(filtros),
  obtener:             async (id)           => await usuariosApi.obtener(id),
  crear:               async (payload)      => await usuariosApi.crear(payload),
  editar:              async (id, payload)  => await usuariosApi.editar(id, payload),
  cambiarEstado:       async (id, payload)  => await usuariosApi.cambiarEstado(id, payload),
  actualizarClave:     async (id, payload)  => await usuariosApi.actualizarClave(id, payload),
  eliminar:            async (id)           => await usuariosApi.eliminar(id),
  cambiarPerfilUsuario:async (id, payload)  => await usuariosApi.cambiarPerfilUsuario(id, payload), // ← agregar
  
};

export const perfilesService = {
  listar:     async (filtros)           => await perfilesApi.listar(filtros),
  obtener:    async (id)                => await perfilesApi.obtener(id),
  crear:      async (payload)           => await perfilesApi.crear(payload),
  editar:     async (id, payload)       => await perfilesApi.editar(id, payload),
  eliminar:   async (id)                => await perfilesApi.eliminar(id),
  asignar:    async (payload)           => await perfilesApi.asignar(payload),
  desasignar: async (usuarioId, perfilId) => await perfilesApi.desasignar(usuarioId, perfilId),
};


export const perfilTiendaService = {
  listarPorPerfil:    async (perfilId) => await perfilTiendaApi.listarPorPerfil(perfilId),
  tiendasDisponibles: async (perfilId) => await perfilTiendaApi.tiendasDisponibles(perfilId),
  asignar:            async (payload)  => await perfilTiendaApi.asignar(payload),
  desasignar:         async (id)       => await perfilTiendaApi.desasignar(id),
  usuariosPerfil: async (perfilId) => await perfilTiendaApi.usuariosPerfil(perfilId),
};
export const dashboardService = {
  get: async () => await dashboardApi.get(),
};


export const empleadosService = {
  listar:       async (filtros)      => await empleadosApi.listar(filtros),
  resumen:      async ()             => await empleadosApi.resumen(),
  obtener:      async (id)           => await empleadosApi.obtener(id),
  crear:        async (payload)      => await empleadosApi.crear(payload),
  editar:       async (id, payload)  => await empleadosApi.editar(id, payload),
  cambiarEstado:async (id, payload)  => await empleadosApi.cambiarEstado(id, payload),
};



export const sistemasService = {
  listar:  async (estado)       => await sistemasApi.listar(estado),
  obtener: async (id)           => await sistemasApi.obtener(id),
  crear:   async (payload)      => await sistemasApi.crear(payload),
  editar:  async (id, payload)  => await sistemasApi.editar(id, payload),
  eliminar:async (id)           => await sistemasApi.eliminar(id),
};

export const modulosService = {
  listar:  async (filtros)      => await modulosApi.listar(filtros),
  obtener: async (id)           => await modulosApi.obtener(id),
  crear:   async (payload)      => await modulosApi.crear(payload),
  editar:  async (id, payload)  => await modulosApi.editar(id, payload),
  eliminar:async (id)           => await modulosApi.eliminar(id),
};

export const opcionesService = {
  listar:  async (filtros)             => await opcionesApi.listar(filtros),
  obtener: async (opcion, modulo)      => await opcionesApi.obtener(opcion, modulo),
  crear:   async (payload)             => await opcionesApi.crear(payload),
  editar:  async (opcion, modulo, payload) => await opcionesApi.editar(opcion, modulo, payload),
  eliminar:async (opcion, modulo)      => await opcionesApi.eliminar(opcion, modulo),
};

export const funcionesService = {
  listar:  async (filtros)                    => await funcionesApi.listar(filtros),
  obtener: async (opcion, modulo, funcion)    => await funcionesApi.obtener(opcion, modulo, funcion),
  crear:   async (payload)                    => await funcionesApi.crear(payload),
  editar:  async (opcion, modulo, funcion, payload) => await funcionesApi.editar(opcion, modulo, funcion, payload),
  eliminar:async (opcion, modulo, funcion)    => await funcionesApi.eliminar(opcion, modulo, funcion),
};

export const accesosPerfilService = {
  getByPerfil:       async (perfilId)  => await accesosPerfilApi.getByPerfil(perfilId),
  asignar:           async (payload)   => await accesosPerfilApi.asignar(payload),
  actualizarPermisos:async (payload)   => await accesosPerfilApi.actualizarPermisos(payload),
  quitar:            async (opcion, modulo, funcion, perfil) =>
    await accesosPerfilApi.quitar(opcion, modulo, funcion, perfil),
   listar: async (estado) => await sistemasApi.listar(estado),
   misAccesos: async (perfilId) => await accesosPerfilApi.misAccesos(perfilId),
};



export const vistaPerfilService = {
  getByPerfil:    async (perfilId)       => await vistaPerfilApi.getByPerfil(perfilId),
  getEmpresas:    async ()               => await vistaPerfilApi.getEmpresas(),
  asignar:        async (payload)        => await vistaPerfilApi.asignar(payload),
  cambiarDefault: async (id, payload)    => await vistaPerfilApi.cambiarDefault(id, payload),
  desasignar:     async (id)             => await vistaPerfilApi.desasignar(id),
  getDisponibles: async (perfilId, empresa) => await vistaPerfilApi.getDisponibles(perfilId, empresa),
};