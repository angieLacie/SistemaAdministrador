import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Badge, Form, Spinner, Tab, Tabs, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaPen, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa6';
import { useForm } from 'react-hook-form';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import {
  proyectosService,
  proyectoOCProveedorService,
  proyectoOCClienteService,
  proyectoHorasService,
  proyectoControlMensualService,
} from '@/services/proyectos.service';

// ── Helpers ───────────────────────────────────────────
const MESES = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const EstadoBadge = ({ estado }) => {
  const map = {
    'En curso':   { bg: '#E6F1FB', color: '#185FA5' },
    'Finalizado': { bg: '#EAF3DE', color: '#3B6D11' },
    'Suspendido': { bg: '#FAEEDA', color: '#BA7517' },
    'Anulado':    { bg: '#FCEBEB', color: '#A32D2D' },
    'Pendiente':  { bg: '#F1EFE8', color: '#5F5E5A' },
  };
  const e = map[estado] || { bg: '#F1EFE8', color: '#5F5E5A' };
  return <Badge style={{ background: e.bg, color: e.color, fontSize: 10 }}>{estado ?? '—'}</Badge>;
};

const estadoMesMap = {
  'Normal':     { bg: '#EAF3DE', color: '#3B6D11' },
  'En riesgo':  { bg: '#FAEEDA', color: '#BA7517' },
  'Retrasado':  { bg: '#FCEBEB', color: '#A32D2D' },
  'Completado': { bg: '#E6F1FB', color: '#185FA5' },
};

const Campo = ({ label, value, mono = false }) => (
  <div className="mb-3">
    <p className="text-muted mb-1" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <p className="mb-0 fw-semibold" style={{ fontSize: 13, fontFamily: mono ? 'monospace' : undefined }}>
      {value ?? <span className="text-muted fw-normal">—</span>}
    </p>
  </div>
);

