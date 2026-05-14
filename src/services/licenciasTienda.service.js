import { licenciasTiendaApi, licenciaTiendaOCProvApi, licenciaTiendaOCCliApi } from "../api/licenciasTienda.api";

export const licenciasTiendaService = {
  listar:     async (filtros)            => await licenciasTiendaApi.listar(filtros),
  resumen:    async ()                   => await licenciasTiendaApi.resumen(),
  obtener:    async (id)                 => await licenciasTiendaApi.obtener(id),
  crear:      async (payload)            => await licenciasTiendaApi.crear(payload),
  editar:     async (id, payload)        => await licenciasTiendaApi.editar(id, payload),
  eliminar:   async (id)                 => await licenciasTiendaApi.eliminar(id),
  addCaja:    async (id, payload)        => await licenciasTiendaApi.addCaja(id, payload),
  updateCaja: async (id, idCaja, payload)=> await licenciasTiendaApi.updateCaja(id, idCaja, payload),
  deleteCaja: async (id, idCaja)         => await licenciasTiendaApi.deleteCaja(id, idCaja),
};

export const licenciaTiendaOCProvService = {
  listarPorTienda: async (idTienda)       => await licenciaTiendaOCProvApi.listarPorTienda(idTienda),
  crear:           async (payload)        => await licenciaTiendaOCProvApi.crear(payload),
  editar:          async (id, payload)    => await licenciaTiendaOCProvApi.editar(id, payload),
  eliminar:        async (id)             => await licenciaTiendaOCProvApi.eliminar(id),
  addHES:          async (idOC, payload)  => await licenciaTiendaOCProvApi.addHES(idOC, payload),
  updateHES:       async (id, payload)    => await licenciaTiendaOCProvApi.updateHES(id, payload),
  deleteHES:       async (id)             => await licenciaTiendaOCProvApi.deleteHES(id),
};

export const licenciaTiendaOCCliService = {
  listarPorTienda: async (idTienda)       => await licenciaTiendaOCCliApi.listarPorTienda(idTienda),
  crear:           async (payload)        => await licenciaTiendaOCCliApi.crear(payload),
  editar:          async (id, payload)    => await licenciaTiendaOCCliApi.editar(id, payload),
  eliminar:        async (id)             => await licenciaTiendaOCCliApi.eliminar(id),
  addHES:          async (idOC, payload)  => await licenciaTiendaOCCliApi.addHES(idOC, payload),
  updateHES:       async (id, payload)    => await licenciaTiendaOCCliApi.updateHES(id, payload),
  deleteHES:       async (id)             => await licenciaTiendaOCCliApi.deleteHES(id),
};