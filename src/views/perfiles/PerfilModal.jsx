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

const BtnSubmit = ({ disabled, saving, isEdit, label }) => (
  <button type="submit" disabled={disabled}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, transition:'all 0.15s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}}
    onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
    {saving ? 'Guardando...' : label}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
const PerfilModal = ({ show, onHide, onSave, perfil, saving = false }) => {
  const isEdit = !!perfil;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (perfil) {
      reset({
        descripcion:   perfil.descripcion   ?? '',
        estadoPerfil:  perfil.estadoPerfil  ?? 'A',
        perfilRMS:     perfil.perfilRMS     ?? '',
        flagChecklist: perfil.flagChecklist ?? false,
        flagTienda:    perfil.flagTienda    ?? false,
      });
    } else {
      reset({
        descripcion:   '',
        estadoPerfil:  'A',
        perfilRMS:     '',
        flagChecklist: false,
        flagTienda:    false,
      });
    }
  }, [perfil, reset, show]);

  const onSubmit = (data) => {
    const payload = {
      descripcion:         data.descripcion    || null,
      estadoPerfil:        data.estadoPerfil,
      perfilRMS:           data.perfilRMS      || null,
      flagChecklist:       data.flagChecklist  === 'true' || data.flagChecklist === true,
      flagTienda:          data.flagTienda     === 'true' || data.flagTienda    === true,
      usuarioModificacion: 'ADMIN',
      usuarioCreacion:     'ADMIN',
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          {isEdit ? `Editar perfil — ${perfil?.descripcion}` : 'Nuevo perfil'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ padding: '20px 24px' }}>

          {/* ── Datos del perfil ── */}
          <p style={sectionTitle}>Datos del perfil</p>
          <Row className="mb-3 g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Descripción <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  {...register('descripcion', {
                    required: 'La descripción es obligatoria',
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                    pattern: {
                      value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s_\-]+$/i,
                      message: 'Solo letras, números, espacios, guiones y guión bajo',
                    },
                  })}
                  placeholder="Ej: ASESOR"
                  isInvalid={!!errors.descripcion}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.descripcion?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Estado</Form.Label>
                <Form.Select {...register('estadoPerfil', { required: true })} style={inputStyle}>
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3 g-3">
            <Col md={7}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Perfil RMS <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span>
                </Form.Label>
                <Form.Control
                  {...register('perfilRMS', {
                    maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                    pattern: {
                      value: /^[A-Z0-9_\-]+$/i,
                      message: 'Solo letras, números, guiones y guión bajo',
                    },
                  })}
                  placeholder="Ej: ASESOR_RMS"
                  isInvalid={!!errors.perfilRMS}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.perfilRMS?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* ── Permisos ── */}
          <p style={{ ...sectionTitle, marginTop: 8 }}>Permisos</p>
          <Row className="mb-2 g-3">
            <Col md={6}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:8, border:'1.5px solid #dde1e7', background:'#fafafa' }}>
                <Form.Check
                  type="switch"
                  id="flagChecklist"
                  {...register('flagChecklist')}
                  style={{ marginBottom: 0 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Checklist</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Acceso al módulo checklist</div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:8, border:'1.5px solid #dde1e7', background:'#fafafa' }}>
                <Form.Check
                  type="switch"
                  id="flagTienda"
                  {...register('flagTienda')}
                  style={{ marginBottom: 0 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Tienda</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Acceso al módulo tienda</div>
                </div>
              </div>
            </Col>
          </Row>

        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
          <BtnCancel onClick={onHide} disabled={saving}>Cancelar</BtnCancel>
          <BtnSubmit disabled={saving} saving={saving} isEdit={isEdit}
            label={isEdit ? 'Guardar cambios' : 'Registrar perfil'} />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PerfilModal;