const formatFecha = (f) => {
  if (!f) return '—';
  const d = new Date(f);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-PE');
};
const formatMonto = (m) => m ? `S/ ${Number(m).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—';

// ── Estilos ───────────────────────────────────────────
const labelStyle = { fontSize: 12, fontWeight: 600, marginBottom: 4 };
const inputStyle = { fontSize: 13, borderRadius: 8, border: '1.5px solid #dde1e7', padding: '7px 10px' };

// ── Botones reutilizables ─────────────────────────────
const BtnCancel = ({ onClick }) => (
  <button type="button" onClick={onClick}
    style={{ padding:'6px 16px', borderRadius:7, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#374151', fontSize:13, fontWeight:500, cursor:'pointer' }}
    onMouseEnter={e => { e.currentTarget.style.background='#374151'; e.currentTarget.style.color='white'; }}
    onMouseLeave={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.color='#374151'; }}>
    Cancelar
  </button>
);
const BtnSubmit = ({ saving, label = 'Guardar', loadingLabel = 'Guardando...' }) => (
  <button type="submit" disabled={saving}
    style={{ padding:'6px 16px', borderRadius:7, border:'1.5px solid #185FA5', background:'#185FA5', color:'white', fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
    onMouseEnter={e => { if (!saving) { e.currentTarget.style.background='#1249a0'; e.currentTarget.style.borderColor='#1249a0'; } }}
    onMouseLeave={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.borderColor='#185FA5'; }}>
    {saving ? loadingLabel : label}
  </button>
);

// ── Botones de acción ─────────────────────────────────
const btn30Edit = {
  style: { display:'inline-flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:7, border:'1.5px solid #bfdbfe', background:'#eff6ff', color:'#185FA5', cursor:'pointer', transition:'all 0.15s' },
  onMouseEnter: e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#185FA5'; },
  onMouseLeave: e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; e.currentTarget.style.borderColor='#bfdbfe'; },
};
const btn30Del = {
  style: { display:'inline-flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:7, border:'1.5px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer', transition:'all 0.15s' },
  onMouseEnter: e => { e.currentTarget.style.background='#dc2626'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#dc2626'; },
  onMouseLeave: e => { e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='#dc2626'; e.currentTarget.style.borderColor='#fecaca'; },
};
const btnBlueSm = {
  style: { display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:7, border:'1.5px solid #bfdbfe', background:'#eff6ff', color:'#185FA5', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s' },
  onMouseEnter: e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#185FA5'; },
  onMouseLeave: e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; e.currentTarget.style.borderColor='#bfdbfe'; },
};
const btnGreenSm = {
  style: { display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:7, border:'1.5px solid #bbf7d0', background:'#f0fdf4', color:'#166534', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s' },
  onMouseEnter: e => { e.currentTarget.style.background='#166534'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#166534'; },
  onMouseLeave: e => { e.currentTarget.style.background='#f0fdf4'; e.currentTarget.style.color='#166534'; e.currentTarget.style.borderColor='#bbf7d0'; },
};

// ── OC Proveedor Card ─────────────────────────────────
const OCProveedorCard = ({ oc, onEdit, onDelete, onAddHES, onEditHES, onDeleteHES }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-header py-2 d-flex align-items-center justify-content-between"
        style={{ background: '#eff6ff', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}>
        <div className="d-flex align-items-center gap-2">
          {expanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
          <span className="fw-semibold" style={{ fontSize: 13, color: '#185FA5' }}>{oc.proveedor ?? '—'}</span>
          <Badge bg="light" text="dark" style={{ fontSize: 10, border: '1px solid #bfdbfe' }}>{oc.oscsc ?? 'Sin OS'}</Badge>
        </div>
        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(oc)} title="Editar" {...btn30Edit}><FaPen size={10} /></button>
          <button onClick={() => onDelete(oc.id)} title="Eliminar" {...btn30Del}><FaTrash size={10} /></button>
        </div>
      </div>
      {expanded && (
        <div className="card-body">
          <Row className="g-3 mb-3">
            <Col md={3}><Campo label="Importe PEN" value={formatMonto(oc.importeProvPEN)} /></Col>
            <Col md={3}><Campo label="Importe USD" value={oc.importeProvUSD ? `$ ${Number(oc.importeProvUSD).toLocaleString()}` : '—'} /></Col>
            <Col md={3}><Campo label="Cargado Orden CO" value={oc.cargadoOrdenCO} mono /></Col>
            <Col md={3}><Campo label="Solped CSC" value={oc.solpedCSC} mono /></Col>
            <Col md={3}><Campo label="Estado Prov" value={oc.estadoProv} /></Col>
            <Col md={3}><Campo label="Estado CSC" value={oc.estadoCSC} /></Col>
            <Col md={6}><Campo label="Descripción Orden CO" value={oc.descripcionOrdenCO} /></Col>
            <Col md={12}><Campo label="Observación" value={oc.observacion} /></Col>
          </Row>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted fw-semibold" style={{ fontSize: 11, textTransform: 'uppercase' }}>HES Proveedor ({oc.hes?.length ?? 0})</span>
            <button onClick={() => onAddHES(oc.id)} {...btnBlueSm}><FaPlus size={9} /> Agregar HES</button>
          </div>
          {oc.hes?.length > 0 ? (
            <table className="table table-sm" style={{ fontSize: 12 }}>
              <thead className="table-light"><tr><th>Nro HES</th><th>% HES</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {oc.hes.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontFamily:'monospace' }}>{h.nroHES ?? '—'}</td>
                    <td>{h.pctHES ? `${h.pctHES}%` : '—'}</td>
                    <td><Badge bg={h.estado === 'A' ? 'success' : 'secondary'} style={{ fontSize: 9 }}>{h.estado === 'A' ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td>
                      <div className="d-flex gap-1">
                        <button onClick={() => onEditHES(h, oc.id, 'proveedor')} title="Editar" {...btn30Edit}><FaPen size={9} /></button>
                        <button onClick={() => onDeleteHES(h.id, 'proveedor')} title="Eliminar" {...btn30Del}><FaTrash size={9} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-muted" style={{ fontSize: 12 }}>Sin HES registrados.</p>}
        </div>
      )}
    </div>
  );
};

// ── OC Cliente Card ───────────────────────────────────
const OCClienteCard = ({ oc, onEdit, onDelete, onAddHES, onEditHES, onDeleteHES }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-header py-2 d-flex align-items-center justify-content-between"
        style={{ background: '#EAF3DE', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}>
        <div className="d-flex align-items-center gap-2">
          {expanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
          <span className="fw-semibold" style={{ fontSize: 13, color: '#3B6D11' }}>{oc.empRefacturable ?? '—'}</span>
          <Badge bg="light" text="dark" style={{ fontSize: 10, border: '1px solid #C0DD97' }}>{oc.codSAPCliente ?? 'Sin SAP'}</Badge>
          {oc.seRefactura && <Badge bg="success" style={{ fontSize: 9 }}>Refacturable</Badge>}
        </div>
        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(oc)} title="Editar" {...btn30Edit}><FaPen size={10} /></button>
          <button onClick={() => onDelete(oc.id)} title="Eliminar" {...btn30Del}><FaTrash size={10} /></button>
        </div>
      </div>
      {expanded && (
        <div className="card-body">
          <Row className="g-3 mb-3">
            <Col md={3}><Campo label="Importe Ref PEN" value={formatMonto(oc.importeRefPEN)} /></Col>
            <Col md={3}><Campo label="Importe Ref USD" value={oc.importeRefUSD ? `$ ${Number(oc.importeRefUSD).toLocaleString()}` : '—'} /></Col>
            <Col md={3}><Campo label="OS Cliente CSC" value={oc.osClienteCSC} mono /></Col>
            <Col md={3}><Campo label="Estado CSC" value={oc.estadoCSC} /></Col>
            <Col md={12}><Campo label="Observación" value={oc.observacion} /></Col>
          </Row>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted fw-semibold" style={{ fontSize: 11, textTransform: 'uppercase' }}>HES Cliente ({oc.hes?.length ?? 0})</span>
            <button onClick={() => onAddHES(oc.id)} {...btnGreenSm}><FaPlus size={9} /> Agregar HES</button>
          </div>
          {oc.hes?.length > 0 ? (
            <table className="table table-sm" style={{ fontSize: 12 }}>
              <thead className="table-light"><tr><th>Nro HES</th><th>Nro Factura SAP</th><th>Monto PEN</th><th>Monto USD</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {oc.hes.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontFamily:'monospace' }}>{h.nroHES ?? '—'}</td>
                    <td style={{ fontFamily:'monospace' }}>{h.nroFacturaSAP ?? '—'}</td>
                    <td>{formatMonto(h.montoFactPEN)}</td>
                    <td>{h.montoFactUSD ? `$ ${Number(h.montoFactUSD).toLocaleString()}` : '—'}</td>
                    <td><Badge bg={h.estado === 'A' ? 'success' : 'secondary'} style={{ fontSize: 9 }}>{h.estado === 'A' ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td>
                      <div className="d-flex gap-1">
                        <button onClick={() => onEditHES(h, oc.id, 'cliente')} title="Editar" {...btn30Edit}><FaPen size={9} /></button>
                        <button onClick={() => onDeleteHES(h.id, 'cliente')} title="Eliminar" {...btn30Del}><FaTrash size={9} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-muted" style={{ fontSize: 12 }}>Sin HES registrados.</p>}
        </div>
      )}
    </div>
  );
};

// ── Modal OC Proveedor ────────────────────────────────
const OCProveedorModal = ({ show, onHide, onSave, oc, codProy, saving }) => {
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    reset(oc ? {
      proveedor: oc.proveedor ?? '', importeProvPEN: oc.importeProvPEN ?? '',
      importeProvUSD: oc.importeProvUSD ?? '', cargadoOrdenCO: oc.cargadoOrdenCO ?? '',
      descripcionOrdenCO: oc.descripcionOrdenCO ?? '', solpedCSC: oc.solpedCSC ?? '',
      oscsc: oc.oscsc ?? '', estadoProv: oc.estadoProv ?? '', observacion: oc.observacion ?? '',
    } : { proveedor:'', importeProvPEN:'', importeProvUSD:'', cargadoOrdenCO:'',
      descripcionOrdenCO:'', solpedCSC:'', oscsc:'', estadoProv:'', observacion:'' });
  }, [show, oc]);

  const onSubmit = (data) => onSave({ ...data, codProy,
    importeProvPEN: data.importeProvPEN ? parseFloat(data.importeProvPEN) : null,
    importeProvUSD: data.importeProvUSD ? parseFloat(data.importeProvUSD) : null,
  });

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{oc ? 'Editar OC Proveedor' : 'Nueva OC Proveedor'}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-2">
            <Col md={6}><Form.Label style={labelStyle}>Proveedor</Form.Label><Form.Control style={inputStyle} {...register('proveedor')} placeholder="Nombre del proveedor"/></Col>
            <Col md={3}><Form.Label style={labelStyle}>Importe PEN</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('importeProvPEN')} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label style={labelStyle}>Importe USD</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('importeProvUSD')} placeholder="0.00"/></Col>
            <Col md={4}><Form.Label style={labelStyle}>Cargado Orden CO</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('cargadoOrdenCO')}/></Col>
            <Col md={8}><Form.Label style={labelStyle}>Descripción Orden CO</Form.Label><Form.Control style={inputStyle} {...register('descripcionOrdenCO')}/></Col>
            <Col md={4}><Form.Label style={labelStyle}>Solped CSC</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('solpedCSC')}/></Col>
            <Col md={4}><Form.Label style={labelStyle}>OS CSC</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('oscsc')}/></Col>
            <Col md={4}><Form.Label style={labelStyle}>Estado Prov</Form.Label>
              <Form.Select style={inputStyle} {...register('estadoProv')}>
                <option value="">Seleccionar...</option>
                <option value="1. Pend. OS Prov.">1. Pend. OS Prov.</option>
                <option value="2. Envio OS a Prov">2. Envio OS a Prov</option>
                <option value="3. Envio HES a Prov">3. Envio HES a Prov</option>
                <option value="4. Pend. Carga a Portal">4. Pend. Carga a Portal</option>
                <option value="5. Pend. Registro Contable">5. Pend. Registro Contable</option>
                <option value="6. Documento registrado">6. Documento registrado</option>
                <option value="7. No aplica">7. No aplica</option>
              </Form.Select>
            </Col>
            <Col md={12}><Form.Label style={labelStyle}>Observación</Form.Label><Form.Control style={{ ...inputStyle, resize:'none' }} as="textarea" rows={2} {...register('observacion')}/></Col>
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={onHide} />
          <BtnSubmit saving={saving} />
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// ── Modal OC Cliente ──────────────────────────────────
const OCClienteModal = ({ show, onHide, onSave, oc, codProy, saving }) => {
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    reset(oc ? {
      codSAPCliente: oc.codSAPCliente ?? '', empRefacturable: oc.empRefacturable ?? '',
      seRefactura: oc.seRefactura ?? false, importeRefPEN: oc.importeRefPEN ?? '',
      importeRefUSD: oc.importeRefUSD ?? '', osClienteCSC: oc.osClienteCSC ?? '',
      estadoCSC: oc.estadoCSC ?? '', observacion: oc.observacion ?? '',
    } : { codSAPCliente:'', empRefacturable:'', seRefactura:false,
      importeRefPEN:'', importeRefUSD:'', osClienteCSC:'', estadoCSC:'', observacion:'' });
  }, [show, oc]);

  const onSubmit = (data) => onSave({ ...data, codProy,
    importeRefPEN: data.importeRefPEN ? parseFloat(data.importeRefPEN) : null,
    importeRefUSD: data.importeRefUSD ? parseFloat(data.importeRefUSD) : null,
    seRefactura: !!data.seRefactura,
  });

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{oc ? 'Editar OC Cliente' : 'Nueva OC Cliente'}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-2">
            <Col md={6}><Form.Label style={labelStyle}>Cód SAP Cliente</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('codSAPCliente')}/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Empresa Refacturable</Form.Label><Form.Control style={inputStyle} {...register('empRefacturable')}/></Col>
            <Col md={3}><Form.Label style={labelStyle}>Importe Ref PEN</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('importeRefPEN')} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label style={labelStyle}>Importe Ref USD</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('importeRefUSD')} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label style={labelStyle}>OS Cliente CSC</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('osClienteCSC')}/></Col>
            <Col md={3}><Form.Label style={labelStyle}>Estado CSC</Form.Label>
              <Form.Select style={inputStyle} {...register('estadoCSC')}>
                <option value="">Seleccionar...</option>
                <option value="1. Pend. Gen. OS">1. Pend. Gen. OS</option>
                <option value="2. Pend. Aprob. OS">2. Pend. Aprob. OS</option>
                <option value="3. Pend. Gen. HES">3. Pend. Gen. HES</option>
                <option value="4. Pend. Aprob. HES">4. Pend. Aprob. HES</option>
                <option value="5. Pend. Facturar">5. Pend. Facturar</option>
                <option value="6. Facturado">6. Facturado</option>
              </Form.Select>
            </Col>
            <Col md={12}><Form.Check type="switch" label="Se refactura" {...register('seRefactura')}/></Col>
            <Col md={12}><Form.Label style={labelStyle}>Observación</Form.Label><Form.Control style={{ ...inputStyle, resize:'none' }} as="textarea" rows={2} {...register('observacion')}/></Col>
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={onHide} />
          <BtnSubmit saving={saving} />
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// ── Modal HES ─────────────────────────────────────────
const HESModal = ({ show, onHide, onSave, hes, tipo, saving }) => {
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    reset(hes ? {
      nroHES: hes.nroHES ?? '', pctHES: hes.pctHES ?? '',
      nroFacturaSAP: hes.nroFacturaSAP ?? '',
      montoFactPEN: hes.montoFactPEN ?? '', montoFactUSD: hes.montoFactUSD ?? '',
    } : { nroHES:'', pctHES:'', nroFacturaSAP:'', montoFactPEN:'', montoFactUSD:'' });
  }, [show, hes]);

  const onSubmit = (data) => onSave({
    nroHES: data.nroHES || null,
    pctHES: data.pctHES ? parseFloat(data.pctHES) : null,
    ...(tipo === 'cliente' && {
      nroFacturaSAP: data.nroFacturaSAP || null,
      montoFactPEN: data.montoFactPEN ? parseFloat(data.montoFactPEN) : null,
      montoFactUSD: data.montoFactUSD ? parseFloat(data.montoFactUSD) : null,
    }),
  });

  return (
    <Modal show={show} onHide={onHide} centered>
      <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{hes ? 'Editar HES' : 'Nuevo HES'} — {tipo === 'proveedor' ? 'Proveedor' : 'Cliente'}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-2">
            <Col md={6}><Form.Label style={labelStyle}>Nro HES</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('nroHES')} placeholder="Ej: HES-001"/></Col>
            {tipo === 'proveedor' && (
              <Col md={6}><Form.Label style={labelStyle}>% HES</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('pctHES')} placeholder="0.00"/></Col>
            )}
            {tipo === 'cliente' && (<>
              <Col md={6}><Form.Label style={labelStyle}>Nro Factura SAP</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('nroFacturaSAP')}/></Col>
              <Col md={6}><Form.Label style={labelStyle}>Monto Fact PEN</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('montoFactPEN')} placeholder="0.00"/></Col>
              <Col md={6}><Form.Label style={labelStyle}>Monto Fact USD</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('montoFactUSD')} placeholder="0.00"/></Col>
            </>)}
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={onHide} />
          <BtnSubmit saving={saving} />
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// ── Modal Cronograma (FUERA del componente principal) ─
const CronogramaModal = ({ show, onHide, cron, proyectoId, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset({
      fechaEntrega:     cron?.fechaEntrega?.slice(0,10)     ?? '',
      fRequerimiento:   cron?.fRequerimiento?.slice(0,10)   ?? '',
      fEntregaFinal:    cron?.fEntregaFinal?.slice(0,10)    ?? '',
      fCotizacion:      cron?.fCotizacion?.slice(0,10)      ?? '',
      fAutorizado:      cron?.fAutorizado?.slice(0,10)      ?? '',
      fIniConstruccion: cron?.fIniConstruccion?.slice(0,10) ?? '',
      fFinConstruccion: cron?.fFinConstruccion?.slice(0,10) ?? '',
      fIniValUsu:       cron?.fIniValUsu?.slice(0,10)       ?? '',
      fCierre:          cron?.fCierre?.slice(0,10)          ?? '',
    });
  }, [show, cron]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await proyectosService.updateCronograma(proyectoId, {
        fechaEntrega: data.fechaEntrega || null, fRequerimiento: data.fRequerimiento || null,
        fEntregaFinal: data.fEntregaFinal || null, fCotizacion: data.fCotizacion || null,
        fAutorizado: data.fAutorizado || null, fIniConstruccion: data.fIniConstruccion || null,
        fFinConstruccion: data.fFinConstruccion || null, fIniValUsu: data.fIniValUsu || null,
        fCierre: data.fCierre || null, usuarioModificacion: 'ADMIN',
      });
      toast.success('Cronograma actualizado');
      onHide();
      onSuccess();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>Cronograma — {proyectoId}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-2">
            {[
              { name: 'fechaEntrega',     label: 'Fecha entrega' },
              { name: 'fRequerimiento',   label: 'F. Requerimiento' },
              { name: 'fEntregaFinal',    label: 'F. Entrega final' },
              { name: 'fCotizacion',      label: 'F. Cotización' },
              { name: 'fAutorizado',      label: 'F. Autorizado' },
              { name: 'fIniConstruccion', label: 'F. Ini. Construcción' },
              { name: 'fFinConstruccion', label: 'F. Fin Construcción' },
              { name: 'fIniValUsu',       label: 'F. Ini. Val. Usuario' },
              { name: 'fCierre',          label: 'F. Cierre' },
            ].map(f => (
              <Col key={f.name} md={4}>
                <Form.Label style={labelStyle}>{f.label}</Form.Label>
                <Form.Control style={inputStyle} type="date" {...register(f.name)} />
              </Col>
            ))}
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={onHide} />
          <BtnSubmit saving={saving} label="Guardar cronograma" />
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// ── Modal Horas (FUERA del componente principal) ──────
const HorasModal = ({ show, onHide, horas, proyectoId, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset({
      horasProyecto: horas?.horasProyecto ?? '',
      horasTIC:      horas?.horasTIC      ?? '',
      horasJP:       horas?.horasJP       ?? '',
      horasProv:     horas?.horasProv     ?? '',
    });
  }, [show, horas]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await proyectoHorasService.updateHoras(proyectoId, {
        horasProyecto: data.horasProyecto ? parseFloat(data.horasProyecto) : null,
        horasTIC:      data.horasTIC      ? parseFloat(data.horasTIC)      : null,
        horasJP:       data.horasJP       ? parseFloat(data.horasJP)       : null,
        horasProv:     data.horasProv     ? parseFloat(data.horasProv)     : null,
      });
      toast.success('Horas actualizadas');
      onHide();
      onSuccess();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>Horas del proyecto</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-2">
            <Col md={6}><Form.Label style={labelStyle}>Horas proyecto</Form.Label><Form.Control style={inputStyle} type="number" step="0.5" {...register('horasProyecto')} placeholder="0"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Horas TIC</Form.Label><Form.Control style={inputStyle} type="number" step="0.5" {...register('horasTIC')} placeholder="0"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Horas JP</Form.Label><Form.Control style={inputStyle} type="number" step="0.5" {...register('horasJP')} placeholder="0"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Horas Prov</Form.Label><Form.Control style={inputStyle} type="number" step="0.5" {...register('horasProv')} placeholder="0"/></Col>
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={onHide} />
          <BtnSubmit saving={saving} />
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// ── Modal Horas Funcional (FUERA del componente principal) ─
const HorasFuncionalModal = ({ show, onHide, item, codProy, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset(item
      ? { anio: item.anio, mes: item.mes, horasTicMes: item.horasTicMes ?? '' }
      : { anio: new Date().getFullYear(), mes: new Date().getMonth() + 1, horasTicMes: '' }
    );
  }, [show, item]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const payload = { codProy, anio: parseInt(data.anio), mes: parseInt(data.mes), horasTicMes: parseFloat(data.horasTicMes) };
      if (item) await proyectoHorasService.updateHorasFuncional(item.id, payload);
      else      await proyectoHorasService.addHorasFuncional(payload);
      toast.success('Horas funcional guardadas');
      onHide();
      onSuccess();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{item ? 'Editar' : 'Nuevo'} registro mensual</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-2">
            <Col md={4}><Form.Label style={labelStyle}>Año</Form.Label><Form.Control style={inputStyle} type="number" {...register('anio')} disabled={!!item}/></Col>
            <Col md={4}><Form.Label style={labelStyle}>Mes</Form.Label>
              <Form.Select style={inputStyle} {...register('mes')} disabled={!!item}>
                {MESES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </Form.Select>
            </Col>
            <Col md={4}><Form.Label style={labelStyle}>Horas TIC mes</Form.Label><Form.Control style={inputStyle} type="number" step="0.5" {...register('horasTicMes')} placeholder="0"/></Col>
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={onHide} />
          <BtnSubmit saving={saving} />
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// ── Modal Control Mensual (NUEVO) ─────────────────────
const ControlMensualModal = ({ show, onHide, item, codProy, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset(item ? {
      anio: item.anio, mes: item.mes,
      avancePct:    item.avancePct    ?? '',
      estadoMes:    item.estadoMes    ?? 'Normal',
      observaciones: item.observaciones ?? '',
    } : {
      anio: new Date().getFullYear(),
      mes:  new Date().getMonth() + 1,
      avancePct: '', estadoMes: 'Normal', observaciones: '',
    });
  }, [show, item]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const payload = {
        codProy,
        anio:         parseInt(data.anio),
        mes:          parseInt(data.mes),
        avancePct:    data.avancePct ? parseFloat(data.avancePct) : null,
        estadoMes:    data.estadoMes || null,
        observaciones: data.observaciones || null,
      };
      if (item) await proyectoControlMensualService.editar(item.id, payload);
      else      await proyectoControlMensualService.crear(payload);
      toast.success(item ? 'Control actualizado' : 'Control registrado');
      onHide();
      onSuccess();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{item ? 'Editar' : 'Nuevo'} control mensual</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-3">
            <Col md={4}><Form.Label style={labelStyle}>Año</Form.Label>
              <Form.Control style={inputStyle} type="number" {...register('anio')} disabled={!!item}/>
            </Col>
            <Col md={4}><Form.Label style={labelStyle}>Mes</Form.Label>
              <Form.Select style={inputStyle} {...register('mes')} disabled={!!item}>
                {MESES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </Form.Select>
            </Col>
            <Col md={4}><Form.Label style={labelStyle}>Avance %</Form.Label>
              <Form.Control style={inputStyle} type="number" min={0} max={100} step={5} {...register('avancePct')} placeholder="0"/>
            </Col>
            <Col md={12}><Form.Label style={labelStyle}>Estado del mes</Form.Label>
              <Form.Select style={inputStyle} {...register('estadoMes')}>
                <option value="Normal">🟢 Normal</option>
                <option value="En riesgo">🟡 En riesgo</option>
                <option value="Retrasado">🔴 Retrasado</option>
                <option value="Completado">🔵 Completado</option>
              </Form.Select>
            </Col>
            <Col md={12}><Form.Label style={labelStyle}>Observaciones</Form.Label>
              <Form.Control style={{ ...inputStyle, resize:'none' }} as="textarea" rows={3}
                {...register('observaciones')} placeholder="Notas del mes, avances, bloqueos..."/>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={onHide} />
          <BtnSubmit saving={saving} label={item ? 'Guardar' : 'Registrar'} />
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// ── Componente principal ──────────────────────────────
const DetalleProyecto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detalle, setDetalle]           = useState(null);
  const [controlMensual, setControlMensual] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [activeTab, setActiveTab]       = useState('general');

  const [modalOCProv, setModalOCProv]   = useState({ show: false, item: null });
  const [modalOCCli, setModalOCCli]     = useState({ show: false, item: null });
  const [modalHES, setModalHES]         = useState({ show: false, item: null, idOC: null, tipo: null });
  const [modalCron, setModalCron]       = useState(false);
  const [modalHoras, setModalHoras]     = useState(false);
  const [modalHF, setModalHF]           = useState({ show: false, item: null });
  const [modalControl, setModalControl] = useState({ show: false, item: null });

  const cargar = async () => {
    try {
      setLoading(true);
      const [data, control] = await Promise.all([
        proyectosService.obtener(id),
        proyectoControlMensualService.listarPorProyecto(id).catch(() => []),
      ]);
      setDetalle(data);
      setControlMensual(control ?? []);
    } catch (err) {
      toast.error('Error al cargar proyecto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

  // ── OC Proveedor handlers ──
  const handleSaveOCProv = async (payload) => {
    try {
      setSaving(true);
      if (modalOCProv.item) await proyectoOCProveedorService.editar(modalOCProv.item.id, payload);
      else                  await proyectoOCProveedorService.crear(payload);
      toast.success('OC Proveedor guardada');
      setModalOCProv({ show: false, item: null });
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };
  const handleDeleteOCProv = async (ocId) => {
    try { await proyectoOCProveedorService.eliminar(ocId); toast.success('OC Proveedor eliminada'); await cargar(); }
    catch (err) { toast.error(err.message); }
  };

  // ── OC Cliente handlers ──
  const handleSaveOCCli = async (payload) => {
    try {
      setSaving(true);
      if (modalOCCli.item) await proyectoOCClienteService.editar(modalOCCli.item.id, payload);
      else                 await proyectoOCClienteService.crear(payload);
      toast.success('OC Cliente guardada');
      setModalOCCli({ show: false, item: null });
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };
  const handleDeleteOCCli = async (ocId) => {
    try { await proyectoOCClienteService.eliminar(ocId); toast.success('OC Cliente eliminada'); await cargar(); }
    catch (err) { toast.error(err.message); }
  };

  // ── HES handlers ──
  const handleSaveHES = async (payload) => {
    try {
      setSaving(true);
      const { idOC, tipo, item } = modalHES;
      if (item) {
        if (tipo === 'proveedor') await proyectoOCProveedorService.updateHES(item.id, payload);
        else                      await proyectoOCClienteService.updateHES(item.id, payload);
      } else {
        if (tipo === 'proveedor') await proyectoOCProveedorService.addHES(idOC, payload);
        else                      await proyectoOCClienteService.addHES(idOC, payload);
      }
      toast.success('HES guardado');
      setModalHES({ show: false, item: null, idOC: null, tipo: null });
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };
  const handleDeleteHES = async (hesId, tipo) => {
    try {
      if (tipo === 'proveedor') await proyectoOCProveedorService.deleteHES(hesId);
      else                      await proyectoOCClienteService.deleteHES(hesId);
      toast.success('HES eliminado');
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  // ── Control mensual handlers ──
  const handleDeleteControl = async (controlId) => {
    try {
      await proyectoControlMensualService.eliminar(controlId);
      toast.success('Registro eliminado');
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (!detalle) return (
    <div className="content-wrapper">
      <div className="main-content text-center py-5">
        <p className="text-muted">Proyecto no encontrado.</p>
        <button onClick={() => navigate('/proyectos')}
          style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 14px', borderRadius:7, border:'1.5px solid #bfdbfe', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:500, cursor:'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}
          onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
          Volver
        </button>
      </div>
    </div>
  );

  const { proyecto, cronograma, horas, horasFuncional, ocProveedores, ocClientes } = detalle;

  return (
    <div className="content-wrapper">
      <PageBreadcrumb title={proyecto.codProy} subTitle1="Proyectos" subTitle2={proyecto.codProy} subText={proyecto.nombreRequerimiento} />

      <div className="main-content">

        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button onClick={() => navigate('/proyectos')}
            style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#374151', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#374151'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#374151'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.color='#374151'; e.currentTarget.style.borderColor='#d1d5db'; }}>
            <FaArrowLeft size={11} /> Volver
          </button>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h5 className="mb-0 fw-bold">{proyecto.nombreRequerimiento}</h5>
              <EstadoBadge estado={proyecto.estado} />
              {proyecto.estadoInterno && (
                <Badge bg="light" text="dark" style={{ border: '1px solid #d1d5db', fontSize: 10 }}>{proyecto.estadoInterno}</Badge>
              )}
            </div>
            <div className="d-flex gap-3 mt-1 flex-wrap" style={{ fontSize: 12 }}>
              <span className="text-muted">Analista: <strong>{proyecto.analista ?? '—'}</strong></span>
              <span className="text-muted">Key User: <strong>{proyecto.keyUser ?? '—'}</strong></span>
              <span className="text-muted">Periodo: <strong>{proyecto.periodo ?? '—'}</strong></span>
              <span className="text-muted">Monto: <strong style={{ color: '#3B6D11' }}>{formatMonto(proyecto.montoTotalProyecto)}</strong></span>
            </div>
          </div>
        </div>

        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">

          {/* ── DATOS GENERALES ── */}
          <Tab eventKey="general" title="Datos generales">
            <Row className="g-3">
              <Col md={8}>
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-muted fw-semibold small text-uppercase mb-3">Información del proyecto</p>
                    <Row>
                      <Col md={4}><Campo label="Código" value={proyecto.codProy} mono /></Col>
                      <Col md={4}><Campo label="Tipo desarrollo" value={proyecto.tipoDesarrollo} /></Col>
                      <Col md={4}><Campo label="Distribución" value={proyecto.distribucion} /></Col>
                      <Col md={4}><Campo label="Periodo" value={proyecto.periodo} mono /></Col>
                      <Col md={4}><Campo label="Estado" value={<EstadoBadge estado={proyecto.estado} />} /></Col>
                      <Col md={4}><Campo label="Estado interno" value={proyecto.estadoInterno} /></Col>
                      <Col md={12}><Campo label="Historia" value={proyecto.historia} /></Col>
                      <Col md={12}><Campo label="Resumen del alcance" value={proyecto.resumenAlcance} /></Col>
                    </Row>
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2 d-flex align-items-center justify-content-between">
                    <span className="fw-semibold small">Cronograma</span>
                    <button onClick={() => setModalCron(true)} {...btnBlueSm}>
                      <FaPen size={10} /> Editar
                    </button>
                  </div>
                  <div className="card-body">
                    {[
                      { label: 'F. Requerimiento',     value: cronograma?.fRequerimiento },
                      { label: 'F. Entrega final',     value: cronograma?.fEntregaFinal },
                      { label: 'F. Cotización',        value: cronograma?.fCotizacion },
                      { label: 'F. Autorizado',        value: cronograma?.fAutorizado },
                      { label: 'F. Ini. Construcción', value: cronograma?.fIniConstruccion },
                      { label: 'F. Fin Construcción',  value: cronograma?.fFinConstruccion },
                      { label: 'F. Ini. Val. Usuario', value: cronograma?.fIniValUsu },
                      { label: 'F. Cierre',            value: cronograma?.fCierre },
                    ].map(f => (
                      <div key={f.label} className="d-flex justify-content-between py-1" style={{ borderBottom: '0.5px solid #f0f0f0', fontSize: 12 }}>
                        <span className="text-muted">{f.label}</span>
                        <span className="fw-semibold" style={{ fontFamily:'monospace' }}>{formatFecha(f.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </Tab>

          {/* ── OC PROVEEDOR ── */}
          <Tab eventKey="ocprov" title={`OC Proveedor (${ocProveedores?.length ?? 0})`}>
            <div className="d-flex justify-content-end mb-3">
              <button onClick={() => setModalOCProv({ show: true, item: null })} {...btnBlueSm}>
                <FaPlus size={11} /> Nueva OC Proveedor
              </button>
            </div>
            {!ocProveedores?.length
              ? <p className="text-muted text-center py-4">Sin OC de proveedor registradas.</p>
              : ocProveedores.map(oc => (
                <OCProveedorCard key={oc.id} oc={oc}
                  onEdit={(item) => setModalOCProv({ show: true, item })}
                  onDelete={handleDeleteOCProv}
                  onAddHES={(idOC) => setModalHES({ show: true, item: null, idOC, tipo: 'proveedor' })}
                  onEditHES={(item, idOC) => setModalHES({ show: true, item, idOC, tipo: 'proveedor' })}
                  onDeleteHES={handleDeleteHES}
                />
              ))
            }
          </Tab>

          {/* ── OC CLIENTE ── */}
          <Tab eventKey="occli" title={`OC Cliente (${ocClientes?.length ?? 0})`}>
            <div className="d-flex justify-content-end mb-3">
              <button onClick={() => setModalOCCli({ show: true, item: null })} {...btnGreenSm}>
                <FaPlus size={11} /> Nueva OC Cliente
              </button>
            </div>
            {!ocClientes?.length
              ? <p className="text-muted text-center py-4">Sin OC de cliente registradas.</p>
              : ocClientes.map(oc => (
                <OCClienteCard key={oc.id} oc={oc}
                  onEdit={(item) => setModalOCCli({ show: true, item })}
                  onDelete={handleDeleteOCCli}
                  onAddHES={(idOC) => setModalHES({ show: true, item: null, idOC, tipo: 'cliente' })}
                  onEditHES={(item, idOC) => setModalHES({ show: true, item, idOC, tipo: 'cliente' })}
                  onDeleteHES={handleDeleteHES}
                />
              ))
            }
          </Tab>

          {/* ── HORAS ── */}
          <Tab eventKey="horas" title="Horas">
            <Row className="g-3">
              <Col md={5}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2 d-flex align-items-center justify-content-between">
                    <span className="fw-semibold small">Horas totales</span>
                    <button onClick={() => setModalHoras(true)} {...btnBlueSm}>
                      <FaPen size={10} /> Editar
                    </button>
                  </div>
                  <div className="card-body">
                    {[
                      { label: 'Horas proyecto', value: horas?.horasProyecto },
                      { label: 'Horas TIC',      value: horas?.horasTIC },
                      { label: 'Horas JP',        value: horas?.horasJP },
                      { label: 'Horas Prov',      value: horas?.horasProv },
                    ].map(h => (
                      <div key={h.label} className="d-flex justify-content-between py-2" style={{ borderBottom: '0.5px solid #f0f0f0', fontSize: 13 }}>
                        <span className="text-muted">{h.label}</span>
                        <span className="fw-semibold">{h.value ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
              <Col md={7}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2 d-flex align-items-center justify-content-between">
                    <span className="fw-semibold small">Horas TIC por mes</span>
                    <button onClick={() => setModalHF({ show: true, item: null })} {...btnBlueSm}>
                      <FaPlus size={10} /> Agregar mes
                    </button>
                  </div>
                  <div className="card-body p-0">
                    {!horasFuncional?.length
                      ? <p className="text-muted text-center py-3" style={{ fontSize: 12 }}>Sin registros mensuales.</p>
                      : (
                        <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
                          <thead className="table-light">
                            <tr><th>Año</th><th>Mes</th><th>Horas TIC mes</th><th></th></tr>
                          </thead>
                          <tbody>
                            {horasFuncional.map(h => (
                              <tr key={h.id}>
                                <td style={{ fontFamily:'monospace' }}>{h.anio}</td>
                                <td>{MESES[h.mes]}</td>
                                <td><strong>{h.horasTicMes ?? '—'}</strong></td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <button onClick={() => setModalHF({ show: true, item: h })} title="Editar" {...btn30Edit}><FaPen size={9} /></button>
                                    <button title="Eliminar" {...btn30Del}
                                      onClick={async () => {
                                        try { await proyectoHorasService.deleteHorasFuncional(h.id); toast.success('Registro eliminado'); await cargar(); }
                                        catch (err) { toast.error(err.message); }
                                      }}>
                                      <FaTrash size={9} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )
                    }
                  </div>
                </div>
              </Col>
            </Row>
          </Tab>

          {/* ── CONTROL MENSUAL ── */}
          <Tab eventKey="control" title={`Control mensual (${controlMensual?.length ?? 0})`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                Seguimiento del avance y estado del proyecto mes a mes.
              </p>
              <button onClick={() => setModalControl({ show: true, item: null })} {...btnBlueSm}>
                <FaPlus size={10} /> Nuevo registro
              </button>
            </div>

            {!controlMensual?.length ? (
              <div className="text-center py-5">
                <p className="text-muted mb-1" style={{ fontSize: 13 }}>Sin registros de control mensual.</p>
                <p className="text-muted" style={{ fontSize: 12 }}>Agrega el primer registro para comenzar el seguimiento.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover" style={{ fontSize: 12 }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 60 }}>Año</th>
                      <th style={{ width: 50 }}>Mes</th>
                      <th style={{ width: 140 }}>Avance</th>
                      <th style={{ width: 110 }}>Estado</th>
                      <th>Observaciones</th>
                      <th style={{ width: 70 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {controlMensual
                      .slice()
                      .sort((a, b) => a.anio !== b.anio ? b.anio - a.anio : b.mes - a.mes)
                      .map(c => {
                        const e = estadoMesMap[c.estadoMes] || { bg: '#F1EFE8', color: '#5F5E5A' };
                        const pct = c.avancePct ?? 0;
                        return (
                          <tr key={c.id}>
                            <td style={{ fontFamily:'monospace', fontWeight:600 }}>{c.anio}</td>
                            <td className="fw-semibold">{MESES[c.mes]}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow:'hidden', minWidth: 60 }}>
                                  <div style={{
                                    width: `${pct}%`, height: '100%', borderRadius: 3,
                                    background: pct >= 80 ? '#3B6D11' : pct >= 40 ? '#185FA5' : '#BA7517',
                                    transition: 'width 0.3s',
                                  }} />
                                </div>
                                <span className="fw-semibold" style={{ minWidth: 32, textAlign:'right' }}>{pct}%</span>
                              </div>
                            </td>
                            <td>
                              <Badge style={{ background: e.bg, color: e.color, fontSize: 10 }}>{c.estadoMes ?? '—'}</Badge>
                            </td>
                            <td className="text-muted" style={{ maxWidth: 280 }}>
                              <span title={c.observaciones} style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {c.observaciones ?? '—'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button onClick={() => setModalControl({ show: true, item: c })} title="Editar" {...btn30Edit}><FaPen size={9} /></button>
                                <button onClick={() => handleDeleteControl(c.id)} title="Eliminar" {...btn30Del}><FaTrash size={9} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </Tab>

        </Tabs>
      </div>

      {/* ── Modals ── */}
      <OCProveedorModal
        show={modalOCProv.show} onHide={() => setModalOCProv({ show: false, item: null })}
        onSave={handleSaveOCProv} oc={modalOCProv.item} codProy={id} saving={saving} />

      <OCClienteModal
        show={modalOCCli.show} onHide={() => setModalOCCli({ show: false, item: null })}
        onSave={handleSaveOCCli} oc={modalOCCli.item} codProy={id} saving={saving} />

      <HESModal
        show={modalHES.show} onHide={() => setModalHES({ show: false, item: null, idOC: null, tipo: null })}
        onSave={handleSaveHES} hes={modalHES.item} tipo={modalHES.tipo} saving={saving} />

      <CronogramaModal
        show={modalCron} onHide={() => setModalCron(false)}
        cron={cronograma} proyectoId={id} onSuccess={cargar} />

      <HorasModal
        show={modalHoras} onHide={() => setModalHoras(false)}
        horas={horas} proyectoId={id} onSuccess={cargar} />

      <HorasFuncionalModal
        show={modalHF.show} onHide={() => setModalHF({ show: false, item: null })}
        item={modalHF.item} codProy={id} onSuccess={cargar} />

      <ControlMensualModal
        show={modalControl.show} onHide={() => setModalControl({ show: false, item: null })}
        item={modalControl.item} codProy={id} onSuccess={cargar} />

    </div>
  );
};

export default DetalleProyecto;
