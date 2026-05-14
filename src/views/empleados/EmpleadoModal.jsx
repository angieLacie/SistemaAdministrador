import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const EmpleadoModal = ({ show, onHide, onSave, empleado, saving = false }) => {
  const isEdit = !!empleado;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (empleado) {
      reset({
        nombre:               empleado.nombre              ?? '',
        apellidoPaterno:      empleado.apellidoPaterno      ?? '',
        apellidoMaterno:      empleado.apellidoMaterno      ?? '',
        documentoIdentidad:   empleado.documentoIdentidad   ?? '',
        genero:               empleado.genero               ?? '',
        tiendaActual:         empleado.tiendaActual         ?? '',
        puesto:               empleado.puesto               ?? '',
        puestoActual:         empleado.puestoActual         ?? '',
        tipoTrabajo:          empleado.tipoTrabajo          ?? '',
      });
    } else {
      reset({
        empleadoId:           '',
        nombre:               '',
        apellidoPaterno:      '',
        apellidoMaterno:      '',
        tipoDocumentoIdentidad: 1,
        documentoIdentidad:   '',
        genero:               '',
        tiendaOrigen:         '',
        tiendaActual:         '',
        empresaOrigen:        '',
        puesto:               '',
        tipoTrabajo:          '',
      });
    }
  }, [empleado, show, reset]);

  const onSubmit = (data) => {
    const payload = isEdit ? {
      nombre:             data.nombre             || null,
      apellidoPaterno:    data.apellidoPaterno     || null,
      apellidoMaterno:    data.apellidoMaterno     || null,
      documentoIdentidad: data.documentoIdentidad  || null,
      genero:             data.genero              || null,
      tiendaActual:       data.tiendaActual        || null,
      puesto:             data.puesto              || null,
      puestoActual:       data.puestoActual        || null,
      tipoTrabajo:        data.tipoTrabajo         || null,
      usuarioModificacion: 'ADMIN',
    } : {
      empleadoId:              data.empleadoId,
      nombre:                  data.nombre             || null,
      apellidoPaterno:         data.apellidoPaterno     || null,
      apellidoMaterno:         data.apellidoMaterno     || null,
      tipoDocumentoIdentidad:  parseInt(data.tipoDocumentoIdentidad) || 1,
      documentoIdentidad:      data.documentoIdentidad  || null,
      genero:                  data.genero              || null,
      tiendaOrigen:            data.tiendaOrigen        || null,
      tiendaActual:            data.tiendaActual        || null,
      empresaOrigen:           data.empresaOrigen       || null,
      puesto:                  data.puesto              || null,
      tipoTrabajo:             data.tipoTrabajo         || null,
      usuarioCreacion:         'ADMIN',
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? `Editar empleado — ${empleado?.empleado}` : 'Nuevo empleado'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>

          {/* Datos personales */}
          <p className="text-muted fw-semibold small text-uppercase mb-2">Datos personales</p>
          <Row className="mb-3">
            {!isEdit && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Código empleado <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    {...register('empleadoId', { required: 'Campo requerido' })}
                    placeholder="Ej: 0000001234"
                    isInvalid={!!errors.empleadoId}
                    className="font-monospace"
                  />
                  <Form.Control.Feedback type="invalid">{errors.empleadoId?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md={isEdit ? 4 : 3}>
              <Form.Group>
                <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  {...register('nombre', { required: 'Campo requerido' })}
                  placeholder="Nombre"
                  isInvalid={!!errors.nombre}
                />
                <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={isEdit ? 4 : 3}>
              <Form.Group>
                <Form.Label>Apellido paterno <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  {...register('apellidoPaterno', { required: 'Campo requerido' })}
                  placeholder="Apellido paterno"
                  isInvalid={!!errors.apellidoPaterno}
                />
                <Form.Control.Feedback type="invalid">{errors.apellidoPaterno?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={isEdit ? 4 : 3}>
              <Form.Group>
                <Form.Label>Apellido materno</Form.Label>
                <Form.Control {...register('apellidoMaterno')} placeholder="Apellido materno"/>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tipo documento</Form.Label>
                <Form.Select {...register('tipoDocumentoIdentidad')}>
                  <option value={1}>DNI</option>
                  <option value={2}>CE</option>
                  <option value={3}>Pasaporte</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Nro. documento</Form.Label>
                <Form.Control
                  {...register('documentoIdentidad')}
                  placeholder="Ej: 12345678"
                  className="font-monospace"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Género</Form.Label>
                <Form.Select {...register('genero')}>
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Datos laborales */}
          <p className="text-muted fw-semibold small text-uppercase mb-2 mt-3">Datos laborales</p>
          <Row className="mb-3">
            {!isEdit && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Tienda origen</Form.Label>
                  <Form.Control {...register('tiendaOrigen')} placeholder="Ej: T001" className="font-monospace"/>
                </Form.Group>
              </Col>
            )}
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tienda actual</Form.Label>
                <Form.Control {...register('tiendaActual')} placeholder="Ej: T001" className="font-monospace"/>
              </Form.Group>
            </Col>
            {!isEdit && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Empresa origen</Form.Label>
                  <Form.Control {...register('empresaOrigen')} placeholder="Ej: EMP01" className="font-monospace"/>
                </Form.Group>
              </Col>
            )}
            <Col md={3}>
              <Form.Group>
                <Form.Label>Puesto</Form.Label>
                <Form.Control {...register('puesto')} placeholder="Ej: ASESOR"/>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tipo trabajo</Form.Label>
                <Form.Select {...register('tipoTrabajo')}>
                  <option value="">Seleccionar...</option>
                  <option value="PLANILLA">Planilla</option>
                  <option value="CONTRATO">Contrato</option>
                  <option value="PRACTICANTE">Practicante</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {!isEdit && (
            <div className="alert alert-info py-2 mt-2" style={{ fontSize: 12 }}>
              <strong>Usuario generado automáticamente:</strong> 1ra letra del nombre + apellido paterno. 
              La clave inicial será el número de documento.
            </div>
          )}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar empleado'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EmpleadoModal;