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
    {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar licencia'}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
const LicenciaModal = ({ show, onHide, onSave, licencia, nextOfi, empresas = [], ocs = [], saving = false }) => {
  const isEdit = !!licencia;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (licencia) {
      reset({
        codigoOfi:         licencia.codigoOfi         ?? '',
        estado:            licencia.estado             ?? 'Libre',
        idEmpresaUsuario:  licencia.idEmpresaUsuario   ?? '',
        idEmpresaLicencia: licencia.idEmpresaLicencia  ?? '',
        puesto:            licencia.puesto             ?? '',
        periodo:           licencia.periodo            ?? '',
      });
    } else {
      reset({
        codigoOfi:         nextOfi ?? '',   // ← auto-completado
        estado:            'Libre',
        idEmpresaUsuario:  '',
        idEmpresaLicencia: '',
        puesto:            '',
        periodo:           '',
      });
    }
  }, [licencia, nextOfi, reset, show]);

  const onSubmit = (data) => {
    onSave({
      codigoOfi:         data.codigoOfi,
      estado:            data.estado,
      idEmpresaUsuario:  data.idEmpresaUsuario  ? parseInt(data.idEmpresaUsuario)  : null,
      idEmpresaLicencia: data.idEmpresaLicencia ? parseInt(data.idEmpresaLicencia) : null,
      puesto:            data.puesto  || null,
      periodo:           data.periodo || null,
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          {isEdit ? `Editar licencia — ${licencia?.codigoOfi}` : 'Nueva licencia'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ padding: '20px 24px' }}>

          {/* ── Datos de oficina ── */}
          <p style={sectionTitle}>Datos de oficina</p>
          <Row className="mb-3 g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Oficina <span className="text-danger">*</span>
                  {!isEdit && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>auto-generado</span>}
                </Form.Label>
                <Form.Control
                  {...register('codigoOfi', {
                    required: 'El código de oficina es obligatorio',
                    pattern: {
                      value: /^OFI\d{1,4}$/i,
                      message: 'Formato inválido. Ej: OFI58',
                    },
                    maxLength: { value: 8, message: 'Máximo 8 caracteres' },
                  })}
                  placeholder="Ej: OFI58"
                  isInvalid={!!errors.codigoOfi}
                  disabled={isEdit}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.codigoOfi?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Estado</Form.Label>
                <Form.Select {...register('estado', { required: true })} style={inputStyle}>
                  <option value="Libre">Libre</option>
                  <option value="Ocupado">Ocupado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Período</Form.Label>
                <Form.Control
                  {...register('periodo', {
                    pattern: {
                      value: /^\d{4,6}$/,
                      message: 'Solo números. Ej: 2024 o 202401',
                    },
                    maxLength: { value: 6, message: 'Máximo 6 dígitos' },
                  })}
                  placeholder="Ej: 2024"
                  isInvalid={!!errors.periodo}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.periodo?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3 g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label style={labelStyle}>Puesto / Cargo</Form.Label>
                <Form.Control
                  {...register('puesto', {
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                    pattern: {
                      value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s/\-.,()]+$/i,
                      message: 'Solo letras, números y caracteres básicos',
                    },
                  })}
                  placeholder="Ej: Jefe de compras"
                  isInvalid={!!errors.puesto}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.puesto?.message}
                </Form.Control.Feedback>
                <Form.Text style={{ fontSize: 11, color: '#9ca3af' }}>Opcional · máx. 100 caracteres</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* ── Empresa ── */}
          <p style={{ ...sectionTitle, marginTop: 8 }}>Empresa</p>
          <Row className="mb-2 g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>Empresa del usuario <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  {...register('idEmpresaUsuario', { required: 'Selecciona la empresa del usuario' })}
                  isInvalid={!!errors.idEmpresaUsuario}
                  style={inputStyle}
                >
                  <option value="">Seleccionar empresa...</option>
                  {empresas.map(e => (
                    <option key={e.idEmpresa} value={e.idEmpresa}>{e.codigo} — {e.nombre}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.idEmpresaUsuario?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>Empresa de la licencia <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span></Form.Label>
                <Form.Select {...register('idEmpresaLicencia')} style={inputStyle}>
                  <option value="">Seleccionar empresa...</option>
                  {empresas.map(e => (
                    <option key={e.idEmpresa} value={e.idEmpresa}>{e.codigo} — {e.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
          <BtnCancel onClick={onHide} disabled={saving}>Cancelar</BtnCancel>
          <BtnSubmit disabled={saving} saving={saving} isEdit={isEdit} />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default LicenciaModal;
