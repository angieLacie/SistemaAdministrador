import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Row, Col, Badge, Spinner, Form, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaPen, FaEye, FaTrash, FaXmark, FaFileExcel, FaClone, FaDownload } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import KpiCard from '@/components/KpiCard';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import ConfirmModal from '@/components/modals/ConfirmModal';
import {
  proyectosService,
  proyectoHorasService,
  proyectoControlMensualService,
} from '@/services/proyectos.service';
import ProyectoModal from './ProyectoModal';

// ── Constantes ──────────────────────────────────────────────
const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_CORTO = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                     'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const ANIOS = [2024, 2025, 2026, 2027];

// ── Estilos compartidos ─────────────────────────────────────
const labelStyle = { fontSize: 12, fontWeight: 600, marginBottom: 4 };
const inputStyle = { fontSize: 13, borderRadius: 8, border: '1.5px solid #dde1e7' };

// ── Colores del sistema ─────────────────────────────────────
const COLORS = {
  blue:   { bg: '#E6F1FB', color: '#185FA5', bd: '#bfdbfe' },
  green:  { bg: '#EAF3DE', color: '#3B6D11', bd: '#bbf7d0' },
  orange: { bg: '#FAEEDA', color: '#BA7517', bd: '#fde68a' },
  red:    { bg: '#FCEBEB', color: '#A32D2D', bd: '#fecaca' },
  gray:   { bg: '#F1EFE8', color: '#5F5E5A', bd: '#d1d5db' },
};

const estadoMesMap = {
  'Normal':     COLORS.green,
  'En riesgo':  COLORS.orange,
  'Retrasado':  COLORS.red,
  'Completado': COLORS.blue,
};

// Color por fase/número de estado (prefijo numérico)
const getEstadoColor = (estado) => {
  if (!estado) return COLORS.gray;
  const s = estado.trim();
  if (s.startsWith('1.'))  return { bg: '#EDE9FE', color: '#5B21B6', bd: '#c4b5fd' }; // violeta — Definición
  if (s.startsWith('2.'))  return { bg: '#E0F2FE', color: '#0369A1', bd: '#7dd3fc' }; // celeste — Elaboración
  if (s.startsWith('3.'))  return { bg: '#FEF3C7', color: '#92400E', bd: '#fde68a' }; // amarillo — Cotización
  if (s.startsWith('4.'))  return { bg: '#DBEAFE', color: '#1D4ED8', bd: '#93c5fd' }; // azul — Aprobación
  if (s.startsWith('5.3')) return { bg: '#D1FAE5', color: '#065F46', bd: '#6ee7b7' }; // verde menta — Marcha Blanca
  if (s.startsWith('5.'))  return { bg: '#DCFCE7', color: '#166534', bd: '#86efac' }; // verde — Construcción
  if (s.startsWith('6.'))  return { bg: '#F0FDF4', color: '#15803D', bd: '#86efac' }; // verde claro — Cerrado
  if (s.startsWith('7.'))  return { bg: '#FEF9C3', color: '#854D0E', bd: '#fde047' }; // ámbar — Suspendido
  if (s.startsWith('8.'))  return { bg: '#FEE2E2', color: '#991B1B', bd: '#fca5a5' }; // rojo — Anulado
  // fallback por texto
  if (s.includes('curso'))     return COLORS.blue;
  if (s.includes('Finalizado'))return COLORS.green;
  if (s.includes('Anulado'))   return COLORS.red;
  if (s.includes('Suspendido'))return COLORS.orange;
  return COLORS.gray;
};

