import { useEffect } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaArrowDown } from 'react-icons/fa6';

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

const BtnSubmit = ({ disabled, saving }) => (
  <button type="submit" disabled={disabled}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7, border:'1.5px solid #16a34a', background:'#f0fdf4', color:'#16a34a', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, transition:'all 0.15s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background='#16a34a'; e.currentTarget.style.color='white'; }}}
    onMouseLeave={e => { e.currentTarget.style.background='#f0fdf4'; e.currentTarget.style.color='#16a34a'; }}>
    {saving ? 'Guardando...' : 'Confirmar cambio'}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
const CambioUsuarioModal = ({ show, onHide, onSave, licencia, ocs = [], saving = false }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (licencia) {
      reset({
        nombreUsuarioNuevo: '',
        puestoNuevo:        licencia.puesto ?? '',
        idOc:               licencia.idOc   ?? '',
        motivo:             '',
      });
    }
  }, [licencia, reset, show]);

  const onSubmit = (data) => {
    const payload = {
      idUsuarioNuevo:     null,
      nombreUsuarioNuevo: data.nombreUsuarioNuevo,
      idOc:               data.idOc ? parseInt(data.idOc) : null,
      numeroOc:           ocs.find(o => o.idOc === parseInt(data.idOc))?.numeroOc ?? null,
      puestoNuevo:        data.puestoNuevo || null,
      motivo:             data.motivo      || null,
      realizadoPor:       null,
    };
    onSave(payload);
  };

  if (!licencia) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <div>
          <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
            Cambio de usuario
          </Modal.Title>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            <span style={{ fontWeight: 600, color: '#185FA5' }}>{licencia.codigoOfi}</span>
            {' · '}{licencia.empresaUsuario}
          </div>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ padding: '20px 24px' }}>

          {/* ── Usuario actual ── */}
          <p style={sectionTitle}>Usuario actual</p>
          <div style={{ padding: '12px 16px', borderRadius: 8, background: '#eff6ff', border: '1.5px solid #bfdbfe', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{licencia.usuarioActual}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {licencia.puesto} · {licencia.empresaUsuario}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, backgroundColor: '#dcfce7', color: '#166534' }}>
                {licencia.estado}
              </span>
            </div>
          </div>

          {/* Flecha */}
          <div style={{ textAlign: 'center', margin: '10px 0', color: '#9ca3af' }}>
            <FaArrowDown size={14} />
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
              Se reemplazará por
            </div>
          </div>

          {/* ── Nuevo usuario ── */}
          <div style={{ padding: '14px 16px', borderRadius: 8, background: '#f0fdf4', border: '1.5px solid #bbf7d0', marginBottom: 16 }}>
            <p style={{ ...sectionTitle, color: '#16a34a', marginBottom: 12 }}>Nuevo usuario asignado</p>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={labelStyle}>
                    Nombre <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    {...register('nombreUsuarioNuevo', {
                      required: 'Ingresa el nombre del nuevo usuario',
                      maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                      pattern: {
                        value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/i,
                        message: 'Solo letras y espacios',
                      },
                    })}
                    placeholder="Nombre completo del nuevo usuario"
                    isInvalid={!!errors.nombreUsuarioNuevo}
                    style={inputStyle}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                    {errors.nombreUsuarioNuevo?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={labelStyle}>
                    Puesto / Cargo <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span>
                  </Form.Label>
                  <Form.Control
                    {...register('puestoNuevo', {
                      maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                    })}
                    placeholder="Cargo del nuevo usuario"
                    isInvalid={!!errors.puestoNuevo}
                    style={inputStyle}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                    {errors.puestoNuevo?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* ── Motivo ── */}
          <p style={sectionTitle}>Motivo del cambio</p>
          <Form.Group>
            <Form.Label style={labelStyle}>
              Descripción <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              {...register('motivo', {
                maxLength: { value: 300, message: 'Máximo 300 caracteres' },
              })}
              placeholder="Descripción breve del motivo del cambio..."
              isInvalid={!!errors.motivo}
              style={{ ...inputStyle, resize: 'none' }}
            />
            <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
              {errors.motivo?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 12, color: '#0369a1' }}>
            El usuario anterior quedará registrado en el historial de la licencia.
          </div>

        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
          <BtnCancel onClick={onHide} disabled={saving}>Cancelar</BtnCancel>
          <BtnSubmit disabled={saving} saving={saving} />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CambioUsuarioModal;
