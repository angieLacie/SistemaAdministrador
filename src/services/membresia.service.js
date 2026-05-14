import {
  membresiasApi,
  membresiaOCApi,
  membresiaHESApi,
  membresiaOCClienteApi,
  membresiaHESClienteApi,
  membresiaFacturacionApi,
} from "../api/membresia.api";

// ── Membresías ────────────────────────────────────────────
export const membresiasService = {
  listar:  async (filtros)      => await membresiasApi.listar(filtros),
  resumen: async ()             => await membresiasApi.resumen(),
  obtener: async (id)           => await membresiasApi.obtener(id),
  reporte: async (filtros)      => await membresiasApi.reporte(filtros),
  crear:   async (payload)      => await membresiasApi.crear(payload),
  editar:  async (id, payload)  => await membresiasApi.editar(id, payload),
  eliminar:async (id)           => await membresiasApi.eliminar(id),
};

// ── OC Proveedor ──────────────────────────────────────────
export const membresiaOCService = {
  listarPorMembresia: async (idMembresia)  => await membresiaOCApi.listarPorMembresia(idMembresia),
  obtener:            async (id)           => await membresiaOCApi.obtener(id),
  crear:              async (payload)      => await membresiaOCApi.crear(payload),
  editar:             async (id, payload)  => await membresiaOCApi.editar(id, payload),
  eliminar:           async (id)           => await membresiaOCApi.eliminar(id),
};

// ── HES Proveedor ─────────────────────────────────────────
export const membresiaHESService = {
  listarPorOC: async (idOC)          => await membresiaHESApi.listarPorOC(idOC),
  obtener:     async (id)            => await membresiaHESApi.obtener(id),
  crear:       async (payload)       => await membresiaHESApi.crear(payload),
  editar:      async (id, payload)   => await membresiaHESApi.editar(id, payload),
  eliminar:    async (id)            => await membresiaHESApi.eliminar(id),
};

// ── OC Cliente ────────────────────────────────────────────
export const membresiaOCClienteService = {
  listarPorMembresia: async (idMembresia)  => await membresiaOCClienteApi.listarPorMembresia(idMembresia),
  obtener:            async (id)           => await membresiaOCClienteApi.obtener(id),
  crear:              async (payload)      => await membresiaOCClienteApi.crear(payload),
  editar:             async (id, payload)  => await membresiaOCClienteApi.editar(id, payload),
  eliminar:           async (id)           => await membresiaOCClienteApi.eliminar(id),
};

// ── HES Cliente ───────────────────────────────────────────
export const membresiaHESClienteService = {
  listarPorOcCliente: async (idOcCliente)  => await membresiaHESClienteApi.listarPorOcCliente(idOcCliente),
  obtener:            async (id)           => await membresiaHESClienteApi.obtener(id),
  crear:              async (payload)      => await membresiaHESClienteApi.crear(payload),
  editar:             async (id, payload)  => await membresiaHESClienteApi.editar(id, payload),
  eliminar:           async (id)           => await membresiaHESClienteApi.eliminar(id),
};

// ── Facturación ───────────────────────────────────────────
export const membresiaFacturacionService = {
  listarPorHes: async (idHes)          => await membresiaFacturacionApi.listarPorHes(idHes),
  obtener:      async (id)             => await membresiaFacturacionApi.obtener(id),
  crear:        async (payload)        => await membresiaFacturacionApi.crear(payload),
  editar:       async (id, payload)    => await membresiaFacturacionApi.editar(id, payload),
  eliminar:     async (id)             => await membresiaFacturacionApi.eliminar(id),
};
