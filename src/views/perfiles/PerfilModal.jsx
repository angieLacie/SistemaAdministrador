import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

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
      descripcion:        data.descripcion    || null,
      estadoPerfil:       data.estadoPerfil,
      perfilRMS:          data.perfilRMS      || null,
      flagChecklist:      data.flagChecklist  === 'true' || data.flagChecklist === true,
      flagTienda:         data.flagTienda     === 'true' || data.flagTienda    === true,
      usuarioModificacion: 'ADMIN',
      usuarioCreacion:     'ADMIN',
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? `Editar perfil — ${perfil?.descripcion}` : 'Nuevo perfil'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>

          <p className="text-muted fw-semibold small text-uppercase mb-2">Datos del perfil</p>

          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Descripción <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  {...register('descripcion', { required: 'Campo requerido' })}
                  placeholder="Ej: ASESOR"
                  isInvalid={!!errors.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.descripcion?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select {...register('estadoPerfil')}>
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Perfil RMS</Form.Label>
                <Form.Control
                  {...register('perfilRMS')}
                  placeholder="Ej: ASESOR_RMS"
                  className="font-monospace"
                />
              </Form.Group>
            </Col>
          </Row>
 
          <Row className="mb-3">
            <Col md={6}>
              <Form.Check
                type="switch"
                id="flagChecklist"
                label="Checklist"
                {...register('flagChecklist')}
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="switch"
                id="flagTienda"
                label="Tienda"
                {...register('flagTienda')}
              />
            </Col>
          </Row>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar perfil'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PerfilModal;