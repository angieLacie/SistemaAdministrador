import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Badge, Form, Spinner, Tab, Tabs, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaPen, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa6';
import { useForm } from 'react-hook-form';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import {
  proyectosService,
  proyectoOCProveedorService,
  proyectoOCClienteService,
  proyectoHorasService,
} from '@/services/proyectos.service';

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
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-PE');
};
const formatMonto = (m) => m ? `S/ ${Number(m).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—';

// ── OC Proveedor Section ─────────────────────────────
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
          <Badge bg="light" text="dark" style={{ fontSize: 10, border: '1px solid #bfdbfe' }}>
            {oc.oscsc ?? 'Sin OS'}
          </Badge>
        </div>
        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          <Button size="sm" variant="outline-secondary" onClick={() => onEdit(oc)}>
            <FaPen size={10} />
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => onDelete(oc.id)}>
            <FaTrash size={10} />
          </Button>
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

          {/* HES */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <p className="text-muted fw-semibold mb-0" style={{ fontSize: 11, textTransform: 'uppercase' }}>
              HES Proveedor ({oc.hes?.length ?? 0})
            </p>
            <Button size="sm" variant="outline-primary" style={{ fontSize: 11 }} onClick={() => onAddHES(oc.id)}>
              <FaPlus size={9} className="me-1" /> Agregar HES
            </Button>
          </div>
          {oc.hes?.length > 0 ? (
            <table className="table table-sm" style={{ fontSize: 12 }}>
              <thead className="table-light">
                <tr>
                  <th>Nro HES</th>
                  <th>% HES</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {oc.hes.map(h => (
                  <tr key={h.id}>
                    <td className="font-monospace">{h.nroHES ?? '—'}</td>
                    <td>{h.pctHES ? `${h.pctHES}%` : '—'}</td>
                    <td><Badge bg={h.estado === 'A' ? 'success' : 'secondary'} style={{ fontSize: 9 }}>{h.estado === 'A' ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-secondary" onClick={() => onEditHES(h, oc.id, 'proveedor')}>
                          <FaPen size={9} />
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => onDeleteHES(h.id, 'proveedor')}>
                          <FaTrash size={9} />
                        </Button>
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

// ── OC Cliente Section ─────────────────────────────
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
          <Badge bg="light" text="dark" style={{ fontSize: 10, border: '1px solid #C0DD97' }}>
            {oc.codSAPCliente ?? 'Sin SAP'}
          </Badge>
          {oc.seRefactura && <Badge bg="success" style={{ fontSize: 9 }}>Refacturable</Badge>}
        </div>
        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          <Button size="sm" variant="outline-secondary" onClick={() => onEdit(oc)}>
            <FaPen size={10} />
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => onDelete(oc.id)}>
            <FaTrash size={10} />
          </Button>
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

          {/* HES Cliente */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <p className="text-muted fw-semibold mb-0" style={{ fontSize: 11, textTransform: 'uppercase' }}>
              HES Cliente ({oc.hes?.length ?? 0})
            </p>
            <Button size="sm" variant="outline-success" style={{ fontSize: 11 }} onClick={() => onAddHES(oc.id)}>
              <FaPlus size={9} className="me-1" /> Agregar HES
            </Button>
          </div>
          {oc.hes?.length > 0 ? (
            <table className="table table-sm" style={{ fontSize: 12 }}>
              <thead className="table-light">
                <tr>
                  <th>Nro HES</th>
                  <th>Nro Factura SAP</th>
                  <th>Monto PEN</th>
                  <th>Monto USD</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {oc.hes.map(h => (
                  <tr key={h.id}>
                    <td className="font-monospace">{h.nroHES ?? '—'}</td>
                    <td className="font-monospace">{h.nroFacturaSAP ?? '—'}</td>
                    <td>{formatMonto(h.montoFactPEN)}</td>
                    <td>{h.montoFactUSD ? `$ ${Number(h.montoFactUSD).toLocaleString()}` : '—'}</td>
                    <td><Badge bg={h.estado === 'A' ? 'success' : 'secondary'} style={{ fontSize: 9 }}>{h.estado === 'A' ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-secondary" onClick={() => onEditHES(h, oc.id, 'cliente')}>
                          <FaPen size={9} />
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => onDeleteHES(h.id, 'cliente')}>
                          <FaTrash size={9} />
                        </Button>
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

// ── Modal genérico OC ─────────────────────────────
const OCProveedorModal = ({ show, onHide, onSave, oc, codProy, saving }) => {
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    reset(oc ? {
      proveedor: oc.proveedor ?? '', importeProvPEN: oc.importeProvPEN ?? '',
      importeProvUSD: oc.importeProvUSD ?? '', cargadoOrdenCO: oc.cargadoOrdenCO ?? '',
      descripcionOrdenCO: oc.descripcionOrdenCO ?? '', solpedCSC: oc.solpedCSC ?? '',
      oscsc: oc.oscsc ?? '', estadoProv: oc.estadoProv ?? '', estadoCSC: oc.estadoCSC ?? '',
      observacion: oc.observacion ?? '',
    } : { proveedor:'', importeProvPEN:'', importeProvUSD:'', cargadoOrdenCO:'',
      descripcionOrdenCO:'', solpedCSC:'', oscsc:'', estadoProv:'', estadoCSC:'', observacion:'' });
  }, [show, oc]);

  const onSubmit = (data) => onSave({ ...data, codProy,
    importeProvPEN: data.importeProvPEN ? parseFloat(data.importeProvPEN) : null,
    importeProvUSD: data.importeProvUSD ? parseFloat(data.importeProvUSD) : null,
  });

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton><ModalTitle>{oc ? 'Editar OC Proveedor' : 'Nueva OC Proveedor'}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <Row className="g-2">
            <Col md={6}><Form.Label className="small">Proveedor</Form.Label><Form.Control {...register('proveedor')} placeholder="Nombre del proveedor"/></Col>
            <Col md={3}><Form.Label className="small">Importe PEN</Form.Label><Form.Control type="number" step="0.01" {...register('importeProvPEN')} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label className="small">Importe USD</Form.Label><Form.Control type="number" step="0.01" {...register('importeProvUSD')} placeholder="0.00"/></Col>
            <Col md={4}><Form.Label className="small">Cargado Orden CO</Form.Label><Form.Control {...register('cargadoOrdenCO')} className="font-monospace"/></Col>
            <Col md={8}><Form.Label className="small">Descripción Orden CO</Form.Label><Form.Control {...register('descripcionOrdenCO')}/></Col>
            <Col md={4}><Form.Label className="small">Solped CSC</Form.Label><Form.Control {...register('solpedCSC')} className="font-monospace"/></Col>
            <Col md={4}><Form.Label className="small">OS CSC</Form.Label><Form.Control {...register('oscsc')} className="font-monospace"/></Col>
            <Col md={4}>
            <Form.Label className="small">Estado Prov</Form.Label> 
            <Form.Select {...register('estadoProv')}>
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
             <Col md={12}><Form.Label className="small">Observación</Form.Label><Form.Control as="textarea" rows={2} {...register('observacion')}/></Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

const OCClienteModal = ({ show, onHide, onSave, oc, codProy, saving }) => {
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    reset(oc ? {
      codSAPCliente: oc.codSAPCliente ?? '', empRefacturable: oc.empRefacturable ?? '',
      seRefactura: oc.seRefactura ?? false, importeRefPEN: oc.importeRefPEN ?? '',
      importeRefUSD: oc.importeRefUSD ?? '', osClienteCSC: oc.osClienteCSC ?? '',
      estadoCSC: oc.estadoCSC ?? '', observacion: oc.observacion ?? '',
    } : { codSAPCliente:'', empRefacturable:'', seRefactura: false,
      importeRefPEN:'', importeRefUSD:'', osClienteCSC:'', estadoCSC:'', observacion:'' });
  }, [show, oc]);

  const onSubmit = (data) => onSave({ ...data, codProy,
    importeRefPEN: data.importeRefPEN ? parseFloat(data.importeRefPEN) : null,
    importeRefUSD: data.importeRefUSD ? parseFloat(data.importeRefUSD) : null,
    seRefactura: !!data.seRefactura,
  });

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton><ModalTitle>{oc ? 'Editar OC Cliente' : 'Nueva OC Cliente'}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <Row className="g-2">
            <Col md={6}><Form.Label className="small">Cód SAP Cliente</Form.Label><Form.Control {...register('codSAPCliente')} className="font-monospace"/></Col>
            <Col md={6}><Form.Label className="small">Empresa Refacturable</Form.Label><Form.Control {...register('empRefacturable')}/></Col>
            <Col md={3}><Form.Label className="small">Importe Ref PEN</Form.Label><Form.Control type="number" step="0.01" {...register('importeRefPEN')} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label className="small">Importe Ref USD</Form.Label><Form.Control type="number" step="0.01" {...register('importeRefUSD')} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label className="small">OS Cliente CSC</Form.Label><Form.Control {...register('osClienteCSC')} className="font-monospace"/></Col>
            <Col md={3}>
            <Form.Label className="small">Estado CSC</Form.Label>
            <Form.Select {...register('estadoCSC')}>
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
            <Col md={12}><Form.Label className="small">Observación</Form.Label><Form.Control as="textarea" rows={2} {...register('observacion')}/></Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

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
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton><ModalTitle>{hes ? 'Editar HES' : 'Nuevo HES'} — {tipo === 'proveedor' ? 'Proveedor' : 'Cliente'}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <Row className="g-2">
            <Col md={6}><Form.Label className="small">Nro HES</Form.Label><Form.Control {...register('nroHES')} className="font-monospace" placeholder="Ej: HES-001"/></Col>
            {tipo === 'proveedor' && (
              <Col md={6}><Form.Label className="small">% HES</Form.Label><Form.Control type="number" step="0.01" {...register('pctHES')} placeholder="0.00"/></Col>
            )}
            {tipo === 'cliente' && (
              <>
                <Col md={6}><Form.Label className="small">Nro Factura SAP</Form.Label><Form.Control {...register('nroFacturaSAP')} className="font-monospace"/></Col>
                <Col md={6}><Form.Label className="small">Monto Fact PEN</Form.Label><Form.Control type="number" step="0.01" {...register('montoFactPEN')} placeholder="0.00"/></Col>
                <Col md={6}><Form.Label className="small">Monto Fact USD</Form.Label><Form.Control type="number" step="0.01" {...register('montoFactUSD')} placeholder="0.00"/></Col>
              </>
            )}
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// ── Componente principal ──────────────────────────
const DetalleProyecto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detalle, setDetalle]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Modals
  const [modalOCProv, setModalOCProv]     = useState({ show: false, item: null });
  const [modalOCCli, setModalOCCli]       = useState({ show: false, item: null });
  const [modalHES, setModalHES]           = useState({ show: false, item: null, idOC: null, tipo: null });
  const [modalCronograma, setModalCronograma] = useState(false);
  const [modalHoras, setModalHoras]       = useState(false);
  const [modalHorasFuncional, setModalHorasFuncional] = useState({ show: false, item: null });

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await proyectosService.obtener(id);
      setDetalle(data);
    } catch (err) {
      toast.error('Error al cargar proyecto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

  // ── OC Proveedor ──
  const handleSaveOCProv = async (payload) => {
    try {
      setSaving(true);
      if (modalOCProv.item) await proyectoOCProveedorService.editar(modalOCProv.item.id, payload);
      else await proyectoOCProveedorService.crear(payload);
      toast.success('OC Proveedor guardada');
      setModalOCProv({ show: false, item: null });
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteOCProv = async (ocId) => {
    try {
      await proyectoOCProveedorService.eliminar(ocId);
      toast.success('OC Proveedor eliminada');
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  // ── OC Cliente ──
  const handleSaveOCCli = async (payload) => {
    try {
      setSaving(true);
      if (modalOCCli.item) await proyectoOCClienteService.editar(modalOCCli.item.id, payload);
      else await proyectoOCClienteService.crear(payload);
      toast.success('OC Cliente guardada');
      setModalOCCli({ show: false, item: null });
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteOCCli = async (ocId) => {
    try {
      await proyectoOCClienteService.eliminar(ocId);
      toast.success('OC Cliente eliminada');
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  // ── HES ──
  const handleSaveHES = async (payload) => {
    try {
      setSaving(true);
      const { idOC, tipo, item } = modalHES;
      if (item) {
        if (tipo === 'proveedor') await proyectoOCProveedorService.updateHES(item.id, payload);
        else await proyectoOCClienteService.updateHES(item.id, payload);
      } else {
        if (tipo === 'proveedor') await proyectoOCProveedorService.addHES(idOC, payload);
        else await proyectoOCClienteService.addHES(idOC, payload);
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
      else await proyectoOCClienteService.deleteHES(hesId);
      toast.success('HES eliminado');
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  // ── Cronograma ──
  const CronogramaModal = () => {
    const { register, handleSubmit, reset } = useForm();
    const cron = detalle?.cronograma;
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
    }, [modalCronograma]);

const onSubmit = async (data) => {
  try {
    setSaving(true);
    const payload = {
      fechaEntrega:     data.fechaEntrega     || null,
      fRequerimiento:   data.fRequerimiento   || null,
      fEntregaFinal:    data.fEntregaFinal    || null,
      fCotizacion:      data.fCotizacion      || null,
      fAutorizado:      data.fAutorizado      || null,
      fIniConstruccion: data.fIniConstruccion || null,
      fFinConstruccion: data.fFinConstruccion || null,
      fIniValUsu:       data.fIniValUsu       || null,
      fCierre:          data.fCierre          || null,
      usuarioModificacion: 'ADMIN',
    };
    await proyectosService.updateCronograma(id, payload);
    toast.success('Cronograma actualizado');
    setModalCronograma(false);
    await cargar();
  } catch (err) { toast.error(err.message); }
  finally { setSaving(false); }
};
    return (
      <Modal show={modalCronograma} onHide={() => setModalCronograma(false)} centered size="lg">
        <ModalHeader closeButton><ModalTitle>Cronograma — {id}</ModalTitle></ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row className="g-2">
              {[
                { name: 'fechaEntrega', label: 'Fecha entrega' },
                { name: 'fRequerimiento', label: 'F. Requerimiento' },
                { name: 'fEntregaFinal', label: 'F. Entrega final' },
                { name: 'fCotizacion', label: 'F. Cotización' },
                { name: 'fAutorizado', label: 'F. Autorizado' },
                { name: 'fIniConstruccion', label: 'F. Ini. Construcción' },
                { name: 'fFinConstruccion', label: 'F. Fin Construcción' },
                { name: 'fIniValUsu', label: 'F. Ini. Val. Usuario' },
                { name: 'fCierre', label: 'F. Cierre' },
              ].map(f => (
                <Col key={f.name} md={4}>
                  <Form.Label className="small">{f.label}</Form.Label>
                  <Form.Control type="date" {...register(f.name)} />
                </Col>
              ))}
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline-secondary" onClick={() => setModalCronograma(false)} disabled={saving}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cronograma'}</Button>
          </ModalFooter>
        </Form>
      </Modal>
    );
  };

  // ── Horas ──
  const HorasModal = () => {
    const { register, handleSubmit, reset } = useForm();
    const h = detalle?.horas;
    useEffect(() => {
      reset({ horasProyecto: h?.horasProyecto ?? '', horasTIC: h?.horasTIC ?? '',
        horasJP: h?.horasJP ?? '', horasProv: h?.horasProv ?? '' });
    }, [modalHoras]);

    const onSubmit = async (data) => {
      try {
        setSaving(true);
        await proyectoHorasService.updateHoras(id, {
          horasProyecto: data.horasProyecto ? parseFloat(data.horasProyecto) : null,
          horasTIC:      data.horasTIC      ? parseFloat(data.horasTIC)      : null,
          horasJP:       data.horasJP       ? parseFloat(data.horasJP)       : null,
          horasProv:     data.horasProv     ? parseFloat(data.horasProv)     : null,
        });
        toast.success('Horas actualizadas');
        setModalHoras(false);
        await cargar();
      } catch (err) { toast.error(err.message); }
      finally { setSaving(false); }
    };

    return (
      <Modal show={modalHoras} onHide={() => setModalHoras(false)}  centered size="lg">
        <ModalHeader closeButton><ModalTitle>Horas del proyecto</ModalTitle></ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row className="g-2">
              <Col md={6}><Form.Label className="small">Horas proyecto</Form.Label><Form.Control type="number" step="0.5" {...register('horasProyecto')} placeholder="0"/></Col>
              <Col md={6}><Form.Label className="small">Horas TIC</Form.Label><Form.Control type="number" step="0.5" {...register('horasTIC')} placeholder="0"/></Col>
              <Col md={6}><Form.Label className="small">Horas JP</Form.Label><Form.Control type="number" step="0.5" {...register('horasJP')} placeholder="0"/></Col>
              <Col md={6}><Form.Label className="small">Horas Prov</Form.Label><Form.Control type="number" step="0.5" {...register('horasProv')} placeholder="0"/></Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline-secondary" onClick={() => setModalHoras(false)} disabled={saving}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </ModalFooter>
        </Form>
      </Modal>
    );
  };

  const HorasFuncionalModal = () => {
    const { register, handleSubmit, reset } = useForm();
    const item = modalHorasFuncional.item;
    useEffect(() => {
      reset(item ? { anio: item.anio, mes: item.mes, horasTicMes: item.horasTicMes ?? '' }
        : { anio: new Date().getFullYear(), mes: new Date().getMonth() + 1, horasTicMes: '' });
    }, [modalHorasFuncional.show]);

    const onSubmit = async (data) => {
      try {
        setSaving(true);
        const payload = { codProy: id, anio: parseInt(data.anio), mes: parseInt(data.mes), horasTicMes: parseFloat(data.horasTicMes) };
        if (item) await proyectoHorasService.updateHorasFuncional(item.id, payload);
        else await proyectoHorasService.addHorasFuncional(payload);
        toast.success('Horas funcional guardadas');
        setModalHorasFuncional({ show: false, item: null });
        await cargar();
      } catch (err) { toast.error(err.message); }
      finally { setSaving(false); }
    };

    return (
      <Modal show={modalHorasFuncional.show} onHide={() => setModalHorasFuncional({ show: false, item: null })} centered size="lg">
        <ModalHeader closeButton><ModalTitle>{item ? 'Editar' : 'Nuevo'} registro mensual</ModalTitle></ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row className="g-2">
              <Col md={4}><Form.Label className="small">Año</Form.Label><Form.Control type="number" {...register('anio')} disabled={!!item}/></Col>
              <Col md={4}><Form.Label className="small">Mes</Form.Label>
                <Form.Select {...register('mes')} disabled={!!item}>
                  {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((m,i) => (
                    <option key={i+1} value={i+1}>{m}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}><Form.Label className="small">Horas TIC mes</Form.Label><Form.Control type="number" step="0.5" {...register('horasTicMes')} placeholder="0"/></Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline-secondary" onClick={() => setModalHorasFuncional({ show: false, item: null })} disabled={saving}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </ModalFooter>
        </Form>
      </Modal>
    );
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
        <Button variant="outline-primary" onClick={() => navigate('/proyectos')}>Volver</Button>
      </div>
    </div>
  );

  const { proyecto, cronograma, horas, horasFuncional, ocProveedores, ocClientes } = detalle;

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title={proyecto.codProy}
        subTitle1="Proyectos"
        subTitle2={proyecto.codProy}
        subText={proyecto.nombreRequerimiento}
      />

      <div className="main-content">

        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/proyectos')}>
            <FaArrowLeft size={11} className="me-1" /> Volver
          </Button>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h5 className="mb-0 fw-bold">{proyecto.nombreRequerimiento}</h5>
              <EstadoBadge estado={proyecto.estado} />
              {proyecto.estadoInterno && (
                <Badge bg="light" text="dark" style={{ border: '1px solid #d1d5db', fontSize: 10 }}>
                  {proyecto.estadoInterno}
                </Badge>
              )}
            </div>
            <div className="d-flex gap-3 mt-1" style={{ fontSize: 12 }}>
              <span className="text-muted">Analista: <strong>{proyecto.analista ?? '—'}</strong></span>
              <span className="text-muted">Key User: <strong>{proyecto.keyUser ?? '—'}</strong></span>
              <span className="text-muted">Periodo: <strong>{proyecto.periodo ?? '—'}</strong></span>
              <span className="text-muted">Monto: <strong style={{ color: '#3B6D11' }}>{formatMonto(proyecto.montoTotalProyecto)}</strong></span>
            </div>
          </div>
        </div>

        {/* Tabs */}
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
                    <Button size="sm" variant="outline-primary" style={{ fontSize: 11 }} onClick={() => setModalCronograma(true)}>
                      <FaPen size={10} className="me-1" /> Editar
                    </Button>
                  </div>
                  <div className="card-body">
                    {[
                      { label: 'F. Requerimiento', value: cronograma?.fRequerimiento },
                      { label: 'F. Entrega final', value: cronograma?.fEntregaFinal },
                      { label: 'F. Cotización', value: cronograma?.fCotizacion },
                      { label: 'F. Autorizado', value: cronograma?.fAutorizado },
                      { label: 'F. Ini. Construcción', value: cronograma?.fIniConstruccion },
                      { label: 'F. Fin Construcción', value: cronograma?.fFinConstruccion },
                      { label: 'F. Ini. Val. Usuario', value: cronograma?.fIniValUsu },
                      { label: 'F. Cierre', value: cronograma?.fCierre },
                    ].map(f => (
                      <div key={f.label} className="d-flex justify-content-between py-1" style={{ borderBottom: '0.5px solid var(--color-border-tertiary)', fontSize: 12 }}>
                        <span className="text-muted">{f.label}</span>
                        <span className="fw-semibold font-monospace">{formatFecha(f.value)}</span>
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
              <Button variant="primary" size="sm" onClick={() => setModalOCProv({ show: true, item: null })}>
                <FaPlus size={11} className="me-1" /> Nueva OC Proveedor
              </Button>
            </div>
            {ocProveedores?.length === 0 ? (
              <p className="text-muted text-center py-4">Sin OC de proveedor registradas.</p>
            ) : ocProveedores?.map(oc => (
              <OCProveedorCard key={oc.id} oc={oc}
                onEdit={(item) => setModalOCProv({ show: true, item })}
                onDelete={handleDeleteOCProv}
                onAddHES={(idOC) => setModalHES({ show: true, item: null, idOC, tipo: 'proveedor' })}
                onEditHES={(item, idOC) => setModalHES({ show: true, item, idOC, tipo: 'proveedor' })}
                onDeleteHES={handleDeleteHES}
              />
            ))}
          </Tab>

          {/* ── OC CLIENTE ── */}
          <Tab eventKey="occli" title={`OC Cliente (${ocClientes?.length ?? 0})`}>
            <div className="d-flex justify-content-end mb-3">
              <Button variant="success" size="sm" onClick={() => setModalOCCli({ show: true, item: null })}>
                <FaPlus size={11} className="me-1" /> Nueva OC Cliente
              </Button>
            </div>
            {ocClientes?.length === 0 ? (
              <p className="text-muted text-center py-4">Sin OC de cliente registradas.</p>
            ) : ocClientes?.map(oc => (
              <OCClienteCard key={oc.id} oc={oc}
                onEdit={(item) => setModalOCCli({ show: true, item })}
                onDelete={handleDeleteOCCli}
                onAddHES={(idOC) => setModalHES({ show: true, item: null, idOC, tipo: 'cliente' })}
                onEditHES={(item, idOC) => setModalHES({ show: true, item, idOC, tipo: 'cliente' })}
                onDeleteHES={handleDeleteHES}
              />
            ))}
          </Tab>

          {/* ── HORAS ── */}
          <Tab eventKey="horas" title="Horas">
            <Row className="g-3">
              <Col md={5}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2 d-flex align-items-center justify-content-between">
                    <span className="fw-semibold small">Horas totales del proyecto</span>
                    <Button size="sm" variant="outline-primary" style={{ fontSize: 11 }} onClick={() => setModalHoras(true)}>
                      <FaPen size={10} className="me-1" /> Editar
                    </Button>
                  </div>
                  <div className="card-body">
                    {[
                      { label: 'Horas proyecto', value: horas?.horasProyecto },
                      { label: 'Horas TIC', value: horas?.horasTIC },
                      { label: 'Horas JP', value: horas?.horasJP },
                      { label: 'Horas Prov', value: horas?.horasProv },
                    ].map(h => (
                      <div key={h.label} className="d-flex justify-content-between py-2" style={{ borderBottom: '0.5px solid var(--color-border-tertiary)', fontSize: 13 }}>
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
                    <Button size="sm" variant="outline-primary" style={{ fontSize: 11 }}
                      onClick={() => setModalHorasFuncional({ show: true, item: null })}>
                      <FaPlus size={10} className="me-1" /> Agregar mes
                    </Button>
                  </div>
                  <div className="card-body p-0">
                    {horasFuncional?.length === 0 ? (
                      <p className="text-muted text-center py-3" style={{ fontSize: 12 }}>Sin registros mensuales.</p>
                    ) : (
                      <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
                        <thead className="table-light">
                          <tr><th>Año</th><th>Mes</th><th>Horas TIC mes</th><th></th></tr>
                        </thead>
                        <tbody>
                          {horasFuncional?.map(h => (
                            <tr key={h.id}>
                              <td className="font-monospace">{h.anio}</td>
                              <td>{['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][h.mes]}</td>
                              <td><strong>{h.horasTicMes ?? '—'}</strong></td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button size="sm" variant="outline-secondary"
                                    onClick={() => setModalHorasFuncional({ show: true, item: h })}>
                                    <FaPen size={9} />
                                  </Button>
                                  <Button size="sm" variant="outline-danger"
                                    onClick={async () => {
                                      await proyectoHorasService.deleteHorasFuncional(h.id);
                                      toast.success('Registro eliminado');
                                      await cargar();
                                    }}>
                                    <FaTrash size={9} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </div>

      {/* Modals */}
      <OCProveedorModal show={modalOCProv.show} onHide={() => setModalOCProv({ show: false, item: null })}
        onSave={handleSaveOCProv} oc={modalOCProv.item} codProy={id} saving={saving} />

      <OCClienteModal show={modalOCCli.show} onHide={() => setModalOCCli({ show: false, item: null })}
        onSave={handleSaveOCCli} oc={modalOCCli.item} codProy={id} saving={saving} />

      <HESModal show={modalHES.show} onHide={() => setModalHES({ show: false, item: null, idOC: null, tipo: null })}
        onSave={handleSaveHES} hes={modalHES.item} tipo={modalHES.tipo} saving={saving} />

      <CronogramaModal />
      <HorasModal />
      <HorasFuncionalModal />
    </div>
  );
};

export default DetalleProyecto;