// ── Componentes pequeños ────────────────────────────────────
const EstadoBadge = ({ estado }) => {
  const e = getEstadoColor(estado);
  return (
    <Badge bg="" style={{
      backgroundColor: e.bg,
      color: e.color,
      border: `1px solid ${e.bd}`,
      fontFamily: 'inherit',
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {estado ?? '—'}
    </Badge>
  );
};

const EstadoMesBadge = ({ estado }) => {
  if (!estado) return <span className="text-muted" style={{ fontSize: 11 }}>Sin registro</span>;
  const e = estadoMesMap[estado] || COLORS.gray;
  return (
    <Badge bg="" style={{
      backgroundColor: e.bg,
      color: e.color,
      border: `1px solid ${e.bd}`,
      fontFamily: 'inherit',
      fontSize: 11,
      fontWeight: 600,
    }}>
      {estado}
    </Badge>
  );
};

const ProgressBar = ({ pct }) => {
  if (pct == null) return <span className="text-muted" style={{ fontSize: 11 }}>—</span>;
  const color = pct >= 80 ? '#3B6D11' : pct >= 40 ? '#185FA5' : '#BA7517';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 5, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', minWidth: 50 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
};


const BtnCancel = ({ onClick, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:7, border:'1.5px solid #d1d5db', background:'white', color:'#374151', fontSize:13, fontWeight:600, cursor: disabled?'not-allowed':'pointer', opacity: disabled?0.6:1 }}
    onMouseEnter={e => { if(!disabled){e.currentTarget.style.borderColor='#9ca3af';e.currentTarget.style.background='#f9fafb';}}}
    onMouseLeave={e => { e.currentTarget.style.borderColor='#d1d5db';e.currentTarget.style.background='white';}}>
    Cancelar
  </button>
);

const BtnSubmit = ({ saving, label = 'Guardar' }) => (
  <button type="submit" disabled={saving}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7, border:'1.5px solid #185FA5', background:'#185FA5', color:'white', fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}
    onMouseEnter={e => { if(!saving){e.currentTarget.style.background='#1249a0';e.currentTarget.style.borderColor='#1249a0';}}}
    onMouseLeave={e => { e.currentTarget.style.background='#185FA5';e.currentTarget.style.borderColor='#185FA5';}}>
    {saving ? 'Guardando...' : label}
  </button>
);

