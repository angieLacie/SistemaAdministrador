import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const LicenciaModal = ({ show, onHide, onSave, licencia, empresas = [], ocs = [], saving = false }) => {
  const isEdit = !!licencia;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (licencia) {
      reset({
        codigoOfi:          licencia.codigoOfi         ?? '',
        estado:             licencia.estado             ?? 'Libre',
        idEmpresaUsuario:   licencia.idEmpresaUsuario   ?? '',
        idEmpresaLicencia:  licencia.idEmpresaLicencia  ?? '',
         
        puesto:             licencia.puesto             ?? '',
        periodo:            licencia.periodo            ?? '',
      });
    } else {
      reset({
        codigoOfi:         '',
        estado:            'Libre',
        idEmpresaUsuario:  '',
        idEmpresaLicencia: '',
         
        puesto:            '',
        periodo:           '',
      });
    }
  }, [licencia, reset, show]);

  const onSubmit = (data) => {
    // Convertir a números los IDs
    const payload = {
      codigoOfi:         data.codigoOfi,
      estado:            data.estado,
      idEmpresaUsuario:  data.idEmpresaUsuario  ? parseInt(data.idEmpresaUsuario)  : null,
      idEmpresaLicencia: data.idEmpresaLicencia ? parseInt(data.idEmpresaLicencia) : null,
      
      puesto:            data.puesto  || null,
      periodo:           data.periodo || null,
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? `Editar licencia — ${licencia?.codigoOfi}` : 'Nueva licencia'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>

          {/* Datos de oficina */}
          <p className="text-muted fw-semibold small text-uppercase mb-2">
            Datos de oficina
          </p>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Oficina <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  {...register('codigoOfi', { required: 'Campo requerido' })}
                  placeholder="Ej: OFI11"
                  isInvalid={!!errors.codigoOfi}
                  disabled={isEdit}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.codigoOfi?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select {...register('estado')}>
                  <option value="Libre">Libre</option>
                  <option value="Ocupado">Ocupado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Período</Form.Label>
                <Form.Control
                  {...register('periodo')}
                  placeholder="Ej: 2024"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Puesto */}
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Puesto / Cargo</Form.Label>
                <Form.Control
                  {...register('puesto')}
                  placeholder="Ej: Jefe de compras"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Empresa */}
          <p className="text-muted fw-semibold small text-uppercase mb-2 mt-3">
            Empresa
          </p>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Empresa del usuario <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  {...register('idEmpresaUsuario', { required: 'Campo requerido' })}
                  isInvalid={!!errors.idEmpresaUsuario}
                >
                  <option value="">Seleccionar empresa...</option>
                  {empresas.map((e) => (
                    <option key={e.idEmpresa} value={e.idEmpresa}>
                      {e.codigo} - {e.nombre}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.idEmpresaUsuario?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Empresa de la licencia</Form.Label>
                <Form.Select {...register('idEmpresaLicencia')}>
                  <option value="">Seleccionar empresa...</option>
                  {empresas.map((e) => (
                    <option key={e.idEmpresa} value={e.idEmpresa}>
                      {e.codigo} - {e.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          

        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar licencia'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default LicenciaModal;
