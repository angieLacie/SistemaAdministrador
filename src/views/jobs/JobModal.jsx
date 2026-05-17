import { useState, useEffect } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';

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

const BtnSubmit = ({ onClick, disabled, saving, isEdit }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, transition:'all 0.15s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}}
    onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
    {saving ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Guardar cambios' : 'Crear Job')}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
const JobModal = ({ show, onHide, onSave, job = null, tipos = [], saving = false }) => {
  const esEditar = !!job;

  const [formData, setFormData] = useState({
    jobDescripcion: '',
    cronExpression: '',
    jobClave:       '',
    tipo:           '',
    orden:          '',
    estado:         'A',
  });

  useEffect(() => {
    setFormData({
      jobDescripcion: job?.jobDescripcion ?? '',
      cronExpression: job?.cronExpression ?? '',
      jobClave:       job?.jobClave       ?? '',
      tipo:           job?.tipo           ?? '',
      orden:          job?.orden          ?? '',
      estado:         job?.estado         ?? 'A',
    });
  }, [job, show]);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () =>
    onSave({ ...formData, orden: formData.orden ? parseInt(formData.orden) : null });

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          {esEditar ? `Editar Job — ${job?.jobId}` : 'Nuevo Job'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '20px 24px' }}>

        {/* ── Datos del job ── */}
        <p style={sectionTitle}>Datos del job</p>
        <Row className="mb-3 g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label style={labelStyle}>Descripción</Form.Label>
              <Form.Control
                name="jobDescripcion"
                value={formData.jobDescripcion}
                onChange={handleChange}
                placeholder="Descripción del job"
                style={inputStyle}
              />
            </Form.Group>
          </Col>
          <Col md={esEditar ? 4 : 6}>
            <Form.Group>
              <Form.Label style={labelStyle}>Tipo</Form.Label>
              <Form.Select name="tipo" value={formData.tipo} onChange={handleChange} style={inputStyle}>
                <option value="">Seleccionar...</option>
                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={esEditar ? 4 : 6}>
            <Form.Group>
              <Form.Label style={labelStyle}>Orden</Form.Label>
              <Form.Control
                type="number"
                name="orden"
                value={formData.orden}
                onChange={handleChange}
                placeholder="Ej: 1"
                style={inputStyle}
              />
            </Form.Group>
          </Col>
          {esEditar && (
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Estado</Form.Label>
                <Form.Select name="estado" value={formData.estado} onChange={handleChange} style={inputStyle}>
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          )}
        </Row>

        {/* ── Configuración técnica ── */}
        <p style={{ ...sectionTitle, marginTop: 4 }}>Configuración técnica</p>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={labelStyle}>Cron Expression</Form.Label>
              <Form.Control
                name="cronExpression"
                value={formData.cronExpression}
                onChange={handleChange}
                placeholder="Ej: 0 0/2 * * *"
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
              <Form.Text style={{ fontSize: 11, color: '#9ca3af' }}>
                Formato: segundos minutos horas día mes día-semana
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={labelStyle}>Job Clave</Form.Label>
              <Form.Control
                name="jobClave"
                value={formData.jobClave}
                onChange={handleChange}
                placeholder="Clave identificadora del job"
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
            </Form.Group>
          </Col>
        </Row>

      </Modal.Body>

      <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
        <BtnCancel onClick={onHide} disabled={saving}>Cancelar</BtnCancel>
        <BtnSubmit onClick={handleSave} disabled={saving} saving={saving} isEdit={esEditar} />
      </Modal.Footer>
    </Modal>
  );
};

export default JobModal;