// ── Modal edición rápida mensual ────────────────────────────
const ControlRapidoModal = ({ show, onHide, item, anio, mes, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset({
      avancePct:    item?.avancePct    ?? '',
      estadoMes:    item?.estadoMes    ?? 'Normal',
      estadoInterno: item?.estadoInterno ?? '',
      horasTicMes:  item?.horasTicMes  ?? '',
      observaciones: item?.observaciones ?? '',
    });
  }, [show, item]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const codProy = item?.codProy;

      // 1. Control mensual (crear o actualizar)
      const ctrlPayload = {
        codProy,
        anio,
        mes,
        avancePct:    data.avancePct    ? parseFloat(data.avancePct)   : null,
        estadoMes:    data.estadoMes    || 'Normal',
        observaciones: data.observaciones || null,
        usuarioCreacion: 'ADMIN',
        usuarioModificacion: 'ADMIN',
      };
      if (item?.controlId) {
        await proyectoControlMensualService.editar(item.controlId, ctrlPayload);
      } else {
        await proyectoControlMensualService.crear(ctrlPayload);
      }

      // 2. Horas TIC del mes (crear o actualizar)
      if (data.horasTicMes !== '' && data.horasTicMes != null) {
        const horasPayload = { codProy, anio, mes, horasTicMes: parseFloat(data.horasTicMes) };
        if (item?.horasFuncionalId) {
          await proyectoHorasService.updateHorasFuncional(item.horasFuncionalId, horasPayload);
        } else {
          await proyectoHorasService.addHorasFuncional(horasPayload);
        }
      }

      // 3. Estado interno del proyecto (si cambió)
      if (data.estadoInterno && data.estadoInterno !== item?.estadoInterno) {
        await proyectosService.editar(codProy, { estadoInterno: data.estadoInterno, usuarioModificacion: 'ADMIN' });
      }

      toast.success(item?.controlId ? 'Control del mes actualizado' : 'Control del mes registrado');
      onHide();
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <ModalHeader closeButton style={{ borderBottom: '1px solid #f3f4f6' }}>
        <ModalTitle style={{ fontSize: 15, fontWeight: 700 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#185FA5', display: 'block' }}>{item?.codProy}</span>
          {MESES[mes]} {anio}
        </ModalTitle>
      </ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-3">
            <Col md={4}>
              <Form.Label style={labelStyle}>Avance %</Form.Label>
              <Form.Control style={inputStyle} type="number" min={0} max={100} step={5} {...register('avancePct')} placeholder="0" />
            </Col>
            <Col md={4}>
              <Form.Label style={labelStyle}>H. TIC del mes</Form.Label>
              <Form.Control style={inputStyle} type="number" step={0.5} {...register('horasTicMes')} placeholder="0" />
            </Col>
            <Col md={4}>
              <Form.Label style={labelStyle}>Estado del mes</Form.Label>
              <Form.Select style={inputStyle} {...register('estadoMes')}>
                <option value="Normal">🟢 Normal</option>
                <option value="En riesgo">🟡 En riesgo</option>
                <option value="Retrasado">🔴 Retrasado</option>
                <option value="Completado">🔵 Completado</option>
              </Form.Select>
            </Col>
            <Col md={12}>
              <Form.Label style={labelStyle}>Estado interno del proyecto</Form.Label>
              <Form.Select style={inputStyle} {...register('estadoInterno')}>
                <option value="">— Sin cambios —</option>
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
            <Col md={12}>
              <Form.Label style={labelStyle}>Observaciones del mes</Form.Label>
              <Form.Control style={{ ...inputStyle, resize: 'none' }} as="textarea" rows={2}
                {...register('observaciones')} placeholder="Avances, bloqueos, notas del mes..." />
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
          <BtnCancel onClick={onHide} disabled={saving} />
          <BtnSubmit saving={saving} label={item?.controlId ? 'Guardar cambios' : 'Registrar mes'} />
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// ── Modal: Copiar proyectos del mes anterior ────────────────
const CopiarPeriodoModal = ({ show, onHide, anio, mes, onSuccess }) => {
  const [proyectosMesAnterior, setProyectosMesAnterior] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [loadingCopiar, setLoadingCopiar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Mes anterior
  const mesAnterior = mes === 1 ? 12 : mes - 1;
  const anioAnterior = mes === 1 ? anio - 1 : anio;

  useEffect(() => {
    if (!show) { setSeleccionados([]); return; }
    setLoadingCopiar(true);
    proyectosService.vistaMensual(anioAnterior, mesAnterior, {})
      .then(res => setProyectosMesAnterior(res?.proyectos ?? []))
      .catch(err => toast.error('Error: ' + err.message))
      .finally(() => setLoadingCopiar(false));
  }, [show, anio, mes]);

  const toggleTodos = () => {
    if (seleccionados.length === proyectosMesAnterior.length)
      setSeleccionados([]);
    else
      setSeleccionados(proyectosMesAnterior.map(p => p.codProy));
  };

  const toggle = (cod) =>
    setSeleccionados(prev => prev.includes(cod) ? prev.filter(c => c !== cod) : [...prev, cod]);

  const confirmar = async () => {
    if (!seleccionados.length) return;
    try {
      setGuardando(true);
      await proyectosService.copiarPeriodo({
        anioOrigen:  anioAnterior,
        mesOrigen:   mesAnterior,
        anioDestino: anio,
        mesDestino:  mes,
        codProys:    seleccionados,
        usuario:     'ADMIN',
      });
      toast.success(`${seleccionados.length} proyecto(s) copiados al mes`);
      onHide();
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton style={{ borderBottom: '1px solid #f3f4f6' }}>
        <ModalTitle style={{ fontSize: 15, fontWeight: 700 }}>
          <FaClone style={{ marginRight: 8, color: '#185FA5' }} />
          Copiar proyectos de {MESES[mesAnterior]} {anioAnterior}
        </ModalTitle>
      </ModalHeader>
      <ModalBody style={{ padding: '16px 20px', maxHeight: 420, overflowY: 'auto' }}>
        {loadingCopiar ? (
          <div className="d-flex justify-content-center py-4"><Spinner animation="border" variant="primary" /></div>
        ) : proyectosMesAnterior.length === 0 ? (
          <p className="text-muted text-center py-3" style={{ fontSize: 13 }}>No hay proyectos en el mes anterior.</p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
              <input type="checkbox" id="sel-todos-copiar"
                checked={seleccionados.length === proyectosMesAnterior.length && proyectosMesAnterior.length > 0}
                onChange={toggleTodos}
                style={{ cursor: 'pointer' }} />
              <label htmlFor="sel-todos-copiar" style={{ fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', marginBottom: 0 }}>
                Seleccionar todos ({proyectosMesAnterior.length})
              </label>
              {seleccionados.length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#185FA5', fontWeight: 600 }}>
                  {seleccionados.length} seleccionado(s)
                </span>
              )}
            </div>
            {proyectosMesAnterior.map(p => (
              <div key={p.codProy} onClick={() => toggle(p.codProy)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 7, cursor: 'pointer',
                  background: seleccionados.includes(p.codProy) ? '#eff6ff' : 'transparent',
                  border: seleccionados.includes(p.codProy) ? '1px solid #bfdbfe' : '1px solid transparent',
                  marginBottom: 4, transition: 'all 0.12s' }}>
                <input type="checkbox" checked={seleccionados.includes(p.codProy)} onChange={() => {}} style={{ cursor: 'pointer' }} />
                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#185FA5', minWidth: 90 }}>{p.codProy}</span>
                <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>{p.nombreRequerimiento ?? '—'}</span>
                <EstadoBadge estado={p.estado} />
              </div>
            ))}
          </>
        )}
      </ModalBody>
      <ModalFooter style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
        <BtnCancel onClick={onHide} disabled={guardando} />
        <button onClick={confirmar} disabled={guardando || seleccionados.length === 0}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7,
            border:'1.5px solid #185FA5', background: seleccionados.length > 0 ? '#185FA5' : '#eff6ff',
            color: seleccionados.length > 0 ? 'white' : '#185FA5', fontSize:13, fontWeight:600,
            cursor: (guardando || seleccionados.length === 0) ? 'not-allowed' : 'pointer',
            opacity: (guardando || seleccionados.length === 0) ? 0.7 : 1 }}>
          {guardando ? 'Copiando...' : `Copiar ${seleccionados.length > 0 ? `(${seleccionados.length})` : ''}`}
        </button>
      </ModalFooter>
    </Modal>
  );
};

// ── Modal: Agregar proyectos al mes ─────────────────────────
const AgregarProyectoMesModal = ({ show, onHide, anio, mes, onSuccess }) => {
  const [disponibles, setDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [loadingDisp, setLoadingDisp] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!show) { setSeleccionados([]); setBusqueda(''); return; }
    setLoadingDisp(true);
    proyectosService.disponiblesParaMes(anio, mes)
      .then(res => setDisponibles(Array.isArray(res) ? res : (res?.proyectos ?? [])))
      .catch(err => toast.error('Error: ' + err.message))
      .finally(() => setLoadingDisp(false));
  }, [show, anio, mes]);

  const filtrados = disponibles.filter(p =>
    !busqueda ||
    p.codProy?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nombreRequerimiento?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const toggle = (cod) =>
    setSeleccionados(prev => prev.includes(cod) ? prev.filter(c => c !== cod) : [...prev, cod]);

  const toggleTodos = () => {
    if (seleccionados.length === filtrados.length)
      setSeleccionados([]);
    else
      setSeleccionados(filtrados.map(p => p.codProy));
  };

  const confirmar = async () => {
    if (!seleccionados.length) return;
    try {
      setGuardando(true);
      await Promise.all(seleccionados.map(cod =>
        proyectoControlMensualService.crear({ codProy: cod, anio, mes, usuarioCreacion: 'ADMIN', usuarioModificacion: 'ADMIN' })
      ));
      toast.success(`${seleccionados.length} proyecto(s) agregados al mes`);
      onHide();
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton style={{ borderBottom: '1px solid #f3f4f6' }}>
        <ModalTitle style={{ fontSize: 15, fontWeight: 700 }}>
          <FaDownload style={{ marginRight: 8, color: '#185FA5' }} />
          Agregar proyecto a {MESES[mes]} {anio}
        </ModalTitle>
      </ModalHeader>
      <ModalBody style={{ padding: '16px 20px' }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <i className="ri-search-line" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:14 }} />
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar proyecto..."
            style={{ width:'100%', padding:'7px 32px', border:'1.5px solid #dde1e7', borderRadius:8, fontSize:13, outline:'none' }} />
        </div>
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {loadingDisp ? (
            <div className="d-flex justify-content-center py-4"><Spinner animation="border" variant="primary" /></div>
          ) : filtrados.length === 0 ? (
            <p className="text-muted text-center py-3" style={{ fontSize: 13 }}>
              {busqueda ? 'Sin resultados.' : 'Todos los proyectos activos ya están en este mes.'}
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                <input type="checkbox" id="sel-todos-agregar"
                  checked={seleccionados.length === filtrados.length && filtrados.length > 0}
                  onChange={toggleTodos} style={{ cursor: 'pointer' }} />
                <label htmlFor="sel-todos-agregar" style={{ fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', marginBottom: 0 }}>
                  Seleccionar todos ({filtrados.length})
                </label>
                {seleccionados.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#185FA5', fontWeight: 600 }}>
                    {seleccionados.length} seleccionado(s)
                  </span>
                )}
              </div>
              {filtrados.map(p => (
                <div key={p.codProy} onClick={() => toggle(p.codProy)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 7, cursor: 'pointer',
                    background: seleccionados.includes(p.codProy) ? '#eff6ff' : 'transparent',
                    border: seleccionados.includes(p.codProy) ? '1px solid #bfdbfe' : '1px solid transparent',
                    marginBottom: 4, transition: 'all 0.12s' }}>
                  <input type="checkbox" checked={seleccionados.includes(p.codProy)} onChange={() => {}} style={{ cursor: 'pointer' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#185FA5', minWidth: 90 }}>{p.codProy}</span>
                  <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>{p.nombreRequerimiento ?? '—'}</span>
                  <EstadoBadge estado={p.estado} />
                </div>
              ))}
            </>
          )}
        </div>
      </ModalBody>
      <ModalFooter style={{ borderTop: '1px solid #f3f4f6', gap: 8 }}>
        <BtnCancel onClick={onHide} disabled={guardando} />
        <button onClick={confirmar} disabled={guardando || seleccionados.length === 0}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:7,
            border:'1.5px solid #185FA5', background: seleccionados.length > 0 ? '#185FA5' : '#eff6ff',
            color: seleccionados.length > 0 ? 'white' : '#185FA5', fontSize:13, fontWeight:600,
            cursor: (guardando || seleccionados.length === 0) ? 'not-allowed' : 'pointer',
            opacity: (guardando || seleccionados.length === 0) ? 0.7 : 1 }}>
          {guardando ? 'Agregando...' : `Agregar ${seleccionados.length > 0 ? `(${seleccionados.length})` : ''}`}
        </button>
      </ModalFooter>
    </Modal>
  );
};

const columnHelper = createColumnHelper();

// ── Componente principal ────────────────────────────────────
const GestionProyectos = () => {
  const navigate = useNavigate();
  const now = new Date();

  const [anio, setAnio]                 = useState(now.getFullYear());
  const [mes, setMes]                   = useState(now.getMonth() + 1);
  const [filterAnalista, setFilterAnalista] = useState('');
  const [filterEstado, setFilterEstado]     = useState('');
  const [search, setSearch]             = useState('');
  const [data, setData]                 = useState(null);
  const [loading, setLoading]           = useState(true);

  const [modalControl, setModalControl]   = useState({ show: false, item: null });
  const [modalProyecto, setModalProyecto] = useState({ show: false, item: null });
  const [modalDelete, setModalDelete]     = useState({ show: false, item: null });
  const [modalCopiar, setModalCopiar]     = useState(false);
  const [modalAgregar, setModalAgregar]   = useState(false);
  const [savingProy, setSavingProy]       = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await proyectosService.vistaMensual(anio, mes, {
        analista: filterAnalista,
        estado:   filterEstado,
        search,
      });
      setData(res);
    } catch (err) {
      toast.error('Error al cargar: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [anio, mes, filterAnalista, filterEstado, search]);

  useEffect(() => { cargar(); }, [cargar]);

  const proyectos = useMemo(() => data?.proyectos ?? [], [data]);

  // Analistas únicos para filtro
  const analistas = useMemo(() =>
    [...new Set((data?.proyectos ?? []).map(p => p.analista).filter(Boolean))].sort(),
  [data]);

  // ── Columnas TanStack ────────────────────────────────────
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

  const columns = useMemo(() => [
    columnHelper.accessor('codProy', {
      header: 'Código',
      cell: ({ getValue }) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#185FA5', whiteSpace: 'nowrap' }}>{getValue()}</span>
      ),
    }),
    columnHelper.accessor('nombreRequerimiento', {
      header: 'Nombre',
      cell: ({ getValue }) => <span>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('analista', {
      header: 'Analista',
      cell: ({ getValue }) => <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('estado', {
      header: 'Estado',
      cell: ({ getValue }) => <EstadoBadge estado={getValue()} />,
    }),
    columnHelper.accessor('estadoInterno', {
      header: 'Estado interno',
      cell: ({ getValue }) => <span className="text-muted" style={{ fontSize: 12 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('avancePct', {
      header: 'Avance mes',
      cell: ({ getValue }) => <ProgressBar pct={getValue()} />,
    }),
    columnHelper.accessor('horasTicMes', {
      header: 'H. TIC',
      cell: ({ getValue }) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {getValue() != null ? `${getValue()}h` : '—'}
        </span>
      ),
    }),
    columnHelper.accessor('montoTotalProyecto', {
      header: 'Monto (S/)',
      cell: ({ getValue }) => {
        const v = getValue();
        return v != null
          ? <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#185FA5' }}>
              {Number(v).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          : <span className="text-muted">—</span>;
      },
    }),
    columnHelper.accessor('estadoMes', {
      header: 'Estado mes',
      cell: ({ getValue }) => <EstadoMesBadge estado={getValue()} />,
    }),
    columnHelper.display({
      id: 'acciones',
      header: '',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="d-flex gap-1">
            <button
              title="Actualizar mes"
              onClick={() => setModalControl({ show: true, item: p })}
              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:7,
                border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#185FA5', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#185FA5'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; e.currentTarget.style.borderColor='#bfdbfe'; }}>
              <FaPen size={9}/>
            </button>
            <button title="Ver detalle"
              onClick={() => navigate(`/proyectos/${p.codProy}`)}
              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:7, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#6b7280', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#374151'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#374151'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.color='#6b7280'; e.currentTarget.style.borderColor='#d1d5db'; }}>
              <FaEye size={9}/>
            </button>
            <button title="Editar proyecto"
              onClick={() => setModalProyecto({ show: true, item: p })}
              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:7, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#6b7280', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#374151'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#374151'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.color='#6b7280'; e.currentTarget.style.borderColor='#d1d5db'; }}>
              <FaPen size={9}/>
            </button>
          </div>
        );
      },
    }),
  ], [navigate, setModalControl, setModalProyecto]);

  const table = useReactTable({
    data: proyectos,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const pageIndex  = table.getState().pagination.pageIndex;
  const pageSize   = table.getState().pagination.pageSize;
  const totalItems = table.getFilteredRowModel().rows.length;
  const start      = pageIndex * pageSize + 1;
  const end        = Math.min(start + pageSize - 1, totalItems);

  const handleSaveProyecto = async (payload) => {
    try {
      setSavingProy(true);
      if (modalProyecto.item) {
        await proyectosService.editar(modalProyecto.item.codProy, payload);
        toast.success('Proyecto actualizado');
      } else {
        await proyectosService.crear(payload);
        toast.success('Proyecto creado');
      }
      setModalProyecto({ show: false, item: null });
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSavingProy(false); }
  };

  const handleDelete = async () => {
    try {
      await proyectosService.eliminar(modalDelete.item.codProy);
      toast.success(`Proyecto ${modalDelete.item.codProy} anulado`);
      setModalDelete({ show: false, item: null });
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  const kpis = data?.kpis;

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Control de Proyectos"
        subTitle1="Proyectos"
        subTitle2="Control mensual"
        subText="Seguimiento mensual de avance, horas y estado por proyecto."
      />

      <div className="main-content">

        {/* ── Filtros ── */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-3 px-3">
            <Row className="g-2 align-items-center">

              {/* Año + Mes destacados */}
              <Col xs="auto">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 8, padding: '5px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#185FA5', textTransform: 'uppercase' }}>Año</span>
                  <select value={anio} onChange={e => setAnio(Number(e.target.value))}
                    style={{ border: 'none', background: 'transparent', color: '#185FA5', fontWeight: 700, fontSize: 14, outline: 'none', cursor: 'pointer' }}>
                    {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <span style={{ color: '#bfdbfe' }}>|</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#185FA5', textTransform: 'uppercase' }}>Mes</span>
                  <select value={mes} onChange={e => setMes(Number(e.target.value))}
                    style={{ border: 'none', background: 'transparent', color: '#185FA5', fontWeight: 700, fontSize: 14, outline: 'none', cursor: 'pointer' }}>
                    {MESES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
              </Col>

              {/* Analista */}
              <Col xs={6} md={2}>
                <select value={filterAnalista} onChange={e => setFilterAnalista(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #dde1e7', borderRadius: 8, fontSize: 12, color: '#374151', background: 'white', outline: 'none' }}>
                  <option value="">Todos los analistas</option>
                  {analistas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </Col>

              {/* Estado */}
              <Col xs={6} md={2}>
                <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #dde1e7', borderRadius: 8, fontSize: 12, color: '#374151', background: 'white', outline: 'none' }}>
                  <option value="">Todos los estados</option>
                  <option value="1. ENT en Definicion">1. ENT en Definicion</option>
                  <option value="2. ENT en Elaboracion">2. ENT en Elaboracion</option>
                  <option value="3. ENT en Cotización">3. ENT en Cotización</option>
                  <option value="4. En Espera de aprob.">4. En Espera de aprob.</option>
                  <option value="4.1. Autorizado en espera">4.1. Autorizado en espera</option>
                  <option value="5. En Construcción">5. En Construcción</option>
                  <option value="6. Cerrado">6. Cerrado</option>
                  <option value="8. Anulado">8. Anulado</option>
                  <option value="9. En Pausa">9. En Pausa</option>
                  <option value="10. Desestimado">10. Desestimado</option>
                </select>
              </Col>

              {/* Buscar */}
              <Col xs={12} md={3} className="ms-auto">
                <div style={{ position: 'relative' }}>
                  <i className="ri-search-line" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:14 }} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar proyecto..."
                    style={{ width:'100%', padding:'7px 32px 7px 32px', border:'1.5px solid #dde1e7', borderRadius:8, fontSize:13, outline:'none' }}
                    onFocus={e => e.target.style.borderColor='#185FA5'}
                    onBlur={e  => e.target.style.borderColor='#dde1e7'} />
                  {search && (
                    <button onClick={() => setSearch('')}
                      style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex' }}>
                      <FaXmark size={12}/>
                    </button>
                  )}
                </div>
              </Col>

              {/* Acciones */}
              <Col xs="auto">
                <div style={{ display: 'flex', gap: 6 }}>
                  {/* Copiar del mes anterior */}
                  <button onClick={() => setModalCopiar(true)}
                    title={`Copiar proyectos de ${MESES[mes === 1 ? 12 : mes - 1]} ${mes === 1 ? anio - 1 : anio}`}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:7, border:'1.5px solid #d1d5db', background:'white', color:'#374151', fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='#9ca3af'; e.currentTarget.style.background='#f9fafb'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='#d1d5db'; e.currentTarget.style.background='white'; }}>
                    <FaClone size={11}/> Copiar mes anterior
                  </button>
                  {/* Agregar al mes */}
                  <button onClick={() => setModalAgregar(true)}
                    title="Agregar proyecto al mes actual"
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:7, border:'1.5px solid #d1d5db', background:'white', color:'#374151', fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='#9ca3af'; e.currentTarget.style.background='#f9fafb'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='#d1d5db'; e.currentTarget.style.background='white'; }}>
                    <FaDownload size={11}/> Agregar proyecto
                  </button>
                  {/* Nuevo proyecto */}
                  <button onClick={() => setModalProyecto({ show: true, item: null })}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
                    <FaPlus size={12}/> Nuevo proyecto
                  </button>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* ── KPIs ── */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <KpiCard label="Proyectos del mes" value={kpis?.totalProyectos ?? '—'} color="#185FA5" subtitle={`${MESES_CORTO[mes]} ${anio}`} />
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="Horas TIC del mes" value={kpis?.horasTotalMes ? `${kpis.horasTotalMes}h` : '—'} color="#185FA5" />
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="En riesgo / Retrasados" value={kpis?.enRiesgo ?? '—'} color="#BA7517" />
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="Avance promedio" value={kpis?.avancePromedio != null ? `${kpis.avancePromedio}%` : '—'} color="#3B6D11"
              subtitle={`${kpis?.conRegistro ?? 0} de ${kpis?.totalProyectos ?? 0} con datos`} />
          </Col>
        </Row>

        {/* ── Tabla ── */}
        <div className="card border-0 shadow-sm">
          <div className="card-header py-2 px-3 d-flex align-items-center justify-content-between" style={{ background: 'white', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <span className="fw-semibold" style={{ fontSize: 13 }}>
                Proyectos — {MESES[mes]} {anio}
              </span>
              <span className="text-muted ms-2" style={{ fontSize: 11 }}>
                {totalItems} proyecto{totalItems !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-muted" style={{ fontSize: 12 }}>
              {totalItems > 0 ? `${start}–${end} de ${totalItems}` : ''}
            </span>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <DataTable
                table={table}
                showExport={true}
                exportFileName={`proyectos-${MESES[mes]}-${anio}`}
                emptyMessage="No hay proyectos en este mes. Usa 'Copiar mes anterior' o 'Agregar proyecto'."
                className="mb-0"
              />
              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="proyectos" showInfo
                previousPage={table.previousPage} canPreviousPage={table.getCanPreviousPage()}
                pageCount={table.getPageCount()} pageIndex={table.getState().pagination.pageIndex}
                setPageIndex={table.setPageIndex} nextPage={table.nextPage}
                canNextPage={table.getCanNextPage()} pageSize={table.getState().pagination.pageSize}
                onPageSizeChange={size => table.setPageSize(size)} showPageLimit
              />
            </>
          )}
        </div>


      </div>

      {/* ── Modales ── */}
      <ControlRapidoModal
        show={modalControl.show}
        onHide={() => setModalControl({ show: false, item: null })}
        item={modalControl.item}
        anio={anio}
        mes={mes}
        onSuccess={cargar}
      />

      <ProyectoModal
        show={modalProyecto.show}
        onHide={() => setModalProyecto({ show: false, item: null })}
        onSave={handleSaveProyecto}
        proyecto={modalProyecto.item}
        saving={savingProy}
      />

      <ConfirmModal
        show={modalDelete.show}
        title="Anular proyecto"
        message={`¿Anular el proyecto "${modalDelete.item?.codProy}"?`}
        confirmText="Sí, anular"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setModalDelete({ show: false, item: null })}
      />

      <CopiarPeriodoModal
        show={modalCopiar}
        onHide={() => setModalCopiar(false)}
        anio={anio}
        mes={mes}
        onSuccess={cargar}
      />

      <AgregarProyectoMesModal
        show={modalAgregar}
        onHide={() => setModalAgregar(false)}
        anio={anio}
        mes={mes}
        onSuccess={cargar}
      />
    </div>
  );
};

export default GestionProyectos;
