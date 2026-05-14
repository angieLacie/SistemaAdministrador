import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { proyectosService } from '@/services/proyectos.service';

const ProyectoModal = ({ show, onHide, onSave, proyecto, saving = false }) => {
  const isEdit = !!proyecto;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

useEffect(() => {
  if (proyecto) {
    reset({
      codProy:             proyecto.codProy             ?? '',
      analista:            proyecto.analista            ?? '',
      nombreRequerimiento: proyecto.nombreRequerimiento ?? '',
      keyUser:             proyecto.keyUser             ?? '',
      tipoDesarrollo:      proyecto.tipoDesarrollo      ?? '',
      distribucion:        proyecto.distribucion        ?? '',
      estado:              proyecto.estado              ?? '',
      estadoInterno:       proyecto.estadoInterno       ?? '',
      periodo:             proyecto.periodo             ?? '',
      historia:            proyecto.historia            ?? '',
      resumenAlcance:      proyecto.resumenAlcance      ?? '',
      montoTotalProyecto:  proyecto.montoTotalProyecto  ?? '',
    });
  } else {
    reset({
      codProy:             '',
      analista:            '',
      nombreRequerimiento: '',
      keyUser:             '',
      tipoDesarrollo:      '',
      distribucion:        '',
      estado:              '',
      estadoInterno:       '',
      periodo:             '',
      historia:            '',
      resumenAlcance:      '',
      montoTotalProyecto:  '',
    });
  }
}, [proyecto, show, reset]);

  const onSubmit = (data) => {
    const payload = {
      ...(!isEdit && { codProy: data.codProy }),
      analista:            data.analista            || null,
      nombreRequerimiento: data.nombreRequerimiento || null,
      keyUser:             data.keyUser             || null,
      tipoDesarrollo:      data.tipoDesarrollo      || null,
      distribucion:        data.distribucion        || null,
      estado:              data.estado,
      estadoInterno:       data.estadoInterno       || null,
      periodo:             data.periodo             || null,
      historia:            data.historia            || null,
      resumenAlcance:      data.resumenAlcance      || null,
      montoTotalProyecto:  data.montoTotalProyecto ? parseFloat(data.montoTotalProyecto) : null,
      usuarioCreacion:     'ADMIN',
      usuarioModificacion: 'ADMIN',
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? `Editar proyecto — ${proyecto?.codProy}` : 'Nuevo proyecto'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>

         <p className="text-muted fw-semibold small text-uppercase mb-2">Datos generales</p>
        <Row className="mb-3 g-2">
        <Col md={3}>
            <Form.Label className="small">Código <span className="text-danger">*</span></Form.Label>
            <Form.Control
            {...register('codProy', {
                required: !isEdit ? 'Requerido' : false,
                validate: async (value) => {
                if (isEdit || !value) return true;
                try {
                    await proyectosService.obtener(value);
                    return 'El código ya existe';
                } catch { return true; }
                }
            })}
            placeholder="Ej: PROY001"
            isInvalid={!!errors.codProy}
            className="font-monospace"
            disabled={isEdit}
            defaultValue={isEdit ? proyecto?.codProy : ''}
            />
            <Form.Control.Feedback type="invalid">{errors.codProy?.message}</Form.Control.Feedback>
        </Col>
        <Col md={4}>
            <Form.Label className="small">Nombre requerimiento <span className="text-danger">*</span></Form.Label>
            <Form.Control
            {...register('nombreRequerimiento', { required: 'Requerido' })}
            placeholder="Nombre del requerimiento"
            isInvalid={!!errors.nombreRequerimiento}
            />
            <Form.Control.Feedback type="invalid">{errors.nombreRequerimiento?.message}</Form.Control.Feedback>
        </Col>
        <Col md={2}>
            <Form.Label className="small">Periodo</Form.Label>
            <Form.Control {...register('periodo')} placeholder="Ej: 2024-Q1" className="font-monospace"/>
        </Col>
        <Col md={3}>
            <Form.Label className="small">Tipo desarrollo</Form.Label>
            <Form.Select {...register('tipoDesarrollo')}>
            <option value="">Seleccionar...</option>
            <option>Desarrollo</option>
            <option>Apertura</option>
            <option>Soporte</option>
            </Form.Select>
        </Col>
        </Row>

        <Row className="mb-3 g-2">
        <Col md={4}>
            <Form.Label className="small">Analista</Form.Label> 
            <Form.Select {...register('analista')}> 
            <option value="">Seleccionar...</option>
            <option value="Eduardo Razuri">Eduardo Razuri</option>
            <option value="Angelica Vega">Angelica Vega</option> 
            <option value="Kiara Gutierrez">Kiara Gutierrez</option> 
            </Form.Select>

        </Col>
        <Col md={4}>
            <Form.Label className="small">Key User</Form.Label>
            <Form.Control {...register('keyUser')} placeholder="Key User"/>
        </Col>
        <Col md={4}>
            <Form.Label className="small">Distribución</Form.Label> 
            <Form.Select {...register('distribucion')}> 
            <option value="">Seleccionar...</option>
            <option value="01. Retail">01. Retail</option>
            <option value="02. Corporativo">02. Corporativo</option>
            <option value="03. Industrial">03. Industrial</option>
            <option value="04. Samitex">04. Samitex</option>
            <option value="05. Texcorp">05. Texcorp</option>
            <option value="06. Luminika">06. Luminika</option>
            <option value="07. Finanzas">07. Finanzas</option>
            <option value="08. Contabilidad">08. Contabilidad</option>
            <option value="09. Nominas">09. Nominas</option>
            <option value="10. Bienestar">10. Bienestar</option>
            <option value="11. Sinercorp">11. Sinercorp</option>
            <option value="13. Tandem">13. Tandem</option>
            <option value="12. Servicios /  Inmobiliaria">12. Servicios /  Inmobiliaria</option>
            <option value="14. Global Sourcing">14. Global Sourcing</option>
            <option value="15. Tienda EL">15. Tienda EL</option>
            <option value="16. Fashion">16. Fashion</option>
            <option value="17. Lukers">17. Lukers</option>
            <option value="18. Cadena">18. Cadena</option>
            <option value="19. Panorama Out">19. Panorama Out</option>
            <option value="20. Samitex Ind.">20. Samitex Ind.</option>
            <option value="21. Samitex Marca">21. Samitex Marca</option> 
            </Form.Select>
        </Col>
        </Row>

        <Row className="mb-3 g-2">
        <Col md={4}>
            <Form.Label className="small">Estado</Form.Label>
            <Form.Select {...register('estado')}> 
            <option value="">Seleccionar...</option>
            <option value="1. ENT en Definicion">1. ENT en Definicion</option>
            <option value="2. ENT en Elaboración">2. ENT en Elaboración</option>
            <option value="3. ENT en Cotización">3. ENT en Cotización</option>
            <option value="4. En Espera de aprob.">4. En Espera de aprob.</option>
            <option value="4.1. Autorizado en espera">4.1. Autorizado en espera</option>
            <option value="5. En Construcción">5. En Construcción</option>
            <option value="6. Cerrado">6. Cerrado</option>
            <option value="7. Desestimado">7. Desestimado</option>
            <option value="8. Anulado">8. Anulado</option>
            <option value="9. En Pausa">9. En Pausa</option>
            </Form.Select>
 
        </Col>
        <Col md={4}>
            <Form.Label className="small">Estado interno</Form.Label>
            <Form.Select {...register('estadoInterno')}>
              <option value="">Seleccionar...</option>
            <option value="1. ENT en Definicion">1. ENT en Definicion</option>
            <option value="2. ENT en Elaboración">2. ENT en Elaboración</option>
            <option value="2.1 ENT en Aprobación">2.1 ENT en Aprobación</option>
            <option value="3. ENT en Cotización">3. ENT en Cotización</option>
            <option value="4. En Espera de aprob.">4. En Espera de aprob.</option>
            <option value="4.1. Autorizado en espera">4.1. Autorizado en espera</option>
            <option value="5. En Construcción">5. En Construcción</option>
            <option value="5.1 En Pruebas TIC">5.1 En Pruebas TIC</option>
            <option value="5.2 En Pruebas Usuario">5.2 En Pruebas Usuario</option>
            <option value="5.3 Marcha Blanca">5.3 Marcha Blanca</option>
            <option value="6. Cerrado">6. Cerrado</option>
            <option value="7. Desestimado">7. Desestimado</option>
            <option value="8. Anulado">8. Anulado</option>
            <option value="9. En Pausa">9. En Pausa</option>
            </Form.Select>
        </Col>
        <Col md={4}>
            <Form.Label className="small">Monto total (PEN)</Form.Label>
            <Form.Control type="number" step="0.01" {...register('montoTotalProyecto')} placeholder="0.00"/>
        </Col>
        </Row>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proyecto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProyectoModal;