import {
  oficinasApi,
  empresasApi,
  ordenesCompraApi,
  ordenCOApi,
  hesApi,
  ocClienteApi,
  hesClienteApi,
  facturacionApi,
} from "../api/licencia.api";

// ── Oficinas ─────────────────────────────────────────────
export const oficinasService = {
  listar:         async (filtros)      => await oficinasApi.listar(filtros),
  resumen:        async ()             => await oficinasApi.resumen(),
  obtener:        async (id)           => await oficinasApi.obtener(id),
  historial:      async (id)           => await oficinasApi.historial(id),
  crear:          async (licencia)     => await oficinasApi.crear(licencia),
  editar:         async (id, licencia) => await oficinasApi.editar(id, licencia),
  cambiarUsuario: async (id, cambio)   => await oficinasApi.cambiarUsuario(id, cambio),
  eliminar:       async (id)           => await oficinasApi.eliminar(id),
  reporte:        async (filtros) => await oficinasApi.reporte(filtros),
};

// ── Empresas ─────────────────────────────────────────────
export const empresasService = {
  listar:  async ()             => await empresasApi.listar(),
  obtener: async (id)           => await empresasApi.obtener(id),
  crear:   async (empresa)      => await empresasApi.crear(empresa),
  editar:  async (id, empresa)  => await empresasApi.editar(id, empresa),
  eliminar:async (id)           => await empresasApi.eliminar(id),
};

// ── Ordenes de Compra ─────────────────────────────────────
export const ordenesCompraService = {
  listar:           async (estado)      => await ordenesCompraApi.listar(estado),
  listarPorOficina: async (idOficina)   => await ordenesCompraApi.listarPorOficina(idOficina),  // ← esta línea
  obtener:          async (id)          => await ordenesCompraApi.obtener(id),
  crear:            async (oc)          => await ordenesCompraApi.crear(oc),
  editar:           async (id, oc)      => await ordenesCompraApi.editar(id, oc),
  eliminar:         async (id)          => await ordenesCompraApi.eliminar(id),
};

// ── Orden CO ──────────────────────────────────────────────
export const ordenCOService = {
  listar:  async (idEmpresa)    => await ordenCOApi.listar(idEmpresa),
  obtener: async (id)           => await ordenCOApi.obtener(id),
  crear:   async (co)           => await ordenCOApi.crear(co),
  editar:  async (id, co)       => await ordenCOApi.editar(id, co),
  eliminar:async (id)           => await ordenCOApi.eliminar(id),
};

// ── HES Proveedor ─────────────────────────────────────────
export const hesService = {
  listarPorOc: async (idOc)        => await hesApi.listarPorOc(idOc),
  obtener:     async (id)          => await hesApi.obtener(id),
  crear:       async (hes)         => await hesApi.crear(hes),
  editar:      async (id, hes)     => await hesApi.editar(id, hes),
  eliminar:    async (id)          => await hesApi.eliminar(id),
};

// ── OC Cliente ────────────────────────────────────────────
export const ocClienteService = {
  listarPorOficina: async (idOficina)    => await ocClienteApi.listarPorOficina(idOficina),
  obtener:          async (id)           => await ocClienteApi.obtener(id),
  crear:            async (oc)           => await ocClienteApi.crear(oc),
  editar:           async (id, oc)       => await ocClienteApi.editar(id, oc),
  eliminar:         async (id)           => await ocClienteApi.eliminar(id),
};

// ── HES Cliente ───────────────────────────────────────────
export const hesClienteService = {
  listarPorOcCliente: async (idOcCliente)    => await hesClienteApi.listarPorOcCliente(idOcCliente),
  obtener:            async (id)             => await hesClienteApi.obtener(id),
  crear:              async (hes)            => await hesClienteApi.crear(hes),
  editar:             async (id, hes)        => await hesClienteApi.editar(id, hes),
  eliminar:           async (id)             => await hesClienteApi.eliminar(id),
};

// ── Facturación ───────────────────────────────────────────
export const facturacionService = {
  listarPorHes:       async (idHesCliente)   => await facturacionApi.listarPorHes(idHesCliente),
  listarPorOcCliente: async (idOcCliente)    => await facturacionApi.listarPorOcCliente(idOcCliente),
  obtener:            async (id)             => await facturacionApi.obtener(id),
  crear:              async (fact)           => await facturacionApi.crear(fact),
  editar:             async (id, fact)       => await facturacionApi.editar(id, fact),
  eliminar:           async (id)             => await facturacionApi.eliminar(id),
};
