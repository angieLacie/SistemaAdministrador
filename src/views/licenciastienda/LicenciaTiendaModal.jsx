import { useEffect, useState } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaPlus, FaTrash } from 'react-icons/fa6';

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
    {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear licencia'}
  </button>
);

const TIPOS_LICENCIA = [
  { value: 'A', label: 'A — Punto de venta ($ 750)', costo: 750 },
  { value: 'B', label: 'B — Estación de trabajo ($ 500)', costo: 500 },
  { value: 'C', label: 'C — Tipo C BD ($ 500)', costo: 500 },
];

// ── Componente ───────────────────────────────────────────────────────────────
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
      reset({ empresa: '', codigo: '', tienda: '', estadoTienda: 'Activo', periodo: '' });
      setCajas([]);
    }
  }, [licencia, show, reset]);

  const agregarCaja = () => {
    setCajas(prev => [...prev, { nroCaja: prev.length + 1, tipoLicencia: 'B', estadoCaja: 'Activo' }]);
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
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          {isEdit ? `Editar licencia — ${licencia?.codigo}` : 'Nueva licencia tienda'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ padding: '20px 24px' }}>

          {/* ── Datos generales ── */}
          <p style={sectionTitle}>Datos generales</p>
          <Row className="mb-3 g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Código <span className="text-danger">*</span>
                  {!isEdit && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>único</span>}
                </Form.Label>
                <Form.Control
                  {...register('codigo', {
                    required: 'El código es obligatorio',
                    maxLength: { value: 10, message: 'Máximo 10 caracteres' },
                    pattern: {
                      value: /^[A-Z0-9]+$/i,
                      message: 'Solo letras y números',
                    },
                  })}
                  placeholder="Ej: R201"
                  isInvalid={!!errors.codigo}
                  disabled={isEdit}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.codigo?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Tienda <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  {...register('tienda', {
                    required: 'El nombre de tienda es obligatorio',
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                  })}
                  placeholder="Nombre de la tienda"
                  isInvalid={!!errors.tienda}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.tienda?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Empresa</Form.Label>
                <Form.Select {...register('empresa')} style={inputStyle}>
                  <option value="R010 - El S.A.">R010 - El S.A.</option>
                  <option value="R020 - Fashion">R020 - Fashion</option>
                  <option value="R030 - El Oriente">R030 - El Oriente</option>
                  <option value="R040 - Lukers OR">R040 - Lukers OR</option>
                  <option value="R050 - Lukers">R050 - Lukers</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3 g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Periodo</Form.Label>
                <Form.Control
                  {...register('periodo', {
                    maxLength: { value: 10, message: 'Máximo 10 caracteres' },
                  })}
                  placeholder="Ej: 2024-Q1"
                  style={inputStyle}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Estado</Form.Label>
                <Form.Select {...register('estadoTienda')} style={inputStyle}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Anulado">Anulado</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* ── Cajas ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 }}>
            <p style={{ ...sectionTitle, marginBottom: 0 }}>
              Cajas ({cajas.length})
              {costoTotal > 0 && (
                <span style={{ marginLeft: 10, fontSize: 11, color: '#16a34a', fontWeight: 700 }}>
                  Total: $ {costoTotal.toLocaleString()}
                </span>
              )}
            </p>
            <button type="button" onClick={agregarCaja}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, border:'1.5px solid #bfdbfe', background:'#eff6ff', color:'#185FA5', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#185FA5'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; e.currentTarget.style.borderColor='#bfdbfe'; }}>
              <FaPlus size={10} /> Agregar caja
            </button>
          </div>

          {cajas.length === 0 ? (
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Sin cajas registradas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm" style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', width: 60 }}>N° Caja</th>
                    <th style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280' }}>Tipo licencia</th>
                    <th style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', width: 80 }}>Costo</th>
                    <th style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280' }}>Estado</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cajas.map((caja, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, fontSize: 13, color: '#185FA5', verticalAlign: 'middle' }}>{idx + 1}</td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <Form.Select size="sm" value={caja.tipoLicencia}
                          onChange={e => actualizarCaja(idx, 'tipoLicencia', e.target.value)}
                          style={{ fontSize: 12, borderRadius: 6, border: '1.5px solid #dde1e7' }}>
                          {TIPOS_LICENCIA.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </Form.Select>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: 13, color: '#16a34a', verticalAlign: 'middle' }}>
                        $ {TIPOS_LICENCIA.find(t => t.value === caja.tipoLicencia)?.costo ?? 0}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <Form.Select size="sm" value={caja.estadoCaja}
                          onChange={e => actualizarCaja(idx, 'estadoCaja', e.target.value)}
                          style={{ fontSize: 12, borderRadius: 6, border: '1.5px solid #dde1e7' }}>
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </Form.Select>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <button type="button" onClick={() => eliminarCaja(idx)}
                          style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:6, border:'1.5px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer', transition:'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background='#dc2626'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#dc2626'; }}
                          onMouseLeave={e => { e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='#dc2626'; e.currentTarget.style.borderColor='#fecaca'; }}>
                          <FaTrash size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
          <BtnCancel onClick={onHide} disabled={saving}>Cancelar</BtnCancel>
          <BtnSubmit disabled={saving} saving={saving} isEdit={isEdit} />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default LicenciaTiendaModal;
