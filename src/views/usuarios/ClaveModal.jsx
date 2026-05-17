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

const BtnSubmit = ({ disabled, saving }) => (
  <button type="submit" disabled={disabled}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7, border:'1.5px solid #d97706', background:'#fffbeb', color:'#d97706', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, transition:'all 0.15s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background='#d97706'; e.currentTarget.style.color='white'; }}}
    onMouseLeave={e => { e.currentTarget.style.background='#fffbeb'; e.currentTarget.style.color='#d97706'; }}>
    {saving ? 'Guardando...' : 'Actualizar clave'}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
const ClaveModal = ({ show, onHide, onSave, usuario, saving = false }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  useEffect(() => {
    reset({ nuevaClave: '', confirmarClave: '' });
  }, [show, reset]);

  const nuevaClave = watch('nuevaClave');

  const onSubmit = (data) => {
    onSave({ nuevaClave: data.nuevaClave });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          Cambiar clave — <span style={{ color: '#185FA5' }}>{usuario?.usuarioId}</span>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ padding: '20px 24px' }}>

          <p style={sectionTitle}>Nueva contraseña</p>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Nueva clave <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  {...register('nuevaClave', {
                    required: 'La clave es obligatoria',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                    maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                  })}
                  placeholder="Ingresa la nueva clave"
                  isInvalid={!!errors.nuevaClave}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.nuevaClave?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Confirmar clave <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  {...register('confirmarClave', {
                    required: 'Confirma la clave',
                    validate: value => value === nuevaClave || 'Las claves no coinciden',
                  })}
                  placeholder="Repite la nueva clave"
                  isInvalid={!!errors.confirmarClave}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.confirmarClave?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 12, color: '#92400e' }}>
            La clave debe tener al menos 6 caracteres. El usuario deberá ingresarla en su próximo inicio de sesión.
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

export default ClaveModal;
