import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaPlus, FaTrash } from 'react-icons/fa6';

const TIPOS_LICENCIA = [
  { value: 'A', label: 'A — Punto de venta ($ 750)', costo: 750 },
  { value: 'B', label: 'B — Estación de trabajo ($ 500)', costo: 500 },
  { value: 'C', label: 'C — Tipo C BD ($ 500)', costo: 500 },
];

const LicenciaTiendaModal = ({ show, onHide, onSave, licencia, saving = false }) => {
  const isEdit = !!licencia;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [cajas, setCajas] = useState([]);

  useEffect(() => {
    if (licencia) { 
      reset({
        empresa:      licencia.empresa      ?? '',
        codigo:       licencia.codigo       ?? '',
        tienda:       licencia.tienda       ?? '',
        estadoTienda: licencia.estadoTienda ?? 'Activo',
        periodo:      licencia.periodo      ?? '',
      });
      setCajas(licencia.cajas?.map(c => ({
        nroCaja:      c.nroCaja,
        tipoLicencia: c.tipoLicencia,
        estadoCaja:   c.estadoCaja ?? 'Activo',
      })) ?? []);
    } else {
      reset({
        empresa: '', codigo: '', tienda: '',
        estadoTienda: 'Activo', periodo: '',
      });
      setCajas([]);
    }
  }, [licencia, show, reset]);

  const agregarCaja = () => {
    setCajas(prev => [...prev, {
      nroCaja:      prev.length + 1,
      tipoLicencia: 'B',
      estadoCaja:   'Activo',
    }]);
  };

  const eliminarCaja = (idx) => {
    setCajas(prev => prev.filter((_, i) => i !== idx));
  };

  const actualizarCaja = (idx, campo, valor) => {
    setCajas(prev => prev.map((c, i) => i === idx ? { ...c, [campo]: valor } : c));
  };

  const onSubmit = (data) => {
    const payload = {
      empresa:      data.empresa      || null,
      codigo:       data.codigo,
      tienda:       data.tienda,
      estadoTienda: data.estadoTienda || null,
      periodo:      data.periodo      || null,
      usuarioCreacion: 'ADMIN',
      cajas: cajas.map((c, i) => ({
        nroCaja:      i + 1,
        tipoLicencia: c.tipoLicencia,
        estadoCaja:   c.estadoCaja,
      })),
    };
    onSave(payload);
  };

  const costoTotal = cajas.reduce((acc, c) => {
    const tipo = TIPOS_LICENCIA.find(t => t.value === c.tipoLicencia);
    return acc + (tipo?.costo ?? 0);
  }, 0);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? `Editar licencia — ${licencia?.codigo}` : 'Nueva licencia tienda'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>

          <p className="text-muted fw-semibold small text-uppercase mb-2">Datos generales</p>
          <Row className="mb-3 g-2">
            <Col md={3}>
              <Form.Label className="small">Código <span className="text-danger">*</span></Form.Label>
              <Form.Control
                {...register('codigo', { required: 'Requerido' })}
                placeholder="Ej: R201"
                isInvalid={!!errors.codigo}
                className="font-monospace"
                disabled={isEdit}
              />
              <Form.Control.Feedback type="invalid">{errors.codigo?.message}</Form.Control.Feedback>
            </Col>
            <Col md={5}>
              <Form.Label className="small">Tienda <span className="text-danger">*</span></Form.Label>
              <Form.Control
                {...register('tienda', { required: 'Requerido' })}
                placeholder="Nombre de la tienda"
                isInvalid={!!errors.tienda}
              />
              <Form.Control.Feedback type="invalid">{errors.tienda?.message}</Form.Control.Feedback>
            </Col>
            <Col md={4}>
              <Form.Label className="small">Empresa</Form.Label> 
              <Form.Select {...register('empresa')}>
                <option value="R010 - El S.A.">R010 - El S.A.</option>
                <option value="R020 - Fashion">R020 - Fashion</option>
                <option value="R030 - El Oriente">R030 - El Oriente</option>
                <option value="R040 - Lukers OR">R040 - Lukers OR</option>
                <option value="R050 - Lukers">R050 - Lukers</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3 g-2">
            <Col md={4}>
              <Form.Label className="small">Periodo</Form.Label>
              <Form.Control {...register('periodo')} placeholder="Ej: 2024-Q1" className="font-monospace"/>
            </Col>
            <Col md={4}>
              <Form.Label className="small">Estado</Form.Label>
              <Form.Select {...register('estadoTienda')}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Anulado">Anulado</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Cajas */}
          <div className="d-flex align-items-center justify-content-between mb-2 mt-3">
            <p className="text-muted fw-semibold small text-uppercase mb-0">
              Cajas ({cajas.length})
              {costoTotal > 0 && (
                <span className="ms-2 text-success" style={{ fontSize: 11 }}>
                  Total: $ {costoTotal.toLocaleString()}
                </span>
              )}
            </p>
            <Button size="sm" variant="outline-primary" onClick={agregarCaja}>
              <FaPlus size={10} className="me-1" /> Agregar caja
            </Button>
          </div>

          {cajas.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 12 }}>Sin cajas registradas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm" style={{ fontSize: 12 }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>N° Caja</th>
                    <th>Tipo licencia</th>
                    <th style={{ width: 80 }}>Costo</th>
                    <th>Estado</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cajas.map((caja, idx) => (
                    <tr key={idx}>
                      <td className="font-monospace fw-semibold">{idx + 1}</td>
                      <td>
                        <Form.Select size="sm" value={caja.tipoLicencia}
                          onChange={e => actualizarCaja(idx, 'tipoLicencia', e.target.value)}>
                          {TIPOS_LICENCIA.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </Form.Select>
                      </td>
                      <td className="fw-semibold" style={{ color: '#edefec' }}>
                        $ {TIPOS_LICENCIA.find(t => t.value === caja.tipoLicencia)?.costo ?? 0}
                      </td>
                      <td>
                        <Form.Select size="sm" value={caja.estadoCaja}
                          onChange={e => actualizarCaja(idx, 'estadoCaja', e.target.value)}>
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-danger" style={{ padding: '2px 6px' }}
                          onClick={() => eliminarCaja(idx)}>
                          <FaTrash size={10} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear licencia'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default LicenciaTiendaModal;