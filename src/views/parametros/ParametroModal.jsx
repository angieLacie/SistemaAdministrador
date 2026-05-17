import { useState, useEffect } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { parametroModel } from '@/models/parametro.model';

// ── Estilos reutilizables ────────────────────────────────────────────────────
const sectionTitle = {
  fontSize: 10, fontWeight: 700, letterSpacing: '1px',
  color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10,
};
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };
const inputStyle = { fontSize: 13, borderRadius: 8, border: '1.5px solid #dde1e7' };

const BtnCancel = ({ onClick, disabled, children }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:7, border:'1.5px solid #d1d5db', background:'white', color:'#374151', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, transition:'all 0.15s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor='#9ca3af'; e.currentTarget.style.background='#f9fafb'; }}}
    onMouseLeave={e => { e.currentTarget.style.borderColor='#d1d5db'; e.currentTarget.style.background='white'; }}>
    {children}
  </button>
);

const BtnSubmit = ({ disabled, saving, isEdit }) => (
  <button type="submit" disabled={disabled}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, transition:'all 0.15s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}}
    onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
    {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar parámetro'}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
export default function ParametroModal({ show, onHide, onSave, parametro, saving, empresas = [], tiendas = [] }) {
  const [form, setForm] = useState(parametroModel);
  const isEdit = !!parametro;

  useEffect(() => {
    if (parametro) {
      setForm({
        ParametroCodigo: parametro.parametroCodigo  || '',
        ParametroNombre: parametro.parametroNombre  || '',
        Periodo:         parametro.periodo          || '',
        Empresa:         parametro.empresa          || '',
        Tienda:          parametro.tienda           || '',
        Valor:           parametro.valor            || '',
        Orden:           parametro.orden            || 0,
        ParametroNivel:  parametro.parametroNivel   ?? '',
        Descripcion1:    parametro.descripcion1     || '',
        Descripcion2:    parametro.descripcion2     || '',
        Mensaje:         parametro.mensaje          || '',
        Comentario:      parametro.comentario       || '',
        ParametroEstado: parametro.parametroEstado  || 'A',
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
  const tiendaOptions  = tiendas
    .filter(t => !form.Empresa || t.empresa === form.Empresa)
    .map(t => ({ value: t.tiendaId, label: `${t.tiendaId} - ${t.descripcion}` }));

  const empresaSel = empresaOptions.find(o => o.value === form.Empresa) || null;
  const tiendaSel  = tiendaOptions.find(o => o.value === form.Tienda)   || null;

  const selectStyles = {
    control: (base) => ({
      ...base, fontSize: 13, borderRadius: 8,
      border: '1.5px solid #dde1e7', boxShadow: 'none',
      '&:hover': { borderColor: '#185FA5' },
    }),
    option: (base, { isFocused }) => ({
      ...base, fontSize: 13,
      background: isFocused ? '#eff6ff' : 'white',
      color: '#374151',
    }),
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Form onSubmit={submit}>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
          <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
            {isEdit ? 'Editar parámetro' : 'Nuevo parámetro'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: '20px 24px' }}>

          {/* ── Identificación ── */}
          <p style={sectionTitle}>Identificación</p>
          <Row className="mb-3 g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Código <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="ParametroCodigo"
                  value={form.ParametroCodigo}
                  onChange={onChange}
                  required
                  placeholder="Código del parámetro"
                  style={inputStyle}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>Nombre</Form.Label>
                <Form.Control
                  name="ParametroNombre"
                  value={form.ParametroNombre}
                  onChange={onChange}
                  placeholder="Nombre descriptivo"
                  style={inputStyle}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Periodo <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="Periodo"
                  value={form.Periodo}
                  onChange={onChange}
                  required
                  placeholder="Ej: 202401"
                  style={inputStyle}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Orden</Form.Label>
                <Form.Control
                  type="number"
                  name="Orden"
                  value={form.Orden}
                  onChange={onChange}
                  placeholder="0"
                  style={inputStyle}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Nivel</Form.Label>
                <Form.Control
                  type="number"
                  name="ParametroNivel"
                  value={form.ParametroNivel}
                  onChange={onChange}
                  placeholder="0"
                  style={inputStyle}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* ── Alcance ── */}
          <p style={{ ...sectionTitle, marginTop: 4 }}>Alcance</p>
          <Row className="mb-3 g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>Empresa</Form.Label>
                <Select
                  isClearable
                  placeholder="Seleccionar..."
                  value={empresaSel}
                  options={empresaOptions}
                  styles={selectStyles}
                  onChange={(opt) => setForm({ ...form, Empresa: opt?.value || '', Tienda: '' })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>Tienda</Form.Label>
                <Select
                  isClearable
                  placeholder="Seleccionar..."
                  value={tiendaSel}
                  options={tiendaOptions}
                  styles={selectStyles}
                  onChange={(opt) => setForm({ ...form, Tienda: opt?.value || '' })}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* ── Valor ── */}
          <p style={{ ...sectionTitle, marginTop: 4 }}>Valor</p>
          <Row className="mb-3 g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Estado del valor</Form.Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button"
                    onClick={() => setForm({ ...form, Valor: '0' })}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      border: form.Valor === '0' ? '1.5px solid #16a34a' : '1.5px solid #bbf7d0',
                      background: form.Valor === '0' ? '#16a34a' : '#f0fdf4',
                      color: form.Valor === '0' ? 'white' : '#16a34a',
                    }}>
                    Activo
                  </button>
                  <button type="button"
                    onClick={() => setForm({ ...form, Valor: '1' })}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      border: form.Valor === '1' ? '1.5px solid #dc2626' : '1.5px solid #fecaca',
                      background: form.Valor === '1' ? '#dc2626' : '#fef2f2',
                      color: form.Valor === '1' ? 'white' : '#dc2626',
                    }}>
                    Bloqueado
                  </button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* ── Textos adicionales ── */}
          <p style={{ ...sectionTitle, marginTop: 4 }}>Textos adicionales</p>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label style={labelStyle}>Descripción 1</Form.Label>
                <Form.Control as="textarea" rows={2} name="Descripcion1"
                  value={form.Descripcion1} onChange={onChange}
                  style={{ ...inputStyle, resize: 'none' }} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label style={labelStyle}>Descripción 2</Form.Label>
                <Form.Control as="textarea" rows={2} name="Descripcion2"
                  value={form.Descripcion2} onChange={onChange}
                  style={{ ...inputStyle, resize: 'none' }} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>Mensaje</Form.Label>
                <Form.Control as="textarea" rows={2} name="Mensaje"
                  value={form.Mensaje} onChange={onChange}
                  style={{ ...inputStyle, resize: 'none' }} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>Comentario</Form.Label>
                <Form.Control as="textarea" rows={2} name="Comentario"
                  value={form.Comentario} onChange={onChange}
                  style={{ ...inputStyle, resize: 'none' }} />
              </Form.Group>
            </Col>
          </Row>

        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
          <BtnCancel onClick={onHide} disabled={saving}>Cancelar</BtnCancel>
          <BtnSubmit disabled={saving} saving={saving} isEdit={isEdit} />
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
