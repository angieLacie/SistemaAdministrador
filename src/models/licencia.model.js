// =====================
// Model: Oficina / Licencia
// =====================
export function createLicencia() {
  return {
    codigoOfi: "",
    estado: "Libre",
    idUsuarioActual: null,
    idUsuarioAnterior: null,
    idEmpresaUsuario: null,
    idEmpresaLicencia: null,
    idOc: null,
    puesto: "",
    periodo: "",
  };
}

// =====================
// Model: Cambio de usuario
// =====================
export function createCambioUsuario() {
  return {
    idUsuarioNuevo: null,
    nombreUsuarioNuevo: "",
    idOc: null,
    numeroOc: "",
    puestoNuevo: "",
    motivo: "",
    realizadoPor: "",
  };
}

// =====================
// Model: Empresa
// =====================
export function createEmpresa() {
  return {
    codigo: "",
    nombre: "",
    descripcion: "",
    activo: true,
  };
}

// =====================
// Model: Orden de Compra
// =====================
export function createOrdenCompra() {
  return {
    numeroOc: "",
    idEmpresa: null,
    descripcion: "",
    fechaEmision: "",
    fechaVencimiento: "",
    estado: "Activa",
    monto: null,
  };
}
