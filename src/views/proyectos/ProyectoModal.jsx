import { useEffect, useState } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { proyectosService } from '@/services/proyectos.service';

const ESTADOS = [
  '1. ENT en Definicion',
  '2. ENT en Elaboracion',
  '3. ENT en Cotización',
  '4. En Espera de aprob.',
  '4.1. Autorizado en espera',
  '5. En Construcción',
  '6. Cerrado',
  '8. Anulado',
  '9. En Pausa',
  '10. Desestimado',
];

const ESTADOS_INTERNOS = [
  '1. ENT en Definicion',
  '2. ENT en Elaboración',
  '2.1 ENT en Aprobación',
  '3. ENT en Cotización',
  '4. En Espera de aprob.',
  '4.1. Autorizado en espera',
  '5. En Construcción',
  '5.1 En Pruebas TIC',
  '5.2 En Pruebas Usuario',
  '5.3 Marcha Blanca',
  '6. Cerrado',
  '7. Desestimado',
  '8. Anulado',
  '9. En Pausa',
];

const ANIOS = [2024, 2025, 2026, 2027];
const MESES = [
  { value: '01', label: 'Enero' },   { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },   { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },    { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },   { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre'},{ value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre'},{ value: '12', label: 'Diciembre' },
];

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
    {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proyecto'}
  </button>
);

// ── Componente ───────────────────────────────────────────────────────────────
// Parsea "YYYYMM" → { anio: "2026", mes: "05" }
const parsePeriodo = (periodo) => {
  if (!periodo) return { anio: '', mes: '' };
  const s = String(periodo).replace('-', '');
  if (s.length === 6) return { anio: s.slice(0, 4), mes: s.slice(4, 6) };
  return { anio: '', mes: '' };
};

