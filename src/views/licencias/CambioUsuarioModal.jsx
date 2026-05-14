import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaArrowDown } from 'react-icons/fa6';

const CambioUsuarioModal = ({ show, onHide, onSave, licencia, ocs = [], saving = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (licencia) {
      reset({
        nombreUsuarioNuevo: '',
        puestoNuevo:        licencia.puesto ?? '',
        idOc:               licencia.idOc   ?? '',
        motivo:             '',
      });
    }
  }, [licencia, reset, show]);

  const onSubmit = (data) => {
    const payload = {
      idUsuarioNuevo:    null,
      nombreUsuarioNuevo: data.nombreUsuarioNuevo,
      idOc:              data.idOc ? parseInt(data.idOc) : null,
      numeroOc:          ocs.find(o => o.idOc === parseInt(data.idOc))?.numeroOc ?? null,
      puestoNuevo:       data.puestoNuevo  || null,
      motivo:            data.motivo       || null,
      realizadoPor:      null,
    };
    onSave(payload);
  };

  if (!licencia) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <div>
          <Modal.Title>Cambio de usuario</Modal.Title>
          <small className="text-muted">
            {licencia.codigoOfi} · {licencia.empresaUsuario}
          </small>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>

          {/* Usuario actual */}
          <div
            className="p-3 rounded mb-2"
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
          >
            <p className="fw-semibold small text-uppercase mb-1" style={{ color: '#1d4ed8', fontSize: '10px' }}>
              Usuario actual
            </p>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="mb-0 fw-semibold">{licencia.usuarioActual}</p>
                <small className="text-muted">
                  {licencia.puesto} · {licencia.empresaUsuario}
                </small>
              </div>
              <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>
                {licencia.estado}
              </span>
            </div>
          </div>

          {/* Flecha */}
          <div className="text-center my-2 text-primary">
            <FaArrowDown />
            <small className="d-block text-muted" style={{ fontSize: '10px' }}>
              Se reemplazará por
            </small>
          </div>

          {/* Nuevo usuario */}
          <div
            className="p-3 rounded mb-3"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
          >
            <p className="fw-semibold small text-uppercase mb-2" style={{ color: '#16a34a', fontSize: '10px' }}>
              Nuevo usuario asignado
            </p>
            <Form.Group className="mb-2">
              <Form.Label className="small">
                Nombre <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                {...register('nombreUsuarioNuevo', { required: 'Ingresa el nombre del nuevo usuario' })}
                placeholder="Nombre completo del nuevo usuario"
                isInvalid={!!errors.nombreUsuarioNuevo}
              />
              <Form.Control.Feedback type="invalid">
                {errors.nombreUsuarioNuevo?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label className="small">Puesto / Cargo</Form.Label>
              <Form.Control
                {...register('puestoNuevo')}
                placeholder="Cargo del nuevo usuario"
              />
            </Form.Group>
          </div>

          

          {/* Motivo */}
          <Form.Group>
            <Form.Label className="small fw-semibold">Motivo del cambio</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              {...register('motivo')}
              placeholder="Descripción breve del motivo del cambio..."
            />
          </Form.Group>

          <Alert variant="info" className="mt-3 mb-0 small py-2">
            El usuario anterior quedará registrado en el historial de la licencia.
          </Alert>

        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="success" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Confirmar cambio'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CambioUsuarioModal;
