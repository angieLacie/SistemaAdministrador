import { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Modal } from 'react-bootstrap';

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
      <Modal.Header closeButton>
        <Modal.Title>
          {esEditar ? `Editar Job — ${job?.jobId}` : 'Nuevo Job'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Label className="small fw-semibold">Descripción</Form.Label>
            <Form.Control
              name="jobDescripcion"
              value={formData.jobDescripcion}
              onChange={handleChange}
              placeholder="Descripción del job"/>
          </Col>
          <Col md={6}>
            <Form.Label className="small fw-semibold">Cron Expression</Form.Label>
            <Form.Control
              name="cronExpression"
              value={formData.cronExpression}
              onChange={handleChange}
              placeholder="Ej: 0 0/2 * * *"
              className="font-monospace"/>
          </Col>
          <Col md={6}>
            <Form.Label className="small fw-semibold">Job Clave</Form.Label>
            <Form.Control
              name="jobClave"
              value={formData.jobClave}
              onChange={handleChange}
              placeholder="Clave del job"
              className="font-monospace"/>
          </Col>
          <Col md={esEditar ? 4 : 6}>
            <Form.Label className="small fw-semibold">Tipo</Form.Label>
            <Form.Select name="tipo" value={formData.tipo} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </Form.Select>
          </Col>
          <Col md={esEditar ? 4 : 6}>
            <Form.Label className="small fw-semibold">Orden</Form.Label>
            <Form.Control
              type="number"
              name="orden"
              value={formData.orden}
              onChange={handleChange}
              placeholder="Ej: 1"/>
          </Col>
          {esEditar && (
            <Col md={4}>
              <Form.Label className="small fw-semibold">Estado</Form.Label>
              <Form.Select name="estado" value={formData.estado} onChange={handleChange}>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </Form.Select>
            </Col>
          )}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving
            ? (esEditar ? 'Guardando...' : 'Creando...')
            : (esEditar ? 'Guardar cambios' : 'Crear Job')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JobModal;