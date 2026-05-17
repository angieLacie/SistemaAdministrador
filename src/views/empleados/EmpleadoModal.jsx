import { useEffect } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

// ── Estilos reutilizables ────────────────────────────────────────────────────
const sectionTitle = {
  fontSize: 10, fontWeight: 700, letterSpacing: '1px',
  color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10,
};
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };
const inputStyle = { fontSize: 13, borderRadius: 8, border: '1.5px solid #dde1e7' };

const BtnCancel = ({ onClick, disabled, children }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:7, border:'1.5px solid #d1d5db', background:'white', color:'#374151', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, transition:'all 0.15s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor='#9ca3af'; e.currentTarget.style.background='#f9fafb'; }}}
    onMouseLeave={e => { e.currentTarget.style.borderColor='#d1d5db'; e.currentTarget.style.background='white'; }}>
    {children}
  </button>
);

const BtnSubmit = ({ disabled, saving, isEdit }) => (
  <button type="submit" disabled={disabled}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, transition:'all 0.15s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}}
    onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
    {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar empleado'}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
const EmpleadoModal = ({ show, onHide, onSave, empleado, saving = false }) => {
  const isEdit = !!empleado;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const tipoDoc = watch('tipoDocumentoIdentidad', 1);

  useEffect(() => {
    if (empleado) {
      reset({
        nombre:               empleado.nombre              ?? '',
        apellidoPaterno:      empleado.apellidoPaterno      ?? '',
        apellidoMaterno:      empleado.apellidoMaterno      ?? '',
        documentoIdentidad:   empleado.documentoIdentidad   ?? '',
        genero:               empleado.genero               ?? '',
        tiendaActual:         empleado.tiendaActual         ?? '',
        puesto:               empleado.puesto               ?? '',
        puestoActual:         empleado.puestoActual         ?? '',
        tipoTrabajo:          empleado.tipoTrabajo          ?? '',
      });
    } else {
      reset({
        empleadoId:             '',
        nombre:                 '',
        apellidoPaterno:        '',
        apellidoMaterno:        '',
        tipoDocumentoIdentidad: 1,
        documentoIdentidad:     '',
        genero:                 '',
        tiendaOrigen:           '',
        tiendaActual:           '',
        empresaOrigen:          '',
        puesto:                 '',
        tipoTrabajo:            '',
      });
    }
  }, [empleado, show, reset]);

  // Validación dinámica de documento según tipo
  const docPattern = () => {
    const tipo = parseInt(tipoDoc);
    if (tipo === 1) return { value: /^\d{8}$/, message: 'DNI: exactamente 8 dígitos' };
    if (tipo === 2) return { value: /^[A-Z0-9]{9,12}$/i, message: 'CE: 9–12 caracteres alfanuméricos' };
    return { value: /^[A-Z0-9]{6,15}$/i, message: 'Pasaporte: 6–15 caracteres alfanuméricos' };
  };

  const onSubmit = (data) => {
    const payload = isEdit ? {
      nombre:              data.nombre             || null,
      apellidoPaterno:     data.apellidoPaterno    || null,
      apellidoMaterno:     data.apellidoMaterno    || null,
      documentoIdentidad:  data.documentoIdentidad || null,
      genero:              data.genero             || null,
      tiendaActual:        data.tiendaActual       || null,
      puesto:              data.puesto             || null,
      puestoActual:        data.puestoActual       || null,
      tipoTrabajo:         data.tipoTrabajo        || null,
      usuarioModificacion: 'ADMIN',
    } : {
      empleadoId:             data.empleadoId,
      nombre:                 data.nombre             || null,
      apellidoPaterno:        data.apellidoPaterno    || null,
      apellidoMaterno:        data.apellidoMaterno    || null,
      tipoDocumentoIdentidad: parseInt(data.tipoDocumentoIdentidad) || 1,
      documentoIdentidad:     data.documentoIdentidad || null,
      genero:                 data.genero             || null,
      tiendaOrigen:           data.tiendaOrigen       || null,
      tiendaActual:           data.tiendaActual       || null,
      empresaOrigen:          data.empresaOrigen      || null,
      puesto:                 data.puesto             || null,
      tipoTrabajo:            data.tipoTrabajo        || null,
      usuarioCreacion:        'ADMIN',
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          {isEdit ? `Editar empleado — ${empleado?.empleado}` : 'Nuevo empleado'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ padding: '20px 24px' }}>

          {/* ── Datos personales ── */}
          <p style={sectionTitle}>Datos personales</p>
          <Row className="mb-3 g-3">
            {!isEdit && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label style={labelStyle}>
                    Código empleado <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    {...register('empleadoId', {
                      required: 'El código es obligatorio',
                      maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                      pattern: {
                        value: /^[A-Z0-9]+$/i,
                        message: 'Solo letras y números',
                      },
                    })}
                    placeholder="Ej: 0000001234"
                    isInvalid={!!errors.empleadoId}
                    style={inputStyle}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                    {errors.empleadoId?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md={isEdit ? 4 : 3}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Nombre <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  {...register('nombre', {
                    required: 'El nombre es obligatorio',
                    maxLength: { value: 80, message: 'Máximo 80 caracteres' },
                    pattern: {
                      value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/i,
                      message: 'Solo letras y espacios',
                    },
                  })}
                  placeholder="Nombre(s)"
                  isInvalid={!!errors.nombre}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.nombre?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={isEdit ? 4 : 3}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Apellido paterno <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  {...register('apellidoPaterno', {
                    required: 'El apellido paterno es obligatorio',
                    maxLength: { value: 60, message: 'Máximo 60 caracteres' },
                    pattern: {
                      value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/i,
                      message: 'Solo letras y espacios',
                    },
                  })}
                  placeholder="Apellido paterno"
                  isInvalid={!!errors.apellidoPaterno}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.apellidoPaterno?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={isEdit ? 4 : 3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Apellido materno</Form.Label>
                <Form.Control
                  {...register('apellidoMaterno', {
                    maxLength: { value: 60, message: 'Máximo 60 caracteres' },
                    pattern: {
                      value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/i,
                      message: 'Solo letras y espacios',
                    },
                  })}
                  placeholder="Apellido materno"
                  isInvalid={!!errors.apellidoMaterno}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.apellidoMaterno?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3 g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Tipo documento</Form.Label>
                <Form.Select {...register('tipoDocumentoIdentidad')} style={inputStyle}>
                  <option value={1}>DNI</option>
                  <option value={2}>CE</option>
                  <option value={3}>Pasaporte</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Nro. documento</Form.Label>
                <Form.Control
                  {...register('documentoIdentidad', {
                    pattern: docPattern(),
                  })}
                  placeholder={parseInt(tipoDoc) === 1 ? 'Ej: 12345678' : 'Ej: 000123456'}
                  isInvalid={!!errors.documentoIdentidad}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.documentoIdentidad?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Género</Form.Label>
                <Form.Select {...register('genero')} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* ── Datos laborales ── */}
          <p style={{ ...sectionTitle, marginTop: 8 }}>Datos laborales</p>
          <Row className="mb-3 g-3">
            {!isEdit && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label style={labelStyle}>
                    Tienda origen <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span>
                  </Form.Label>
                  <Form.Control
                    {...register('tiendaOrigen', {
                      maxLength: { value: 10, message: 'Máximo 10 caracteres' },
                      pattern: { value: /^[A-Z0-9]+$/i, message: 'Solo letras y números' },
                    })}
                    placeholder="Ej: T001"
                    isInvalid={!!errors.tiendaOrigen}
                    style={inputStyle}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                    {errors.tiendaOrigen?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Tienda actual <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span>
                </Form.Label>
                <Form.Control
                  {...register('tiendaActual', {
                    maxLength: { value: 10, message: 'Máximo 10 caracteres' },
                    pattern: { value: /^[A-Z0-9]+$/i, message: 'Solo letras y números' },
                  })}
                  placeholder="Ej: T001"
                  isInvalid={!!errors.tiendaActual}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.tiendaActual?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            {!isEdit && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label style={labelStyle}>
                    Empresa origen <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span>
                  </Form.Label>
                  <Form.Control
                    {...register('empresaOrigen', {
                      maxLength: { value: 10, message: 'Máximo 10 caracteres' },
                      pattern: { value: /^[A-Z0-9]+$/i, message: 'Solo letras y números' },
                    })}
                    placeholder="Ej: EMP01"
                    isInvalid={!!errors.empresaOrigen}
                    style={inputStyle}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                    {errors.empresaOrigen?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Puesto</Form.Label>
                <Form.Control
                  {...register('puesto', {
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                    pattern: {
                      value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s/\-.,()]+$/i,
                      message: 'Solo letras, números y caracteres básicos',
                    },
                  })}
                  placeholder="Ej: ASESOR"
                  isInvalid={!!errors.puesto}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.puesto?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Tipo de trabajo</Form.Label>
                <Form.Select {...register('tipoTrabajo')} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  <option value="PLANILLA">Planilla</option>
                  <option value="CONTRATO">Contrato</option>
                  <option value="PRACTICANTE">Practicante</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {!isEdit && (
            <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 12, color: '#0369a1' }}>
              <strong>Usuario generado automáticamente:</strong> 1ra letra del nombre + apellido paterno.
              La clave inicial será el número de documento.
            </div>
          )}

        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
          <BtnCancel onClick={onHide} disabled={saving}>Cancelar</BtnCancel>
          <BtnSubmit disabled={saving} saving={saving} isEdit={isEdit} />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EmpleadoModal;
