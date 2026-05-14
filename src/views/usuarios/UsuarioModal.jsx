import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const UsuarioModal = ({ show, onHide, onSave, usuario, perfiles = [], saving = false }) => {
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
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? `Editar usuario — ${usuario?.usuarioId}` : 'Nuevo usuario'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>

          <p className="text-muted fw-semibold small text-uppercase mb-2">Datos del usuario</p>
          <Row className="mb-3">
            {!isEdit && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Usuario <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    {...register('usuarioId', { required: 'Campo requerido' })}
                    placeholder="Ej: CGARCIA"
                    isInvalid={!!errors.usuarioId}
                    className="font-monospace"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.usuarioId?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md={isEdit ? 6 : 5}>
              <Form.Group>
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  {...register('nombreUsuario')}
                  placeholder="Nombre del usuario"
                />
              </Form.Group>
            </Col>
            <Col md={isEdit ? 3 : 3}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select {...register('estadoUsuario')}>
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                  <option value="B">Bloqueado</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Empleado</Form.Label>
                <Form.Control
                  {...register('empleado')}
                  placeholder="Código de empleado"
                  className="font-monospace"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Cambio password</Form.Label>
                <Form.Select {...register('cambioPassword')}>
                  <option value={0}>No requerido</option>
                  <option value={1}>Requerido</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {!isEdit && (
            <>
              <p className="text-muted fw-semibold small text-uppercase mb-2 mt-3">Clave inicial</p>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Clave</Form.Label>
                    <Form.Control
                      type="password"
                      {...register('clave')}
                      placeholder="Clave inicial del usuario"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar usuario'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UsuarioModal;
