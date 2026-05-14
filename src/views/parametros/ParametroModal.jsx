import { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import Select from 'react-select';
import { parametroModel } from '@/models/parametro.model';

export default function ParametroModal({ show, onHide, onSave, parametro, saving, empresas = [], tiendas = [] }) {
  const [form, setForm] = useState(parametroModel);
  const isEdit = !!parametro;

  useEffect(() => {
    if (parametro) {
      setForm({
        ParametroCodigo:  parametro.parametroCodigo  || '',
        ParametroNombre:  parametro.parametroNombre  || '',
        Periodo:          parametro.periodo          || '',
        Empresa:          parametro.empresa          || '',
        Tienda:           parametro.tienda           || '',
        Valor:            parametro.valor            || '',
        Orden:            parametro.orden            || 0,
        ParametroNivel:   parametro.parametroNivel   ?? '',
        Descripcion1:     parametro.descripcion1     || '',
        Descripcion2:     parametro.descripcion2     || '',
        Mensaje:          parametro.mensaje          || '',
        Comentario:       parametro.comentario       || '',
        ParametroEstado:  parametro.parametroEstado  || 'A',
      });
    } else {
      setForm(parametroModel);
    }
  }, [parametro, show]);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'number' ? Number(value) : value });
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const empresaOptions = empresas.map(e => ({ value: e.empresaId, label: `${e.empresaId} - ${e.descripcion}` }));
  const tiendaOptions = tiendas
    .filter(t => !form.Empresa || t.empresa === form.Empresa)
    .map(t => ({ value: t.tiendaId, label: `${t.tiendaId} - ${t.descripcion}` }));

  const empresaSel = empresaOptions.find(o => o.value === form.Empresa) || null;
  const tiendaSel  = tiendaOptions.find(o => o.value === form.Tienda) || null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Editar' : 'Nuevo'} Parámetro</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Código *</Form.Label>
              <Form.Control name="ParametroCodigo" value={form.ParametroCodigo} onChange={onChange} required />
            </Col>
            <Col md={6}>
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="ParametroNombre" value={form.ParametroNombre} onChange={onChange} />
            </Col>
            <Col md={4}>
              <Form.Label>Periodo *</Form.Label>
              <Form.Control name="Periodo" value={form.Periodo} onChange={onChange} required />
            </Col>
            <Col md={4}>
              <Form.Label>Empresa</Form.Label>
              <Select
                isClearable
                placeholder="Seleccionar..."
                value={empresaSel}
                options={empresaOptions}
                onChange={(opt) => setForm({ ...form, Empresa: opt?.value || '', Tienda: '' })}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Tienda</Form.Label>
              <Select
                isClearable
                placeholder="Seleccionar..."
                value={tiendaSel}
                options={tiendaOptions}
                onChange={(opt) => setForm({ ...form, Tienda: opt?.value || '' })}
              />
            </Col>
            <Col md={4}>
                <Form.Label>Valor</Form.Label>
                <div className="d-flex gap-2">
                    <Button
                    variant={form.Valor === '0' ? 'success' : 'outline-success'}
                    size="sm"
                    className="flex-fill"
                    onClick={() => setForm({ ...form, Valor: '0' })}
                    type="button"
                    >
                    Activo
                    </Button>
                    <Button
                    variant={form.Valor === '1' ? 'danger' : 'outline-danger'}
                    size="sm"
                    className="flex-fill"
                    onClick={() => setForm({ ...form, Valor: '1' })}
                    type="button"
                    >
                    Bloqueado
                    </Button>
                </div>
                </Col>
            <Col md={4}>
              <Form.Label>Orden</Form.Label>
              <Form.Control type="number" name="Orden" value={form.Orden} onChange={onChange} />
            </Col>
            <Col md={4}>
              <Form.Label>Nivel</Form.Label>
              <Form.Control type="number" name="ParametroNivel" value={form.ParametroNivel} onChange={onChange} />
            </Col>
            <Col md={12}>
              <Form.Label>Descripción 1</Form.Label>
              <Form.Control as="textarea" rows={2} name="Descripcion1" value={form.Descripcion1} onChange={onChange} />
            </Col>
            <Col md={12}>
              <Form.Label>Descripción 2</Form.Label>
              <Form.Control as="textarea" rows={2} name="Descripcion2" value={form.Descripcion2} onChange={onChange} />
            </Col>
            <Col md={12}>
              <Form.Label>Mensaje</Form.Label>
              <Form.Control as="textarea" rows={2} name="Mensaje" value={form.Mensaje} onChange={onChange} />
            </Col>
            <Col md={12}>
              <Form.Label>Comentario</Form.Label>
              <Form.Control as="textarea" rows={2} name="Comentario" value={form.Comentario} onChange={onChange} />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}