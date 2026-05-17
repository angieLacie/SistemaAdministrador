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

const BtnSubmit = ({ disabled, saving, label }) => (
  <button type="submit" disabled={disabled}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, transition:'all 0.15s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}}
    onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
    {saving ? 'Guardando...' : label}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
const UsuarioModal = ({ show, onHide, onSave, usuario, saving = false }) => {
  const isEdit = !!usuario;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (usuario) {
      reset({
        nombreUsuario:  usuario.nombreUsuario  ?? '',
        empleado:       usuario.empleado       ?? '',
        estadoUsuario:  usuario.estadoUsuario  ?? 'A',
        cambioPassword: usuario.cambioPassword ?? 0,
      });
    } else {
      reset({
        usuarioId:      '',
        nombreUsuario:  '',
        empleado:       '',
        estadoUsuario:  'A',
        cambioPassword: 0,
        clave:          '',
      });
    }
  }, [usuario, reset, show]);

  const onSubmit = (data) => {
    const payload = {
      ...(!isEdit && { usuarioId: data.usuarioId }),
      nombreUsuario:  data.nombreUsuario  || null,
      empleado:       data.empleado       || null,
      estadoUsuario:  data.estadoUsuario,
      cambioPassword: parseInt(data.cambioPassword) || 0,
      ...(!isEdit && { clave: data.clave || null }),
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          {isEdit ? `Editar usuario — ${usuario?.usuarioId}` : 'Nuevo usuario'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ padding: '20px 24px' }}>

          {/* ── Datos del usuario ── */}
          <p style={sectionTitle}>Datos del usuario</p>
          <Row className="mb-3 g-3">
            {!isEdit && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={labelStyle}>
                    Usuario <span className="text-danger">*</span>
                    <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>código único</span>
                  </Form.Label>
                  <Form.Control
                    {...register('usuarioId', {
                      required: 'El código de usuario es obligatorio',
                      maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                      pattern: {
                        value: /^[A-Z0-9_\-]+$/i,
                        message: 'Solo letras, números, guiones y guión bajo',
                      },
                    })}
                    placeholder="Ej: CGARCIA"
                    isInvalid={!!errors.usuarioId}
                    style={{ ...inputStyle, textTransform: 'uppercase' }}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                    {errors.usuarioId?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md={isEdit ? 9 : 5}>
              <Form.Group>
                <Form.Label style={labelStyle}>Nombre completo</Form.Label>
                <Form.Control
                  {...register('nombreUsuario', {
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                    pattern: {
                      value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/i,
                      message: 'Solo letras y espacios',
                    },
                  })}
                  placeholder="Nombre completo del usuario"
                  isInvalid={!!errors.nombreUsuario}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.nombreUsuario?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Estado</Form.Label>
                <Form.Select {...register('estadoUsuario', { required: true })} style={inputStyle}>
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                  <option value="B">Bloqueado</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3 g-3">
            <Col md={5}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Empleado <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span>
                </Form.Label>
                <Form.Control
                  {...register('empleado', {
                    maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                    pattern: {
                      value: /^[A-Z0-9]+$/i,
                      message: 'Solo letras y números',
                    },
                  })}
                  placeholder="Código de empleado"
                  isInvalid={!!errors.empleado}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.empleado?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Cambio de contraseña</Form.Label>
                <Form.Select {...register('cambioPassword')} style={inputStyle}>
                  <option value={0}>No requerido</option>
                  <option value={1}>Requerido al ingresar</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* ── Clave inicial (solo nuevo) ── */}
          {!isEdit && (
            <>
              <p style={{ ...sectionTitle, marginTop: 8 }}>Clave inicial</p>
              <Row className="mb-2 g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      Clave <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>opcional</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      {...register('clave', {
                        minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                        maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                      })}
                      placeholder="Clave inicial del usuario"
                      isInvalid={!!errors.clave}
                      style={inputStyle}
                    />
                    <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                      {errors.clave?.message}
                    </Form.Control.Feedback>
                    <Form.Text style={{ fontSize: 11, color: '#9ca3af' }}>
                      Si no se ingresa, el usuario deberá establecerla al primer ingreso
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
          <BtnCancel onClick={onHide} disabled={saving}>Cancelar</BtnCancel>
          <BtnSubmit disabled={saving} saving={saving}
            label={isEdit ? 'Guardar cambios' : 'Registrar usuario'} />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UsuarioModal;
