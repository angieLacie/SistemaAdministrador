import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Badge, Form, Spinner, Tab, Tabs, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaPen, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa6';
import { useForm } from 'react-hook-form';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import {
  licenciasTiendaService,
  licenciaTiendaOCProvService,
  licenciaTiendaOCCliService,
} from '@/services/licenciasTienda.service';

const TIPOS_LICENCIA = [
  { value: 'A', label: 'A — Punto de venta', costo: 750, color: '#185FA5', bg: '#E6F1FB' },
  { value: 'B', label: 'B — Est. trabajo',   costo: 500, color: '#3B6D11', bg: '#EAF3DE' },
  { value: 'C', label: 'C — Tipo C BD',      costo: 500, color: '#BA7517', bg: '#FAEEDA' },
];

const Campo = ({ label, value, mono = false }) => (
  <div className="mb-3">
    <p className="text-muted mb-1" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <p className="mb-0 fw-semibold" style={{ fontSize: 13, fontFamily: mono ? 'monospace' : undefined }}>
      {value ?? <span className="text-muted fw-normal">—</span>}
    </p>
  </div>
);

const formatMonto = (m) => m ? `S/ ${Number(m).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—';

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

// Estilos compactos para formularios en modals
const labelStyle = { fontSize: 12, fontWeight: 600, marginBottom: 4 };
const inputStyle = { fontSize: 13, borderRadius: 8, border: '1.5px solid #dde1e7', padding: '7px 10px' };

// Estilos de botones de acción (compartidos entre sub-componentes)
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

// ── OC Proveedor Card ────────────────────────────────
const OCProvCard = ({ oc, onEdit, onDelete, onAddHES, onEditHES, onDeleteHES }) => {
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
            <p className="text-muted fw-semibold mb-0" style={{ fontSize: 11, textTransform: 'uppercase' }}>HES ({oc.hes?.length ?? 0})</p>
            <button onClick={() => onAddHES(oc.id)} {...btnBlueSm}>
              <FaPlus size={9} /> HES
            </button>
          </div>
          {oc.hes?.length > 0 && (
            <table className="table table-sm" style={{ fontSize: 12 }}>
              <thead className="table-light"><tr><th>Nro HES</th><th>% HES</th><th></th></tr></thead>
              <tbody>
                {oc.hes.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontFamily:'monospace' }}>{h.nroHES ?? '—'}</td>
                    <td>{h.pctHES ? `${h.pctHES}%` : '—'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button onClick={() => onEditHES(h, oc.id, 'prov')} title="Editar" {...btn30Edit}><FaPen size={9} /></button>
                        <button onClick={() => onDeleteHES(h.id, 'prov')} title="Eliminar" {...btn30Del}><FaTrash size={9} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// ── OC Cliente Card ──────────────────────────────────
const OCCliCard = ({ oc, onEdit, onDelete, onAddHES, onEditHES, onDeleteHES }) => {
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
            <p className="text-muted fw-semibold mb-0" style={{ fontSize: 11, textTransform: 'uppercase' }}>HES ({oc.hes?.length ?? 0})</p>
            <button onClick={() => onAddHES(oc.id)} {...btnGreenSm}>
              <FaPlus size={9} /> HES
            </button>
          </div>
          {oc.hes?.length > 0 && (
            <table className="table table-sm" style={{ fontSize: 12 }}>
              <thead className="table-light"><tr><th>Nro HES</th><th>Factura SAP</th><th>Monto PEN</th><th>Monto USD</th><th></th></tr></thead>
              <tbody>
                {oc.hes.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontFamily:'monospace' }}>{h.nroHES ?? '—'}</td>
                    <td style={{ fontFamily:'monospace' }}>{h.nroFacturaSAP ?? '—'}</td>
                    <td>{formatMonto(h.montoFactPEN)}</td>
                    <td>{h.montoFactUSD ? `$ ${Number(h.montoFactUSD).toLocaleString()}` : '—'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button onClick={() => onEditHES(h, oc.id, 'cli')} title="Editar" {...btn30Edit}><FaPen size={9} /></button>
                        <button onClick={() => onDeleteHES(h.id, 'cli')} title="Eliminar" {...btn30Del}><FaTrash size={9} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// ── Modals genéricos ─────────────────────────────────
const OCProvModal = ({ show, onHide, onSave, oc, idTienda, saving }) => {
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    reset(oc ? { proveedor: oc.proveedor ?? '', importeProvPEN: oc.importeProvPEN ?? '', importeProvUSD: oc.importeProvUSD ?? '',
      cargadoOrdenCO: oc.cargadoOrdenCO ?? '', descripcionOrdenCO: oc.descripcionOrdenCO ?? '',
      solpedCSC: oc.solpedCSC ?? '', oscsc: oc.oscsc ?? '', estadoProv: oc.estadoProv ?? '',
      estadoCSC: oc.estadoCSC ?? '', observacion: oc.observacion ?? '' }
    : { proveedor:'', importeProvPEN:'', importeProvUSD:'', cargadoOrdenCO:'', descripcionOrdenCO:'',
        solpedCSC:'', oscsc:'', estadoProv:'', estadoCSC:'', observacion:'' });
  }, [show, oc]);
  const onSubmit = (data) => onSave({ ...data, idTienda,
    importeProvPEN: data.importeProvPEN ? parseFloat(data.importeProvPEN) : null,
    importeProvUSD: data.importeProvUSD ? parseFloat(data.importeProvUSD) : null });
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{oc ? 'Editar OC Proveedor' : 'Nueva OC Proveedor'}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-2">
            <Col md={6}><Form.Label style={labelStyle}>Proveedor</Form.Label>
              <Form.Select style={inputStyle} {...register('proveedor')}>
                <option value="">Seleccionar...</option>
                <option value="RMS">RMS</option>
              </Form.Select>
            </Col>
            <Col md={3}><Form.Label style={labelStyle}>Importe PEN</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('importeProvPEN')} /></Col>
            <Col md={3}><Form.Label style={labelStyle}>Importe USD</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('importeProvUSD')} /></Col>
            <Col md={4}><Form.Label style={labelStyle}>Cargado Orden CO</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('cargadoOrdenCO')} /></Col>
            <Col md={8}><Form.Label style={labelStyle}>Descripción Orden CO</Form.Label><Form.Control style={inputStyle} {...register('descripcionOrdenCO')} /></Col>
            <Col md={4}><Form.Label style={labelStyle}>Solped CSC</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('solpedCSC')} /></Col>
            <Col md={4}><Form.Label style={labelStyle}>OS CSC</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('oscsc')} /></Col>
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
            <Col md={12}><Form.Label style={labelStyle}>Observación</Form.Label><Form.Control style={{ ...inputStyle, resize:'none' }} as="textarea" rows={2} {...register('observacion')} /></Col>
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

const OCCliModal = ({ show, onHide, onSave, oc, idTienda, saving }) => {
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    reset(oc ? { codSAPCliente: oc.codSAPCliente ?? '', empRefacturable: oc.empRefacturable ?? '',
      seRefactura: oc.seRefactura ?? false, importeRefPEN: oc.importeRefPEN ?? '',
      importeRefUSD: oc.importeRefUSD ?? '', osClienteCSC: oc.osClienteCSC ?? '',
      estadoCSC: oc.estadoCSC ?? '', observacion: oc.observacion ?? '' }
    : { codSAPCliente:'', empRefacturable:'', seRefactura: false, importeRefPEN:'', importeRefUSD:'', osClienteCSC:'', estadoCSC:'', observacion:'' });
  }, [show, oc]);
  const onSubmit = (data) => onSave({ ...data, idTienda,
    importeRefPEN: data.importeRefPEN ? parseFloat(data.importeRefPEN) : null,
    importeRefUSD: data.importeRefUSD ? parseFloat(data.importeRefUSD) : null,
    seRefactura: !!data.seRefactura });
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{oc ? 'Editar OC Cliente' : 'Nueva OC Cliente'}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-2">
            <Col md={8}><Form.Label style={labelStyle}>Empresa Refacturable</Form.Label>
              <Form.Select style={inputStyle} {...register('empRefacturable')}>
                <option value="">Seleccionar...</option>
                <option value="R010 - El S.A.">R010 - El S.A.</option>
                <option value="R020 - Fashion">R020 - Fashion</option>
                <option value="R030 - El Oriente">R030 - El Oriente</option>
                <option value="R040 - Lukers OR">R040 - Lukers OR</option>
                <option value="R050 - Lukers">R050 - Lukers</option>
              </Form.Select>
            </Col>
            <Col md={4}><Form.Label style={labelStyle}>OS Cliente CSC</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('osClienteCSC')} /></Col>
            <Col md={4}><Form.Label style={labelStyle}>Importe Ref PEN</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('importeRefPEN')} /></Col>
            <Col md={4}><Form.Label style={labelStyle}>Importe Ref USD</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('importeRefUSD')} /></Col>
            <Col md={4}><Form.Label style={labelStyle}>Estado CSC</Form.Label>
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
            <Col md={12}><Form.Check type="switch" label="Se refactura" {...register('seRefactura')} /></Col>
            <Col md={12}><Form.Label style={labelStyle}>Observación</Form.Label><Form.Control style={{ ...inputStyle, resize:'none' }} as="textarea" rows={2} {...register('observacion')} /></Col>
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

const HESModal = ({ show, onHide, onSave, hes, tipo, saving }) => {
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    reset(hes ? { nroHES: hes.nroHES ?? '', pctHES: hes.pctHES ?? '',
      nroFacturaSAP: hes.nroFacturaSAP ?? '', montoFactPEN: hes.montoFactPEN ?? '', montoFactUSD: hes.montoFactUSD ?? '' }
    : { nroHES:'', pctHES:'', nroFacturaSAP:'', montoFactPEN:'', montoFactUSD:'' });
  }, [show, hes]);
  const onSubmit = (data) => onSave({
    nroHES: data.nroHES || null,
    pctHES: data.pctHES ? parseFloat(data.pctHES) : null,
    ...(tipo === 'cli' && {
      nroFacturaSAP: data.nroFacturaSAP || null,
      montoFactPEN: data.montoFactPEN ? parseFloat(data.montoFactPEN) : null,
      montoFactUSD: data.montoFactUSD ? parseFloat(data.montoFactUSD) : null,
    }),
  });
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{hes ? 'Editar HES' : 'Nuevo HES'} — {tipo === 'prov' ? 'Proveedor' : 'Cliente'}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="px-4 py-3">
          <Row className="g-2">
            <Col md={6}><Form.Label style={labelStyle}>Nro HES</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('nroHES')} /></Col>
            {tipo === 'prov' && <Col md={6}><Form.Label style={labelStyle}>% HES</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('pctHES')} /></Col>}
            {tipo === 'cli' && <>
              <Col md={6}><Form.Label style={labelStyle}>Nro Factura SAP</Form.Label><Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} {...register('nroFacturaSAP')} /></Col>
              <Col md={6}><Form.Label style={labelStyle}>Monto Fact PEN</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('montoFactPEN')} /></Col>
              <Col md={6}><Form.Label style={labelStyle}>Monto Fact USD</Form.Label><Form.Control style={inputStyle} type="number" step="0.01" {...register('montoFactUSD')} /></Col>
            </>}
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

// ── Componente principal ──────────────────────────────
const DetalleLicenciaTienda = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [detalle, setDetalle]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [modalOCProv, setModalOCProv] = useState({ show: false, item: null });
  const [modalOCCli, setModalOCCli]   = useState({ show: false, item: null });
  const [modalHES, setModalHES]       = useState({ show: false, item: null, idOC: null, tipo: null });

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await licenciasTiendaService.obtener(id);
      setDetalle(data);
    } catch (err) {
      toast.error('Error al cargar detalle: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

  const handleSaveOCProv = async (payload) => {
    try {
      setSaving(true);
      if (modalOCProv.item) await licenciaTiendaOCProvService.editar(modalOCProv.item.id, payload);
      else await licenciaTiendaOCProvService.crear(payload);
      toast.success('OC Proveedor guardada');
      setModalOCProv({ show: false, item: null });
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteOCProv = async (ocId) => {
    try { await licenciaTiendaOCProvService.eliminar(ocId); toast.success('OC eliminada'); await cargar(); }
    catch (err) { toast.error(err.message); }
  };

  const handleSaveOCCli = async (payload) => {
    try {
      setSaving(true);
      if (modalOCCli.item) await licenciaTiendaOCCliService.editar(modalOCCli.item.id, payload);
      else await licenciaTiendaOCCliService.crear(payload);
      toast.success('OC Cliente guardada');
      setModalOCCli({ show: false, item: null });
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteOCCli = async (ocId) => {
    try { await licenciaTiendaOCCliService.eliminar(ocId); toast.success('OC eliminada'); await cargar(); }
    catch (err) { toast.error(err.message); }
  };

  const handleSaveHES = async (payload) => {
    try {
      setSaving(true);
      const { idOC, tipo, item } = modalHES;
      if (item) {
        if (tipo === 'prov') await licenciaTiendaOCProvService.updateHES(item.id, payload);
        else await licenciaTiendaOCCliService.updateHES(item.id, payload);
      } else {
        if (tipo === 'prov') await licenciaTiendaOCProvService.addHES(idOC, payload);
        else await licenciaTiendaOCCliService.addHES(idOC, payload);
      }
      toast.success('HES guardado');
      setModalHES({ show: false, item: null, idOC: null, tipo: null });
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteHES = async (hesId, tipo) => {
    try {
      if (tipo === 'prov') await licenciaTiendaOCProvService.deleteHES(hesId);
      else await licenciaTiendaOCCliService.deleteHES(hesId);
      toast.success('HES eliminado');
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
        <p className="text-muted">Licencia no encontrada.</p>
        <button onClick={() => navigate('/licencias-tienda')}
          style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 14px', borderRadius:7, border:'1.5px solid #bfdbfe', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:500, cursor:'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}
          onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
          Volver
        </button>
      </div>
    </div>
  );

  const { tienda, cajas, ocProveedores, ocClientes } = detalle;

  const costoTotal = cajas?.reduce((acc, c) => {
    const tipo = TIPOS_LICENCIA.find(t => t.value === c.tipoLicencia);
    return acc + (tipo?.costo ?? 0);
  }, 0) ?? 0;

  return (
    <div className="content-wrapper">
      <PageBreadcrumb title={tienda.codigo} subTitle1="Licencias Tiendas" subTitle2={tienda.codigo} subText={tienda.tienda} />

      <div className="main-content">

        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button onClick={() => navigate('/licencias-tienda')}
            style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#374151', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#374151'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#374151'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.color='#374151'; e.currentTarget.style.borderColor='#d1d5db'; }}>
            <FaArrowLeft size={11} /> Volver
          </button>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h5 className="mb-0 fw-bold">{tienda.tienda}</h5>
              <Badge bg="light" text="dark" style={{ border: '1px solid #d1d5db', fontSize: 11 }}>{tienda.codigo}</Badge>
              {tienda.estadoTienda && (
                <Badge bg={tienda.estadoTienda === 'Anulado' ? 'danger' : 'success'} style={{ fontSize: 10 }}>
                  {tienda.estadoTienda}
                </Badge>
              )}
            </div>
            <div className="d-flex gap-3 mt-1" style={{ fontSize: 12 }}>
              <span className="text-muted">Empresa: <strong>{tienda.empresa ?? '—'}</strong></span>
              <span className="text-muted">Periodo: <strong>{tienda.periodo ?? '—'}</strong></span>
              <span className="text-muted">Cajas: <strong>{cajas?.length ?? 0}</strong></span>
              <span className="text-muted">Costo total: <strong style={{ color: '#3B6D11' }}>S/ {costoTotal.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">

          <Tab eventKey="general" title="Datos generales">
            <Row className="g-3">
              <Col md={4}>
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-muted fw-semibold small text-uppercase mb-3">Información</p>
                    <Campo label="Código" value={tienda.codigo} mono />
                    <Campo label="Tienda" value={tienda.tienda} />
                    <Campo label="Empresa" value={tienda.empresa} />
                    <Campo label="Periodo" value={tienda.periodo} mono />
                    <Campo label="Estado" value={tienda.estadoTienda} />
                  </div>
                </div>
              </Col>
              <Col md={8}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2" style={{ background: '#f9fafb' }}>
                    <span className="fw-semibold small">Cajas ({cajas?.length ?? 0}) — Total: S/ {costoTotal.toLocaleString()}</span>
                  </div>
                  <div className="card-body p-0">
                    {cajas?.length === 0 ? (
                      <p className="text-muted text-center py-3" style={{ fontSize: 12 }}>Sin cajas registradas.</p>
                    ) : (
                      <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
                        <thead className="table-light">
                          <tr><th>N° Caja</th><th>Tipo licencia</th><th>Costo</th><th>Estado</th></tr>
                        </thead>
                        <tbody>
                          {cajas?.map(c => {
                            const tipo = TIPOS_LICENCIA.find(t => t.value === c.tipoLicencia);
                            return (
                              <tr key={c.id}>
                                <td className="fw-semibold" style={{ fontFamily:'monospace' }}>{c.nroCaja}</td>
                                <td>
                                  <Badge style={{ background: tipo?.bg, color: tipo?.color, fontSize: 10 }}>
                                    {tipo?.label ?? c.tipoLicencia}
                                  </Badge>
                                </td>
                                <td className="fw-semibold" style={{ color: '#3B6D11' }}>S/ {tipo?.costo?.toLocaleString() ?? '—'}</td>
                                <td><Badge bg={c.estadoCaja === 'Activo' ? 'success' : 'secondary'} style={{ fontSize: 10 }}>{c.estadoCaja ?? '—'}</Badge></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="ocprov" title={`OC Proveedor (${ocProveedores?.length ?? 0})`}>
            <div className="d-flex justify-content-end mb-3">
              <button onClick={() => setModalOCProv({ show: true, item: null })} {...btnBlueSm}>
                <FaPlus size={11} /> Nueva OC Proveedor
              </button>
            </div>
            {ocProveedores?.length === 0 ? (
              <p className="text-muted text-center py-4">Sin OC de proveedor registradas.</p>
            ) : ocProveedores?.map(oc => (
              <OCProvCard key={oc.id} oc={oc}
                onEdit={(item) => setModalOCProv({ show: true, item })}
                onDelete={handleDeleteOCProv}
                onAddHES={(idOC) => setModalHES({ show: true, item: null, idOC, tipo: 'prov' })}
                onEditHES={(item, idOC) => setModalHES({ show: true, item, idOC, tipo: 'prov' })}
                onDeleteHES={handleDeleteHES}
              />
            ))}
          </Tab>

          <Tab eventKey="occli" title={`OC Cliente (${ocClientes?.length ?? 0})`}>
            <div className="d-flex justify-content-end mb-3">
              <button onClick={() => setModalOCCli({ show: true, item: null })} {...btnGreenSm}>
                <FaPlus size={11} /> Nueva OC Cliente
              </button>
            </div>
            {ocClientes?.length === 0 ? (
              <p className="text-muted text-center py-4">Sin OC de cliente registradas.</p>
            ) : ocClientes?.map(oc => (
              <OCCliCard key={oc.id} oc={oc}
                onEdit={(item) => setModalOCCli({ show: true, item })}
                onDelete={handleDeleteOCCli}
                onAddHES={(idOC) => setModalHES({ show: true, item: null, idOC, tipo: 'cli' })}
                onEditHES={(item, idOC) => setModalHES({ show: true, item, idOC, tipo: 'cli' })}
                onDeleteHES={handleDeleteHES}
              />
            ))}
          </Tab>

        </Tabs>
      </div>

      <OCProvModal show={modalOCProv.show} onHide={() => setModalOCProv({ show: false, item: null })}
        onSave={handleSaveOCProv} oc={modalOCProv.item} idTienda={parseInt(id)} saving={saving} />

      <OCCliModal show={modalOCCli.show} onHide={() => setModalOCCli({ show: false, item: null })}
        onSave={handleSaveOCCli} oc={modalOCCli.item} idTienda={parseInt(id)} saving={saving} />

      <HESModal show={modalHES.show} onHide={() => setModalHES({ show: false, item: null, idOC: null, tipo: null })}
        onSave={handleSaveHES} hes={modalHES.item} tipo={modalHES.tipo} saving={saving} />
    </div>
  );
};

export default DetalleLicenciaTienda;
