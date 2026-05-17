import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Row, Col, Spinner, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Form } from 'react-bootstrap';
import { FaArrowLeft, FaPlus, FaPen, FaTrash } from 'react-icons/fa6';
import { toast } from 'react-toastify';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import {
  membresiasService,
  membresiaOCService,
  membresiaHESService,
  membresiaOCClienteService,
  membresiaHESClienteService,
  membresiaFacturacionService,
} from '@/services/membresia.service';
import { ordenCOService } from '@/services/licencia.service';

// ── Botones reutilizables ─────────────────────────────
const BtnCancel = ({ onClick }) => (
  <button type="button" onClick={onClick}
    style={{ padding:'6px 16px', borderRadius:7, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#374151', fontSize:13, fontWeight:500, cursor:'pointer' }}
    onMouseEnter={e => { e.currentTarget.style.background='#374151'; e.currentTarget.style.color='white'; }}
    onMouseLeave={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.color='#374151'; }}>
    Cancelar
  </button>
);
const BtnSave = ({ onClick, saving, label = 'Guardar', loadingLabel = 'Guardando...' }) => (
  <button type="button" onClick={onClick} disabled={saving}
    style={{ padding:'6px 16px', borderRadius:7, border:'1.5px solid #185FA5', background:'#185FA5', color:'white', fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
    onMouseEnter={e => { if (!saving) { e.currentTarget.style.background='#1249a0'; e.currentTarget.style.borderColor='#1249a0'; } }}
    onMouseLeave={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.borderColor='#185FA5'; }}>
    {saving ? loadingLabel : label}
  </button>
);

const labelStyle = { fontSize: 12, fontWeight: 600, marginBottom: 4 };
const inputStyle = { fontSize: 13, borderRadius: 8, border: '1.5px solid #dde1e7', padding: '7px 10px' };

const DetalleMembresia = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [membresia, setMembresia]     = useState(null);
  const [ocsProveedor, setOcsProveedor] = useState([]);
  const [ocClientes, setOcClientes]   = useState([]);
  const [ordenesCO, setOrdenesCO]     = useState([]);
  const [loading, setLoading]         = useState(true);

  const [showOcModal, setShowOcModal]               = useState(false);
  const [showHesModal, setShowHesModal]             = useState(false);
  const [showOcClienteModal, setShowOcClienteModal] = useState(false);
  const [showHesClienteModal, setShowHesClienteModal] = useState(false);
  const [showFactModal, setShowFactModal]           = useState(false);

  const [editItem, setEditItem]     = useState(null);
  const [parentItem, setParentItem] = useState(null);
  const [formData, setFormData]     = useState({});
  const [saving, setSaving]         = useState(false);
  const [validacionCO, setValidacionCO] = useState(null);
  const [checkingCO, setCheckingCO]     = useState(false);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [mem, coData] = await Promise.all([
        membresiasService.obtener(id),
        ordenCOService.listar(),
      ]);
      setMembresia(mem);
      setOrdenesCO(coData);

      const ocsData = await membresiaOCService.listarPorMembresia(id);
      const ocsConHes = await Promise.all(
        ocsData.map(async (oc) => {
          const hesData = await membresiaHESService.listarPorOC(oc.idMembresiaOC);
          return { ...oc, hes: hesData };
        })
      );
      setOcsProveedor(ocsConHes);

      const occs = await membresiaOCClienteService.listarPorMembresia(id);
      const occsConHes = await Promise.all(
        occs.map(async (occ) => {
          const hesClientes = await membresiaHESClienteService.listarPorOcCliente(occ.idMembresiaOcCliente);
          const hesConFact = await Promise.all(
            hesClientes.map(async (h) => {
              const facturas = await membresiaFacturacionService.listarPorHes(h.idMembresiaHesCliente);
              return { ...h, facturas };
            })
          );
          return { ...occ, hesClientes: hesConFact };
        })
      );
      setOcClientes(occsConHes);
    } catch (err) {
      toast.error('Error al cargar detalle: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarTodo(); }, [id]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── OC Proveedor ──────────────────────────────────────
  const openOcModal = (oc = null) => {
    setEditItem(oc);
    setValidacionCO(null);
    if (oc) {
      const coActual = ordenesCO.find(co => co.idOrdenCO === parseInt(oc.idOrdenCO));
      setFormData({ numeroOc: oc.numeroOc ?? '', numeroCO: coActual?.numeroCO ?? '', idOrdenCO: oc.idOrdenCO ?? null,
        descripcionCo: oc.descripcionCo ?? '', solpedCompra: oc.solpedCompra ?? '',
        importeUsd: oc.importeUsd ?? '', importePen: oc.importePen ?? '', estado: oc.estado ?? 'Activa' });
    } else {
      setFormData({ numeroOc:'', numeroCO:'', idOrdenCO:null, descripcionCo:'', solpedCompra:'', importeUsd:'', importePen:'', estado:'Activa' });
    }
    setShowOcModal(true);
  };

  const crearNuevaCO = async () => {
    try {
      await ordenCOService.crear({ numeroCO: formData.numeroCO.trim(), idEmpresa: 1, descripcion: formData.descripcionCo || '' });
      toast.success(`Orden CO '${formData.numeroCO}' creada`);
      const coData = await ordenCOService.listar();
      setOrdenesCO(coData);
      const nueva = coData.find(co => co.numeroCO === formData.numeroCO.trim());
      if (nueva) { setValidacionCO('ok'); setFormData(prev => ({ ...prev, idOrdenCO: nueva.idOrdenCO })); }
    } catch (err) { toast.error(err.message); }
  };

  const validarOrdenCO = async () => {
    if (!formData.numeroCO) return;
    setCheckingCO(true);
    try {
      const lista = await ordenCOService.listar();
      const encontrado = lista.find(
        co => co.numeroCO.trim().toLowerCase().includes(formData.numeroCO.trim().toLowerCase())
          || formData.numeroCO.trim().toLowerCase().includes(co.numeroCO.trim().toLowerCase())
      );
      if (encontrado) { setValidacionCO('ok'); setFormData(prev => ({ ...prev, idOrdenCO: encontrado.idOrdenCO })); }
      else { setValidacionCO('notfound'); setFormData(prev => ({ ...prev, idOrdenCO: null })); }
    } catch { setValidacionCO(null); }
    finally { setCheckingCO(false); }
  };

  const saveOc = async () => {
    try {
      setSaving(true);
      const payload = { idMembresia: parseInt(id), numeroOc: formData.numeroOc || null,
        idOrdenCO: formData.idOrdenCO ? parseInt(formData.idOrdenCO) : null, descripcionCo: formData.descripcionCo || null,
        solpedCompra: formData.solpedCompra || null, importeUsd: parseFloat(formData.importeUsd) || null,
        importePen: parseFloat(formData.importePen) || null, estado: formData.estado };
      if (editItem) { await membresiaOCService.editar(editItem.idMembresiaOC, payload); toast.success('OC actualizada correctamente'); }
      else { await membresiaOCService.crear(payload); toast.success('OC registrada correctamente'); }
      setShowOcModal(false);
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deleteOc = async (idOc) => {
    try { await membresiaOCService.eliminar(idOc); toast.success('OC eliminada'); await cargarTodo(); }
    catch (err) { toast.error(err.message); }
  };

  // ── HES Proveedor ─────────────────────────────────────
  const openHesModal = (oc, item = null) => {
    setParentItem(oc); setEditItem(item);
    setFormData(item ? { numeroHes: item.numeroHes, descripcion: item.descripcion ?? '', importeUsd: item.importeUsd ?? '', importePen: item.importePen ?? '', fechaHes: item.fechaHes ?? '' }
      : { numeroHes:'', descripcion:'', importeUsd:'', importePen:'', fechaHes:'' });
    setShowHesModal(true);
  };

  const saveHes = async () => {
    try {
      setSaving(true);
      const payload = { idMembresiaOC: parentItem.idMembresiaOC, numeroHes: formData.numeroHes, descripcion: formData.descripcion || null,
        importeUsd: parseFloat(formData.importeUsd) || null, importePen: parseFloat(formData.importePen) || null, fechaHes: formData.fechaHes || null };
      if (editItem) { await membresiaHESService.editar(editItem.idMembresiaHes, payload); toast.success('HES actualizada correctamente'); }
      else { await membresiaHESService.crear(payload); toast.success('HES registrada correctamente'); }
      setShowHesModal(false);
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deleteHes = async (idHes) => {
    try { await membresiaHESService.eliminar(idHes); toast.success('HES eliminada'); await cargarTodo(); }
    catch (err) { toast.error(err.message); }
  };

  // ── OC Cliente ────────────────────────────────────────
  const openOcClienteModal = (item = null) => {
    setEditItem(item);
    setFormData(item ? { codSapCliente: item.codSapCliente ?? '', empresaRefacturable: item.empresaRefacturable ?? '', importeRefPen: item.importeRefPen ?? '', importeRefUsd: item.importeRefUsd ?? '' }
      : { codSapCliente:'', empresaRefacturable:'', importeRefPen:'', importeRefUsd:'' });
    setShowOcClienteModal(true);
  };

  const saveOcCliente = async () => {
    try {
      setSaving(true);
      const payload = { idMembresia: parseInt(id), codSapCliente: formData.codSapCliente || null,
        empresaRefacturable: formData.empresaRefacturable || null, importeRefPen: parseFloat(formData.importeRefPen) || null, importeRefUsd: parseFloat(formData.importeRefUsd) || null };
      if (editItem) { await membresiaOCClienteService.editar(editItem.idMembresiaOcCliente, payload); toast.success('OC Cliente actualizada correctamente'); }
      else { await membresiaOCClienteService.crear(payload); toast.success('OC Cliente registrada correctamente'); }
      setShowOcClienteModal(false);
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  // ── HES Cliente ───────────────────────────────────────
  const openHesClienteModal = (ocCliente, item = null) => {
    setParentItem(ocCliente); setEditItem(item);
    setFormData(item ? { osClienteCsc: item.osClienteCsc ?? '', hesClienteCsc: item.hesClienteCsc ?? '', descripcion: item.descripcion ?? '', importeUsd: item.importeUsd ?? '', importePen: item.importePen ?? '', fechaHes: item.fechaHes ?? '' }
      : { osClienteCsc:'', hesClienteCsc:'', descripcion:'', importeUsd:'', importePen:'', fechaHes:'' });
    setShowHesClienteModal(true);
  };

  const saveHesCliente = async () => {
    try {
      setSaving(true);
      const payload = { idMembresiaOcCliente: parentItem.idMembresiaOcCliente, osClienteCsc: formData.osClienteCsc || null,
        hesClienteCsc: formData.hesClienteCsc || null, descripcion: formData.descripcion || null,
        importeUsd: parseFloat(formData.importeUsd) || null, importePen: parseFloat(formData.importePen) || null, fechaHes: formData.fechaHes || null };
      if (editItem) { await membresiaHESClienteService.editar(editItem.idMembresiaHesCliente, payload); toast.success('HES Cliente actualizada correctamente'); }
      else { await membresiaHESClienteService.crear(payload); toast.success('HES Cliente registrada correctamente'); }
      setShowHesClienteModal(false);
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deleteHesCliente = async (idHes) => {
    try { await membresiaHESClienteService.eliminar(idHes); toast.success('HES Cliente eliminada'); await cargarTodo(); }
    catch (err) { toast.error(err.message); }
  };

  // ── Facturación ───────────────────────────────────────
  const openFactModal = (hesCliente, item = null) => {
    setParentItem(hesCliente); setEditItem(item);
    setFormData(item ? { estadoCsc: item.estadoCsc ?? '', anioMesFac: item.anioMesFac ?? '', nroFacturaSap: item.nroFacturaSap ?? '', montoFactPen: item.montoFactPen ?? '', montoFactUsd: item.montoFactUsd ?? '' }
      : { estadoCsc:'', anioMesFac:'', nroFacturaSap:'', montoFactPen:'', montoFactUsd:'' });
    setShowFactModal(true);
  };

  const saveFact = async () => {
    try {
      setSaving(true);
      const payload = { idMembresiaOcCliente: parentItem.idMembresiaOcCliente, idMembresiaHesCliente: parentItem.idMembresiaHesCliente,
        estadoCsc: formData.estadoCsc || null, anioMesFac: formData.anioMesFac || null, nroFacturaSap: formData.nroFacturaSap || null,
        montoFactPen: parseFloat(formData.montoFactPen) || null, montoFactUsd: parseFloat(formData.montoFactUsd) || null };
      if (editItem) { await membresiaFacturacionService.editar(editItem.idMembresiaFacturacion, payload); toast.success('Facturación actualizada correctamente'); }
      else { await membresiaFacturacionService.crear(payload); toast.success('Facturación registrada correctamente'); }
      setShowFactModal(false);
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deleteFact = async (idFact) => {
    try { await membresiaFacturacionService.eliminar(idFact); toast.success('Facturación eliminada'); await cargarTodo(); }
    catch (err) { toast.error(err.message); }
  };

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (!membresia) return (
    <div className="content-wrapper"><p className="text-muted">Membresía no encontrada.</p></div>
  );

  // ── Estilos de botones inline ─────────────────────────
  const btnVolver = {
    style: { display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#374151', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s' },
    onMouseEnter: e => { e.currentTarget.style.background='#374151'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#374151'; },
    onMouseLeave: e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.color='#374151'; e.currentTarget.style.borderColor='#d1d5db'; },
  };
  const btnRed = {
    style: { display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:7, border:'1.5px solid #fca5a5', background:'#fff1f1', color:'#991b1b', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s' },
    onMouseEnter: e => { e.currentTarget.style.background='#991b1b'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#991b1b'; },
    onMouseLeave: e => { e.currentTarget.style.background='#fff1f1'; e.currentTarget.style.color='#991b1b'; e.currentTarget.style.borderColor='#fca5a5'; },
  };
  const btnGray = {
    style: { display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:7, border:'1.5px solid #d1d5db', background:'#f3f4f6', color:'#374151', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s' },
    onMouseEnter: e => { e.currentTarget.style.background='#374151'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#374151'; },
    onMouseLeave: e => { e.currentTarget.style.background='#f3f4f6'; e.currentTarget.style.color='#374151'; e.currentTarget.style.borderColor='#d1d5db'; },
  };
  const btnBlue = {
    style: { display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:7, border:'1.5px solid #bfdbfe', background:'#eff6ff', color:'#185FA5', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s' },
    onMouseEnter: e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#185FA5'; },
    onMouseLeave: e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; e.currentTarget.style.borderColor='#bfdbfe'; },
  };
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

  return (
    <div className="content-wrapper">
      <PageBreadcrumb title={`Detalle — ${membresia.codigoProyecto}`} subTitle1="Gestión" subTitle2="Membresías" />

      <div className="main-content">
        <button className="mb-3" onClick={() => navigate('/membresias')} {...btnVolver}>
          <FaArrowLeft size={11} /> Volver a membresías
        </button>

        {/* Info general */}
        <Row className="mb-3 g-3">
          <Col md={4}>
            <div className="card border-0 shadow-sm">
              <div className="card-body py-3">
                <p className="text-muted small mb-1 text-uppercase" style={{ fontSize: 10 }}>Código Proyecto</p>
                <h6 className="mb-0 fw-semibold">{membresia.codigoProyecto}</h6>
              </div>
            </div>
          </Col>
          <Col md={5}>
            <div className="card border-0 shadow-sm">
              <div className="card-body py-3">
                <p className="text-muted small mb-1 text-uppercase" style={{ fontSize: 10 }}>Nombre Requerimiento</p>
                <h6 className="mb-0 fw-semibold">{membresia.nombreRequerimiento ?? '—'}</h6>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="card border-0 shadow-sm">
              <div className="card-body py-3">
                <p className="text-muted small mb-1 text-uppercase" style={{ fontSize: 10 }}>Período</p>
                <h6 className="mb-0 fw-semibold" style={{ fontFamily:'monospace' }}>{membresia.periodo ?? '—'}</h6>
              </div>
            </div>
          </Col>
        </Row>

        {/* ═══ BLOQUE ROJO: OC Proveedor ═══ */}
        <div className="card mb-3" style={{ border: '1px solid #fca5a5' }}>
          <div className="card-header d-flex align-items-center justify-content-between py-2"
            style={{ background: '#fff1f1', borderBottom: '1px solid #fca5a5' }}>
            <span className="fw-semibold small text-uppercase" style={{ color: '#991b1b', letterSpacing: '.06em' }}>
              OC Proveedor — compra de membresía
            </span>
            <button onClick={() => openOcModal(null)} {...btnRed}>
              <FaPlus size={10} /> Nueva OC
            </button>
          </div>
          <div className="card-body">
            {ocsProveedor.length === 0 ? (
              <p className="text-muted small text-center py-2">No hay OC de proveedor registradas.</p>
            ) : (
              ocsProveedor.map((oc, i) => (
                <div key={oc.idMembresiaOC} className="mb-3 p-3 rounded"
                  style={{ background: '#fff8f8', border: '0.5px solid #fca5a5' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="fw-semibold" style={{ color: '#991b1b' }}>OC Proveedor #{i + 1}</small>
                    <div className="d-flex gap-1">
                      <button onClick={() => openOcModal(oc)} title="Editar" {...btn30Edit}><FaPen size={10} /></button>
                      <button onClick={() => deleteOc(oc.idMembresiaOC)} title="Eliminar" {...btn30Del}><FaTrash size={10} /></button>
                    </div>
                  </div>
                  <Row className="g-2 mb-3">
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>N° OC</div><div className="fw-semibold" style={{ fontFamily:'monospace' }}>{oc.numeroOc ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Orden CO</div><div style={{ fontFamily:'monospace' }}>{ordenesCO.find(co => co.idOrdenCO === parseInt(oc.idOrdenCO))?.numeroCO ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Descripción CO</div><div>{oc.descripcionCo ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Solped</div><div style={{ fontFamily:'monospace' }}>{oc.solpedCompra ?? '—'}</div></Col>
                    <Col md={2}><div className="text-muted" style={{ fontSize: 11 }}>Importe USD</div><div className="fw-semibold">$ {oc.importeUsd ?? '—'}</div></Col>
                    <Col md={2}><div className="text-muted" style={{ fontSize: 11 }}>Importe PEN</div><div className="fw-semibold">S/ {oc.importePen ?? '—'}</div></Col>
                    <Col md={2}><div className="text-muted" style={{ fontSize: 11 }}>Estado</div><span className={`badge bg-${oc.estado === 'Activa' ? 'success' : 'secondary'}`}>{oc.estado}</span></Col>
                  </Row>

                  <div style={{ borderTop: '1px solid #fca5a5', paddingTop: 10 }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <small className="fw-semibold text-uppercase" style={{ color: '#991b1b', fontSize: 10 }}>HES Proveedor</small>
                      <button onClick={() => openHesModal(oc, null)} {...btnRed}>
                        <FaPlus size={10} /> Agregar HES
                      </button>
                    </div>
                    {oc.hes?.length === 0 ? (
                      <p className="text-muted small">Sin HES registradas.</p>
                    ) : (
                      <table className="table table-sm table-hover" style={{ fontSize: 12 }}>
                        <thead className="table-light">
                          <tr><th>N° HES</th><th>Descripción</th><th>Importe USD</th><th>Importe PEN</th><th>Fecha</th><th></th></tr>
                        </thead>
                        <tbody>
                          {oc.hes?.map(h => (
                            <tr key={h.idMembresiaHes}>
                              <td className="fw-semibold" style={{ color: '#991b1b', fontFamily:'monospace' }}>{h.numeroHes}</td>
                              <td className="text-muted">{h.descripcion ?? '—'}</td>
                              <td>$ {h.importeUsd ?? '—'}</td>
                              <td>S/ {h.importePen ?? '—'}</td>
                              <td className="text-muted">{h.fechaHes ?? '—'}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button onClick={() => openHesModal(oc, h)} title="Editar" {...btn30Edit}><FaPen size={10} /></button>
                                  <button onClick={() => deleteHes(h.idMembresiaHes)} title="Eliminar" {...btn30Del}><FaTrash size={10} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ═══ BLOQUE GRIS: OC Cliente ═══ */}
        <div className="card mb-3" style={{ border: '1px solid #d1d5db' }}>
          <div className="card-header d-flex align-items-center justify-content-between py-2"
            style={{ background: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
            <span className="fw-semibold small text-uppercase" style={{ color: '#374151', letterSpacing: '.06em' }}>
              OC Cliente — pago del cliente
            </span>
            <button onClick={() => openOcClienteModal(null)} {...btnGray}>
              <FaPlus size={10} /> Nueva OC Cliente
            </button>
          </div>
          <div className="card-body">
            {ocClientes.length === 0 ? (
              <p className="text-muted small">No hay OC de cliente registrada.</p>
            ) : (
              ocClientes.map((occ, i) => (
                <div key={occ.idMembresiaOcCliente} className="mb-3 p-3 rounded"
                  style={{ background: '#f9fafb', border: '0.5px solid #d1d5db' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="fw-semibold text-muted">OC Cliente #{i + 1}</small>
                    <button onClick={() => openOcClienteModal(occ)} title="Editar" {...btn30Edit}><FaPen size={10} /></button>
                  </div>
                  <Row className="g-2 mb-3">
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Cod. SAP cliente</div><div className="fw-semibold" style={{ fontFamily:'monospace' }}>{occ.codSapCliente ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Empresa refacturable</div><div>{occ.empresaRefacturable ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Importe ref. PEN</div><div className="fw-semibold">S/ {occ.importeRefPen ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Importe ref. USD</div><div className="fw-semibold">$ {occ.importeRefUsd ?? '—'}</div></Col>
                  </Row>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 10 }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <small className="fw-semibold text-uppercase" style={{ color: '#374151', fontSize: 10 }}>HES Cliente</small>
                      <button onClick={() => openHesClienteModal(occ, null)} {...btnGray}>
                        <FaPlus size={10} /> Agregar HES
                      </button>
                    </div>
                    {occ.hesClientes?.length === 0 ? (
                      <p className="text-muted small">Sin HES registradas.</p>
                    ) : (
                      occ.hesClientes?.map(h => (
                        <div key={h.idMembresiaHesCliente} className="mb-2 p-2 rounded"
                          style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-3">
                              <div><div className="text-muted" style={{ fontSize: 10 }}>OS Cliente CSC</div><span className="fw-semibold small" style={{ fontFamily:'monospace' }}>{h.osClienteCsc ?? '—'}</span></div>
                              <div><div className="text-muted" style={{ fontSize: 10 }}>HES Cliente CSC</div><span className="fw-semibold small" style={{ color: '#374151', fontFamily:'monospace' }}>{h.hesClienteCsc ?? '—'}</span></div>
                              <div><div className="text-muted" style={{ fontSize: 10 }}>Fecha</div><span className="text-muted small">{h.fechaHes ?? '—'}</span></div>
                              <div><div className="text-muted" style={{ fontSize: 10 }}>USD</div><span className="small">$ {h.importeUsd ?? '—'}</span></div>
                              <div><div className="text-muted" style={{ fontSize: 10 }}>PEN</div><span className="small">S/ {h.importePen ?? '—'}</span></div>
                            </div>
                            <div className="d-flex gap-1">
                              <button onClick={() => openHesClienteModal(occ, h)} title="Editar" {...btn30Edit}><FaPen size={10} /></button>
                              <button onClick={() => deleteHesCliente(h.idMembresiaHesCliente)} title="Eliminar" {...btn30Del}><FaTrash size={10} /></button>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <small className="text-uppercase fw-semibold" style={{ color: '#1e40af', fontSize: 10 }}>Facturación</small>
                              <button onClick={() => openFactModal(h, null)} {...btnBlue}>
                                <FaPlus size={9} /> Nueva
                              </button>
                            </div>
                            {h.facturas?.length === 0 ? (
                              <p className="text-muted" style={{ fontSize: 11 }}>Sin facturación.</p>
                            ) : (
                              <table className="table table-sm" style={{ fontSize: 11 }}>
                                <thead className="table-light">
                                  <tr><th>Estado CSC</th><th>Año/Mes</th><th>Nro. Factura SAP</th><th>Monto PEN</th><th>Monto USD</th><th></th></tr>
                                </thead>
                                <tbody>
                                  {h.facturas?.map(f => (
                                    <tr key={f.idMembresiaFacturacion}>
                                      <td><span className="badge bg-info text-dark">{f.estadoCsc ?? '—'}</span></td>
                                      <td style={{ fontFamily:'monospace' }}>{f.anioMesFac ?? '—'}</td>
                                      <td className="fw-semibold" style={{ fontFamily:'monospace' }}>{f.nroFacturaSap ?? '—'}</td>
                                      <td>S/ {f.montoFactPen ?? '—'}</td>
                                      <td>$ {f.montoFactUsd ?? '—'}</td>
                                      <td>
                                        <div className="d-flex gap-1">
                                          <button onClick={() => openFactModal(h, f)} title="Editar" {...btn30Edit}><FaPen size={9} /></button>
                                          <button onClick={() => deleteFact(f.idMembresiaFacturacion)} title="Eliminar" {...btn30Del}><FaTrash size={9} /></button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ═══ MODAL OC PROVEEDOR ═══ */}
      <Modal show={showOcModal} onHide={() => setShowOcModal(false)} centered size="lg">
        <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{editItem ? 'Editar OC Proveedor' : 'Nueva OC Proveedor'}</ModalTitle></ModalHeader>
        <ModalBody className="px-4 py-3">
          <Row className="g-3">
            <Col md={6}>
              <Form.Label style={labelStyle}>Orden CO (cargado a)</Form.Label>
              <Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} name="numeroCO" value={formData.numeroCO ?? ''} onChange={(e) => { handleChange(e); setValidacionCO(null); }}
                onBlur={validarOrdenCO} placeholder="Ej: 10000026702"
                isValid={validacionCO === 'ok'} isInvalid={validacionCO === 'notfound'} />
              {checkingCO && <small className="text-muted">Verificando...</small>}
              {validacionCO === 'ok' && <div className="text-success small mt-1">✓ Orden CO encontrada</div>}
              {validacionCO === 'notfound' && (
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="text-danger small">✗ No existe en el catálogo</span>
                  <button type="button" onClick={crearNuevaCO}
                    style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:6, border:'1.5px solid #bfdbfe', background:'#eff6ff', color:'#185FA5', fontSize:11, fontWeight:600, cursor:'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
                    + Crear
                  </button>
                </div>
              )}
            </Col>
            <Col md={6}><Form.Label style={labelStyle}>N° OC</Form.Label>
              <Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} name="numeroOc" value={formData.numeroOc ?? ''} onChange={handleChange} placeholder="Ej: 4500254836"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Descripción CO</Form.Label>
              <Form.Control style={inputStyle} name="descripcionCo" value={formData.descripcionCo ?? ''} onChange={handleChange} placeholder="Ej: PRTIC - RMS Membresía RMS 2025"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Solped de compra</Form.Label>
              <Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} name="solpedCompra" value={formData.solpedCompra ?? ''} onChange={handleChange} placeholder="Ej: 0010077810"/></Col>
            <Col md={3}><Form.Label style={labelStyle}>Importe USD</Form.Label>
              <Form.Control style={inputStyle} type="number" name="importeUsd" value={formData.importeUsd ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label style={labelStyle}>Importe PEN</Form.Label>
              <Form.Control style={inputStyle} type="number" name="importePen" value={formData.importePen ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label style={labelStyle}>Estado</Form.Label>
              <Form.Select style={inputStyle} name="estado" value={formData.estado ?? 'Activa'} onChange={handleChange}>
                <option value="Activa">Activa</option>
                <option value="Cerrada">Cerrada</option>
                <option value="Anulada">Anulada</option>
              </Form.Select></Col>
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={() => setShowOcModal(false)} />
          <BtnSave onClick={saveOc} saving={saving} label={editItem ? 'Guardar' : 'Registrar'} />
        </ModalFooter>
      </Modal>

      {/* ═══ MODAL HES PROVEEDOR ═══ */}
      <Modal show={showHesModal} onHide={() => setShowHesModal(false)} centered>
        <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{editItem ? 'Editar HES' : 'Nueva HES'}</ModalTitle></ModalHeader>
        <ModalBody className="px-4 py-3">
          <Row className="g-3">
            <Col md={6}><Form.Label style={labelStyle}>N° HES *</Form.Label>
              <Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} name="numeroHes" value={formData.numeroHes ?? ''} onChange={handleChange} placeholder="Ej: 1000081760"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Fecha</Form.Label>
              <Form.Control style={inputStyle} type="date" name="fechaHes" value={formData.fechaHes ?? ''} onChange={handleChange}/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Importe USD</Form.Label>
              <Form.Control style={inputStyle} type="number" name="importeUsd" value={formData.importeUsd ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Importe PEN</Form.Label>
              <Form.Control style={inputStyle} type="number" name="importePen" value={formData.importePen ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={12}><Form.Label style={labelStyle}>Descripción</Form.Label>
              <Form.Control style={{ ...inputStyle, resize:'none' }} as="textarea" rows={2} name="descripcion" value={formData.descripcion ?? ''} onChange={handleChange} placeholder="Descripción"/></Col>
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={() => setShowHesModal(false)} />
          <BtnSave onClick={saveHes} saving={saving} label={editItem ? 'Guardar' : 'Registrar'} />
        </ModalFooter>
      </Modal>

      {/* ═══ MODAL OC CLIENTE ═══ */}
      <Modal show={showOcClienteModal} onHide={() => setShowOcClienteModal(false)} centered>
        <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{editItem ? 'Editar OC Cliente' : 'Nueva OC Cliente'}</ModalTitle></ModalHeader>
        <ModalBody className="px-4 py-3">
          <Row className="g-3">
            <Col md={6}><Form.Label style={labelStyle}>Cod. SAP cliente</Form.Label>
              <Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} name="codSapCliente" value={formData.codSapCliente ?? ''} onChange={handleChange} placeholder="Ej: 200000014"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Empresa refacturable</Form.Label>
              <Form.Control style={inputStyle} name="empresaRefacturable" value={formData.empresaRefacturable ?? ''} onChange={handleChange} placeholder="Ej: R010 - El S.A."/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Importe ref. PEN</Form.Label>
              <Form.Control style={inputStyle} type="number" name="importeRefPen" value={formData.importeRefPen ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Importe ref. USD</Form.Label>
              <Form.Control style={inputStyle} type="number" name="importeRefUsd" value={formData.importeRefUsd ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={() => setShowOcClienteModal(false)} />
          <BtnSave onClick={saveOcCliente} saving={saving} label={editItem ? 'Guardar' : 'Registrar'} />
        </ModalFooter>
      </Modal>

      {/* ═══ MODAL HES CLIENTE ═══ */}
      <Modal show={showHesClienteModal} onHide={() => setShowHesClienteModal(false)} centered>
        <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{editItem ? 'Editar HES Cliente' : 'Nueva HES Cliente'}</ModalTitle></ModalHeader>
        <ModalBody className="px-4 py-3">
          <Row className="g-3">
            <Col md={6}><Form.Label style={labelStyle}>OS del Cliente a CSC</Form.Label>
              <Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} name="osClienteCsc" value={formData.osClienteCsc ?? ''} onChange={handleChange} placeholder="Ej: 4500254859"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>HES del Cliente a CSC</Form.Label>
              <Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} name="hesClienteCsc" value={formData.hesClienteCsc ?? ''} onChange={handleChange} placeholder="Ej: 200080774"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Fecha</Form.Label>
              <Form.Control style={inputStyle} type="date" name="fechaHes" value={formData.fechaHes ?? ''} onChange={handleChange}/></Col>
            <Col md={3}><Form.Label style={labelStyle}>Importe USD</Form.Label>
              <Form.Control style={inputStyle} type="number" name="importeUsd" value={formData.importeUsd ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label style={labelStyle}>Importe PEN</Form.Label>
              <Form.Control style={inputStyle} type="number" name="importePen" value={formData.importePen ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={12}><Form.Label style={labelStyle}>Descripción</Form.Label>
              <Form.Control style={{ ...inputStyle, resize:'none' }} as="textarea" rows={2} name="descripcion" value={formData.descripcion ?? ''} onChange={handleChange} placeholder="Descripción"/></Col>
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={() => setShowHesClienteModal(false)} />
          <BtnSave onClick={saveHesCliente} saving={saving} label={editItem ? 'Guardar' : 'Registrar'} />
        </ModalFooter>
      </Modal>

      {/* ═══ MODAL FACTURACIÓN ═══ */}
      <Modal show={showFactModal} onHide={() => setShowFactModal(false)} centered>
        <ModalHeader closeButton><ModalTitle style={{ fontSize: 16 }}>{editItem ? 'Editar facturación' : 'Nueva facturación'}</ModalTitle></ModalHeader>
        <ModalBody className="px-4 py-3">
          <Row className="g-3">
            <Col md={6}><Form.Label style={labelStyle}>Estado CSC</Form.Label>
              <Form.Select style={inputStyle} name="estadoCsc" value={formData.estadoCsc ?? ''} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                <option value="0. No Iniciado">0. No Iniciado</option>
                <option value="1. En revisión">1. En revisión</option>
                <option value="2. Aprobado">2. Aprobado</option>
                <option value="3. Enviado">3. Enviado</option>
                <option value="4. En proceso">4. En proceso</option>
                <option value="5. Pendiente">5. Pendiente</option>
                <option value="6. Facturado">6. Facturado</option>
              </Form.Select></Col>
            <Col md={6}><Form.Label style={labelStyle}>Año/Mes facturación</Form.Label>
              <Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} name="anioMesFac" value={formData.anioMesFac ?? ''} onChange={handleChange} placeholder="YYYYMM"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Nro. Factura SAP</Form.Label>
              <Form.Control style={{ ...inputStyle, fontFamily:'monospace' }} name="nroFacturaSap" value={formData.nroFacturaSap ?? ''} onChange={handleChange} placeholder="Ej: 91573764"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Monto fact. PEN</Form.Label>
              <Form.Control style={inputStyle} type="number" name="montoFactPen" value={formData.montoFactPen ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={6}><Form.Label style={labelStyle}>Monto fact. USD</Form.Label>
              <Form.Control style={inputStyle} type="number" name="montoFactUsd" value={formData.montoFactUsd ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
          </Row>
        </ModalBody>
        <ModalFooter className="gap-2">
          <BtnCancel onClick={() => setShowFactModal(false)} />
          <BtnSave onClick={saveFact} saving={saving} label={editItem ? 'Guardar' : 'Registrar'} />
        </ModalFooter>
      </Modal>

    </div>
  );
};

export default DetalleMembresia;
