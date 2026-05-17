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
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, transition:'all 0.15s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}}
    onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
    {saving ? 'Guardando...' : 'Confirmar cambio'}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
const CambiarPerfilModal = ({ show, onHide, onSave, usuario, perfiles = [], saving = false }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    reset({ perfilId: usuario?.perfil ?? '' });
  }, [usuario, show, reset]);

  const onSubmit = (data) => {
    onSave({ perfilId: parseInt(data.perfilId) });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          Cambiar perfil — <span style={{ color: '#185FA5' }}>{usuario?.usuarioId}</span>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ padding: '20px 24px' }}>

          {/* ── Perfil actual ── */}
          <p style={sectionTitle}>Perfil actual</p>
          <div style={{ padding: '12px 16px', borderRadius: 8, background: '#f0f9ff', border: '1.5px solid #bae6fd', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              Asignado actualmente
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>
              {usuario?.perfilDescripcion ?? <span style={{ color: '#9ca3af', fontWeight: 400 }}>Sin perfil asignado</span>}
            </div>
          </div>

          {/* ── Nuevo perfil ── */}
          <p style={sectionTitle}>Nuevo perfil</p>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Seleccionar perfil <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  {...register('perfilId', { required: 'Debes seleccionar un perfil' })}
                  isInvalid={!!errors.perfilId}
                  style={inputStyle}
                >
                  <option value="">Seleccionar perfil...</option>
                  {perfiles.map(p => (
                    <option key={p.perfilId} value={p.perfilId}>
                      {p.descripcion}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.perfilId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
          <BtnCancel onClick={onHide} disabled={saving}>Cancelar</BtnCancel>
          <BtnSubmit disabled={saving} saving={saving} />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CambiarPerfilModal;
