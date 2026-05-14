import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const ClaveModal = ({ show, onHide, onSave, usuario, saving = false }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    reset({ nuevaClave: '' });
  }, [show, reset]);

  const onSubmit = (data) => {
    onSave({ nuevaClave: data.nuevaClave });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cambiar clave — {usuario?.usuarioId}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Nueva clave <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="password"
                  {...register('nuevaClave', { required: 'Campo requerido' })}
                  placeholder="Ingresa la nueva clave"
                  isInvalid={!!errors.nuevaClave}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nuevaClave?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="warning" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Actualizar clave'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ClaveModal;
