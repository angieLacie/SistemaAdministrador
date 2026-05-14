// ── Modelo base de Membresía ──────────────────────────────
export const createMembresia = (data = {}) => ({
  idMembresia:         data.idMembresia         ?? null,
  codigoProyecto:      data.codigoProyecto      ?? '',
  nombreRequerimiento: data.nombreRequerimiento ?? '',
  periodo:             data.periodo             ?? '',
  fechaCreacion:       data.fechaCreacion       ?? null,
  fechaModificacion:   data.fechaModificacion   ?? null,
});

// ── OC Proveedor ──────────────────────────────────────────
export const createMembresiaOC = (data = {}) => ({
  idMembresiaOC: data.idMembresiaOC ?? null,
  idMembresia:   data.idMembresia   ?? null,
  numeroOc:      data.numeroOc      ?? '',
  idOrdenCO:     data.idOrdenCO     ?? null,
  descripcionCo: data.descripcionCo ?? '',
  solpedCompra:  data.solpedCompra  ?? '',
  importeUsd:    data.importeUsd    ?? null,
  importePen:    data.importePen    ?? null,
  estado:        data.estado        ?? 'Activa',
  fechaEmision:  data.fechaEmision  ?? null,
  fechaVencimiento: data.fechaVencimiento ?? null,
});

// ── HES Proveedor ─────────────────────────────────────────
export const createMembresiaHES = (data = {}) => ({
  idMembresiaHes: data.idMembresiaHes ?? null,
  idMembresiaOC:  data.idMembresiaOC  ?? null,
  numeroHes:      data.numeroHes      ?? '',
  descripcion:    data.descripcion    ?? '',
  importeUsd:     data.importeUsd     ?? null,
  importePen:     data.importePen     ?? null,
  fechaHes:       data.fechaHes       ?? null,
});

// ── OC Cliente ────────────────────────────────────────────
export const createMembresiaOCCliente = (data = {}) => ({
  idMembresiaOcCliente: data.idMembresiaOcCliente ?? null,
  idMembresia:          data.idMembresia          ?? null,
  codSapCliente:        data.codSapCliente        ?? '',
  empresaRefacturable:  data.empresaRefacturable  ?? '',
  importeRefPen:        data.importeRefPen        ?? null,
  importeRefUsd:        data.importeRefUsd        ?? null,
});

// ── HES Cliente ───────────────────────────────────────────
export const createMembresiaHESCliente = (data = {}) => ({
  idMembresiaHesCliente: data.idMembresiaHesCliente ?? null,
  idMembresiaOcCliente:  data.idMembresiaOcCliente  ?? null,
  osClienteCsc:          data.osClienteCsc          ?? '',
  hesClienteCsc:         data.hesClienteCsc         ?? '',
  descripcion:           data.descripcion           ?? '',
  importeUsd:            data.importeUsd            ?? null,
  importePen:            data.importePen            ?? null,
  fechaHes:              data.fechaHes              ?? null,
});

// ── Facturación ───────────────────────────────────────────
export const createMembresiaFacturacion = (data = {}) => ({
  idMembresiaFacturacion: data.idMembresiaFacturacion ?? null,
  idMembresiaOcCliente:   data.idMembresiaOcCliente   ?? null,
  idMembresiaHesCliente:  data.idMembresiaHesCliente  ?? null,
  estadoCsc:              data.estadoCsc              ?? '',
  anioMesFac:             data.anioMesFac             ?? '',
  nroFacturaSap:          data.nroFacturaSap          ?? '',
  montoFactPen:           data.montoFactPen           ?? null,
  montoFactUsd:           data.montoFactUsd           ?? null,
});
