import { proyectosApi, proyectoOCProveedorApi, proyectoOCClienteApi, proyectoHorasApi, proyectoControlMensualApi } from "../api/proyectos.api";

export const proyectosService = {
  listar:          async (filtros)       => await proyectosApi.listar(filtros),
  resumen:         async ()              => await proyectosApi.resumen(),
  obtener:         async (id)            => await proyectosApi.obtener(id),
  crear:           async (payload)       => await proyectosApi.crear(payload),
  editar:          async (id, payload)   => await proyectosApi.editar(id, payload),
  eliminar:        async (id)            => await proyectosApi.eliminar(id),
  updateCronograma:async (id, payload)   => await proyectosApi.updateCronograma(id, payload), 
dashboard: async () => await proyectosApi.dashboard(),

};

export const proyectoOCProveedorService = {
  listarPorProyecto: async (codProy)       => await proyectoOCProveedorApi.listarPorProyecto(codProy),
  crear:             async (payload)       => await proyectoOCProveedorApi.crear(payload),
  editar:            async (id, payload)   => await proyectoOCProveedorApi.editar(id, payload),
  eliminar:          async (id)            => await proyectoOCProveedorApi.eliminar(id),
  addHES:            async (idOC, payload) => await proyectoOCProveedorApi.addHES(idOC, payload),
  updateHES:         async (id, payload)   => await proyectoOCProveedorApi.updateHES(id, payload),
  deleteHES:         async (id)            => await proyectoOCProveedorApi.deleteHES(id),
};

export const proyectoOCClienteService = {
  listarPorProyecto: async (codProy)       => await proyectoOCClienteApi.listarPorProyecto(codProy),
  crear:             async (payload)       => await proyectoOCClienteApi.crear(payload),
  editar:            async (id, payload)   => await proyectoOCClienteApi.editar(id, payload),
  eliminar:          async (id)            => await proyectoOCClienteApi.eliminar(id),
  addHES:            async (idOC, payload) => await proyectoOCClienteApi.addHES(idOC, payload),
  updateHES:         async (id, payload)   => await proyectoOCClienteApi.updateHES(id, payload),
  deleteHES:         async (id)            => await proyectoOCClienteApi.deleteHES(id),
};

export const proyectoHorasService = {
  getByProyecto:        async (codProy)          => await proyectoHorasApi.getByProyecto(codProy),
  updateHoras:          async (codProy, payload)  => await proyectoHorasApi.updateHoras(codProy, payload),
  addHorasFuncional:    async (payload)           => await proyectoHorasApi.addHorasFuncional(payload),
  updateHorasFuncional: async (id, payload)       => await proyectoHorasApi.updateHorasFuncional(id, payload),
  deleteHorasFuncional: async (id)                => await proyectoHorasApi.deleteHorasFuncional(id),
};

export const proyectoControlMensualService = {
  listarPorProyecto: async (codProy)       => await proyectoControlMensualApi.listarPorProyecto(codProy),
  crear:             async (payload)       => await proyectoControlMensualApi.crear(payload),
  editar:            async (id, payload)   => await proyectoControlMensualApi.editar(id, payload),
  eliminar:          async (id)            => await proyectoControlMensualApi.eliminar(id),
};