const ProyectoModal = ({ show, onHide, onSave, proyecto, saving = false }) => {
  const isEdit = !!proyecto;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [periodoAnio, setPeriodoAnio] = useState('');
  const [periodoMes,  setPeriodoMes]  = useState('');

  useEffect(() => {
    const p = parsePeriodo(proyecto?.periodo);
    setPeriodoAnio(p.anio);
    setPeriodoMes(p.mes);

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
        historia:            proyecto.historia            ?? '',
        resumenAlcance:      proyecto.resumenAlcance      ?? '',
        montoTotalProyecto:  proyecto.montoTotalProyecto  ?? '',
      });
    } else {
      setPeriodoAnio('');
      setPeriodoMes('');
      reset({
        codProy: '', analista: '', nombreRequerimiento: '',
        keyUser: '', tipoDesarrollo: '', distribucion: '',
        estado: '', estadoInterno: '',
        historia: '', resumenAlcance: '', montoTotalProyecto: '',
      });
    }
  }, [proyecto, show, reset]);

  const onSubmit = (data) => {
    const periodo = periodoAnio && periodoMes ? `${periodoAnio}${periodoMes}` : null;
    const payload = {
      ...(!isEdit && { codProy: data.codProy }),
      analista:            data.analista            || null,
      nombreRequerimiento: data.nombreRequerimiento || null,
      keyUser:             data.keyUser             || null,
      tipoDesarrollo:      data.tipoDesarrollo      || null,
      distribucion:        data.distribucion        || null,
      estado:              data.estado              || null,
      estadoInterno:       data.estadoInterno       || null,
      periodo,
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
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
        <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          {isEdit ? `Editar proyecto — ${proyecto?.codProy}` : 'Nuevo proyecto'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ padding: '20px 24px' }}>

          {/* ── Datos generales ── */}
          <p style={sectionTitle}>Datos generales</p>
          <Row className="mb-3 g-3">
            {!isEdit && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label style={labelStyle}>
                    Código <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    {...register('codProy', {
                      required: 'El código es obligatorio',
                      maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                      pattern: {
                        value: /^[A-Z0-9\-_]+$/i,
                        message: 'Solo letras, números, guiones y guión bajo',
                      },
                      validate: async (value) => {
                        if (isEdit || !value) return true;
                        try {
                          await proyectosService.obtener(value);
                          return 'El código ya existe';
                        } catch { return true; }
                      },
                    })}
                    placeholder="Ej: PROY001"
                    isInvalid={!!errors.codProy}
                    disabled={isEdit}
                    style={inputStyle}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                    {errors.codProy?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md={isEdit ? 7 : 5}>
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Nombre requerimiento <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  {...register('nombreRequerimiento', {
                    required: 'El nombre es obligatorio',
                    maxLength: { value: 200, message: 'Máximo 200 caracteres' },
                  })}
                  placeholder="Nombre del requerimiento"
                  isInvalid={!!errors.nombreRequerimiento}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.nombreRequerimiento?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label style={labelStyle}>Periodo</Form.Label>
                <div className="d-flex gap-1">
                  <Form.Select
                    value={periodoAnio}
                    onChange={e => setPeriodoAnio(e.target.value)}
                    style={{ ...inputStyle, flex: 1, minWidth: 0 }}>
                    <option value="">Año</option>
                    {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </Form.Select>
                  <Form.Select
                    value={periodoMes}
                    onChange={e => setPeriodoMes(e.target.value)}
                    style={{ ...inputStyle, flex: 1, minWidth: 0 }}>
                    <option value="">Mes</option>
                    {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Tipo desarrollo</Form.Label>
                <Form.Select {...register('tipoDesarrollo')} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  <option>Desarrollo</option>
                  <option>Apertura</option>
                  <option>Soporte</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3 g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Analista</Form.Label>
                <Form.Select {...register('analista')} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  <option value="Eduardo Razuri">Eduardo Razuri</option>
                  <option value="Angelica Vega">Angelica Vega</option>
                  <option value="Kiara Gutierrez">Kiara Gutierrez</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Key User</Form.Label>
                <Form.Control
                  {...register('keyUser', {
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                  })}
                  placeholder="Key User"
                  style={inputStyle}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Distribución</Form.Label>
                <Form.Select {...register('distribucion')} style={inputStyle}>
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
                  <option value="12. Servicios /  Inmobiliaria">12. Servicios / Inmobiliaria</option>
                  <option value="13. Tandem">13. Tandem</option>
                  <option value="14. Global Sourcing">14. Global Sourcing</option>
                  <option value="15. Tienda EL">15. Tienda EL</option>
                  <option value="16. Fashion">16. Fashion</option>
                  <option value="17. Lukers">17. Lukers</option>
                  <option value="18. Cadena">18. Cadena</option>
                  <option value="19. Panorama Out">19. Panorama Out</option>
                  <option value="20. Samitex Ind.">20. Samitex Ind.</option>
                  <option value="21. Samitex Marca">21. Samitex Marca</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* ── Estado y monto ── */}
          <p style={{ ...sectionTitle, marginTop: 8 }}>Estado y presupuesto</p>
          <Row className="mb-3 g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Estado</Form.Label>
                <Form.Select {...register('estado')} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Estado interno</Form.Label>
                <Form.Select {...register('estadoInterno')} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {ESTADOS_INTERNOS.map(e => <option key={e} value={e}>{e}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Monto total (PEN)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  {...register('montoTotalProyecto', {
                    min: { value: 0, message: 'El monto no puede ser negativo' },
                  })}
                  placeholder="0.00"
                  isInvalid={!!errors.montoTotalProyecto}
                  style={inputStyle}
                />
                <Form.Control.Feedback type="invalid" style={{ fontSize: 11 }}>
                  {errors.montoTotalProyecto?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* ── Descripción ── */}
          <p style={{ ...sectionTitle, marginTop: 8 }}>Descripción</p>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label style={labelStyle}>Historia / Contexto</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('historia')} placeholder="Contexto o historia del proyecto..." style={{ ...inputStyle, resize: 'none' }} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label style={labelStyle}>Resumen del alcance</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('resumenAlcance')} placeholder="Resumen del alcance del proyecto..." style={{ ...inputStyle, resize: 'none' }} />
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
};

export default ProyectoModal;
