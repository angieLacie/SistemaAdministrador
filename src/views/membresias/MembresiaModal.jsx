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
    {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar membresía'}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
const MembresiaModal = ({ show, onHide, onSave, membresia, saving = false }) => {
  const isEdit = !!membresia;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (membresia) {
      reset({
        codigoProyecto:      membresia.codigoProyecto      ?? '',
        nombreRequerimiento: membresia.nombreRequerimiento ?? '',
        periodo:             membresia.periodo             ?? '',
      });
    } else {
      reset({
        codigoProyecto:      '',
        nombreRequerimiento: '',
        periodo:             '',
      });
    }
  }, [membresia, reset, show]);

  const onSubmit = (data) => {
    const payload = {
      codigoProyecto:      data.codigoProyecto,
      nombreRequerimiento: data.nombreRequerimiento || null,
      periodo:             data.periodo             || null,
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          {isEdit ? `Editar membresía — ${membresia?.codigoProyecto}` : 'Nueva membresía'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ padding: '20px 24px' }}>

          {/* ── Datos de membresía ── */}
          <p style={sectionTitle}>Datos de membresía</p>
          <Row className="mb-3 g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Código proyecto <span className="text-danger">*</span>
                  {!isEdit && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>único</span>}
                </Form.Label>
                <Form.Control
                  {...register('codigoProyecto', {
                    required: 'El código de proyecto es obligatorio',
                    maxLength: { value: 30, message: 'Máximo 30 caracteres' },
                    pattern: {
                      value: /^[A-Z0-9\-_]+$/i,
                      message: 'Solo letras, números, guiones y guión bajo',
                    },
                  })}
                  placeholder="Ej: AV-20220087"
                  isInvalid={!!errors.codigoProyecto}
                  disabled={isEdit}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.codigoProyecto?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Período <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span>
                </Form.Label>
                <Form.Control
                  {...register('periodo', {
                    pattern: {
                      value: /^\d{4,6}$/,
                      message: 'Solo números. Ej: 2024 o 202401',
                    },
                    maxLength: { value: 6, message: 'Máximo 6 dígitos' },
                  })}
                  placeholder="Ej: 202208"
                  isInvalid={!!errors.periodo}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.periodo?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-2 g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Nombre requerimiento <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span>
                </Form.Label>
                <Form.Control
                  {...register('nombreRequerimiento', {
                    maxLength: { value: 200, message: 'Máximo 200 caracteres' },
                  })}
                  placeholder="Ej: Membresía 2022"
                  isInvalid={!!errors.nombreRequerimiento}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.nombreRequerimiento?.message}
                </Form.Control.Feedback>
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

export default MembresiaModal;
