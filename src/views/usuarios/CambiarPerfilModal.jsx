import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

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
      <Modal.Header closeButton>
        <Modal.Title>Cambiar perfil — {usuario?.usuarioId}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>

          {/* Perfil actual */}
          <div className="p-3 rounded mb-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <p className="text-muted small mb-1 text-uppercase" style={{ fontSize: 10 }}>Perfil actual</p>
            <p className="fw-semibold mb-0">{usuario?.perfilDescripcion ?? '—'}</p>
          </div>

          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Nuevo perfil <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  {...register('perfilId', { required: 'Campo requerido' })}
                  isInvalid={!!errors.perfilId}
                >
                  <option value="">Seleccionar perfil...</option>
                  {perfiles.map(p => (
                    <option key={p.perfilId} value={p.perfilId}>
                      {p.descripcion}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.perfilId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Confirmar cambio'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CambiarPerfilModal;
