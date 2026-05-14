import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const MembresiaModal = ({ show, onHide, onSave, membresia, saving = false }) => {
  const isEdit = !!membresia;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

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
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? `Editar membresía — ${membresia?.codigoProyecto}` : 'Nueva membresía'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>

          <p className="text-muted fw-semibold small text-uppercase mb-2">
            Datos de membresía
          </p>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Código Proyecto <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  {...register('codigoProyecto', { required: 'Campo requerido' })}
                  placeholder="Ej: AV-20220087"
                  isInvalid={!!errors.codigoProyecto}
                  disabled={isEdit}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.codigoProyecto?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Período</Form.Label>
                <Form.Control
                  {...register('periodo')}
                  placeholder="Ej: 202208"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Nombre Requerimiento</Form.Label>
                <Form.Control
                  {...register('nombreRequerimiento')}
                  placeholder="Ej: Membresía 2022"
                />
              </Form.Group>
            </Col>
          </Row>

        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar membresía'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MembresiaModal;
