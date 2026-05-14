import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Row, Col, Button, Spinner, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Form } from 'react-bootstrap';
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

const DetalleMembresia = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [membresia, setMembresia]     = useState(null);
  const [ocsProveedor, setOcsProveedor] = useState([]);
  const [ocClientes, setOcClientes]   = useState([]);
  const [ordenesCO, setOrdenesCO]     = useState([]);
  const [loading, setLoading]         = useState(true);

  // Modals
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

  // ── Carga de datos ────────────────────────────────────
  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [mem, coData] = await Promise.all([
        membresiasService.obtener(id),
        ordenCOService.listar(),
      ]);
      setMembresia(mem);
      setOrdenesCO(coData);

      // OCs proveedor con HES
      const ocsData = await membresiaOCService.listarPorMembresia(id);
      const ocsConHes = await Promise.all(
        ocsData.map(async (oc) => {
          const hesData = await membresiaHESService.listarPorOC(oc.idMembresiaOC);
          return { ...oc, hes: hesData };
        })
      );
      setOcsProveedor(ocsConHes);

      // OC Clientes con HES y Facturación
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
      setFormData({
        numeroOc:      oc.numeroOc      ?? '',
        numeroCO:      coActual?.numeroCO ?? '',
        idOrdenCO:     oc.idOrdenCO     ?? null,
        descripcionCo: oc.descripcionCo ?? '',
        solpedCompra:  oc.solpedCompra  ?? '',
        importeUsd:    oc.importeUsd    ?? '',
        importePen:    oc.importePen    ?? '',
        estado:        oc.estado        ?? 'Activa',
      });
    } else {
      setFormData({ numeroOc: '', numeroCO: '', idOrdenCO: null, descripcionCo: '', solpedCompra: '', importeUsd: '', importePen: '', estado: 'Activa' });
    }
    setShowOcModal(true);
  };
const crearNuevaCO = async () => {
  try {
    await ordenCOService.crear({
      numeroCO:    formData.numeroCO.trim(),
      idEmpresa:   1, // empresa por defecto
      descripcion: formData.descripcionCo || '',
    });
    toast.success(`Orden CO '${formData.numeroCO}' creada`);
    const coData = await ordenCOService.listar();
    setOrdenesCO(coData);
    const nueva = coData.find(co => co.numeroCO === formData.numeroCO.trim());
    if (nueva) {
      setValidacionCO('ok');
      setFormData(prev => ({ ...prev, idOrdenCO: nueva.idOrdenCO }));
    }
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
      if (encontrado) {
        setValidacionCO('ok');
        setFormData(prev => ({ ...prev, idOrdenCO: encontrado.idOrdenCO }));
      } else {
        setValidacionCO('notfound');
        setFormData(prev => ({ ...prev, idOrdenCO: null }));
      }
    } catch { setValidacionCO(null); }
    finally { setCheckingCO(false); }
  };

  const saveOc = async () => {
    try {
      setSaving(true);
      const payload = {
        idMembresia:   parseInt(id),
        numeroOc:      formData.numeroOc      || null,
        idOrdenCO:     formData.idOrdenCO ? parseInt(formData.idOrdenCO) : null,
        descripcionCo: formData.descripcionCo || null,
        solpedCompra:  formData.solpedCompra  || null,
        importeUsd:    parseFloat(formData.importeUsd) || null,
        importePen:    parseFloat(formData.importePen) || null,
        estado:        formData.estado,
      };
      if (editItem) {
        await membresiaOCService.editar(editItem.idMembresiaOC, payload);
        toast.success('OC actualizada correctamente');
      } else {
        await membresiaOCService.crear(payload);
        toast.success('OC registrada correctamente');
      }
      setShowOcModal(false);
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deleteOc = async (idOc) => {
    try {
      await membresiaOCService.eliminar(idOc);
      toast.success('OC eliminada');
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
  };

  // ── HES Proveedor ─────────────────────────────────────
  const openHesModal = (oc, item = null) => {
    setParentItem(oc);
    setEditItem(item);
    setFormData(item ? {
      numeroHes:   item.numeroHes,
      descripcion: item.descripcion ?? '',
      importeUsd:  item.importeUsd  ?? '',
      importePen:  item.importePen  ?? '',
      fechaHes:    item.fechaHes    ?? '',
    } : { numeroHes: '', descripcion: '', importeUsd: '', importePen: '', fechaHes: '' });
    setShowHesModal(true);
  };

  const saveHes = async () => {
    try {
      setSaving(true);
      const payload = {
        idMembresiaOC: parentItem.idMembresiaOC,
        numeroHes:     formData.numeroHes,
        descripcion:   formData.descripcion || null,
        importeUsd:    parseFloat(formData.importeUsd) || null,
        importePen:    parseFloat(formData.importePen) || null,
        fechaHes:      formData.fechaHes || null,
      };
      if (editItem) {
        await membresiaHESService.editar(editItem.idMembresiaHes, payload);
        toast.success('HES actualizada correctamente');
      } else {
        await membresiaHESService.crear(payload);
        toast.success('HES registrada correctamente');
      }
      setShowHesModal(false);
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deleteHes = async (idHes) => {
    try {
      await membresiaHESService.eliminar(idHes);
      toast.success('HES eliminada');
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
  };

  // ── OC Cliente ────────────────────────────────────────
  const openOcClienteModal = (item = null) => {
    setEditItem(item);
    setFormData(item ? {
      codSapCliente:       item.codSapCliente       ?? '',
      empresaRefacturable: item.empresaRefacturable  ?? '',
      importeRefPen:       item.importeRefPen        ?? '',
      importeRefUsd:       item.importeRefUsd        ?? '',
    } : { codSapCliente: '', empresaRefacturable: '', importeRefPen: '', importeRefUsd: '' });
    setShowOcClienteModal(true);
  };

  const saveOcCliente = async () => {
    try {
      setSaving(true);
      const payload = {
        idMembresia:         parseInt(id),
        codSapCliente:       formData.codSapCliente       || null,
        empresaRefacturable: formData.empresaRefacturable  || null,
        importeRefPen:       parseFloat(formData.importeRefPen) || null,
        importeRefUsd:       parseFloat(formData.importeRefUsd) || null,
      };
      if (editItem) {
        await membresiaOCClienteService.editar(editItem.idMembresiaOcCliente, payload);
        toast.success('OC Cliente actualizada correctamente');
      } else {
        await membresiaOCClienteService.crear(payload);
        toast.success('OC Cliente registrada correctamente');
      }
      setShowOcClienteModal(false);
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  // ── HES Cliente ───────────────────────────────────────
  const openHesClienteModal = (ocCliente, item = null) => {
    setParentItem(ocCliente);
    setEditItem(item);
    setFormData(item ? {
      osClienteCsc:  item.osClienteCsc  ?? '',
      hesClienteCsc: item.hesClienteCsc ?? '',
      descripcion:   item.descripcion   ?? '',
      importeUsd:    item.importeUsd    ?? '',
      importePen:    item.importePen    ?? '',
      fechaHes:      item.fechaHes      ?? '',
    } : { osClienteCsc: '', hesClienteCsc: '', descripcion: '', importeUsd: '', importePen: '', fechaHes: '' });
    setShowHesClienteModal(true);
  };

  const saveHesCliente = async () => {
    try {
      setSaving(true);
      const payload = {
        idMembresiaOcCliente: parentItem.idMembresiaOcCliente,
        osClienteCsc:         formData.osClienteCsc  || null,
        hesClienteCsc:        formData.hesClienteCsc || null,
        descripcion:          formData.descripcion   || null,
        importeUsd:           parseFloat(formData.importeUsd) || null,
        importePen:           parseFloat(formData.importePen) || null,
        fechaHes:             formData.fechaHes || null,
      };
      if (editItem) {
        await membresiaHESClienteService.editar(editItem.idMembresiaHesCliente, payload);
        toast.success('HES Cliente actualizada correctamente');
      } else {
        await membresiaHESClienteService.crear(payload);
        toast.success('HES Cliente registrada correctamente');
      }
      setShowHesClienteModal(false);
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deleteHesCliente = async (idHes) => {
    try {
      await membresiaHESClienteService.eliminar(idHes);
      toast.success('HES Cliente eliminada');
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
  };

  // ── Facturación ───────────────────────────────────────
  const openFactModal = (hesCliente, item = null) => {
    setParentItem(hesCliente);
    setEditItem(item);
    setFormData(item ? {
      estadoCsc:     item.estadoCsc     ?? '',
      anioMesFac:    item.anioMesFac    ?? '',
      nroFacturaSap: item.nroFacturaSap ?? '',
      montoFactPen:  item.montoFactPen  ?? '',
      montoFactUsd:  item.montoFactUsd  ?? '',
    } : { estadoCsc: '', anioMesFac: '', nroFacturaSap: '', montoFactPen: '', montoFactUsd: '' });
    setShowFactModal(true);
  };

  const saveFact = async () => {
    try {
      setSaving(true);
      const payload = {
        idMembresiaOcCliente:  parentItem.idMembresiaOcCliente,
        idMembresiaHesCliente: parentItem.idMembresiaHesCliente,
        estadoCsc:             formData.estadoCsc     || null,
        anioMesFac:            formData.anioMesFac    || null,
        nroFacturaSap:         formData.nroFacturaSap || null,
        montoFactPen:          parseFloat(formData.montoFactPen) || null,
        montoFactUsd:          parseFloat(formData.montoFactUsd) || null,
      };
      if (editItem) {
        await membresiaFacturacionService.editar(editItem.idMembresiaFacturacion, payload);
        toast.success('Facturación actualizada correctamente');
      } else {
        await membresiaFacturacionService.crear(payload);
        toast.success('Facturación registrada correctamente');
      }
      setShowFactModal(false);
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deleteFact = async (idFact) => {
    try {
      await membresiaFacturacionService.eliminar(idFact);
      toast.success('Facturación eliminada');
      await cargarTodo();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (!membresia) return (
    <div className="content-wrapper"><p className="text-muted">Membresía no encontrada.</p></div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb title={`Detalle — ${membresia.codigoProyecto}`} subTitle1="Gestión" subTitle2="Membresías" />

      <div className="main-content">
        <Button variant="outline-secondary" size="sm" className="mb-3" onClick={() => navigate('/membresias')}>
          <FaArrowLeft size={11} className="me-1" /> Volver a membresías
        </Button>

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
                <h6 className="mb-0 fw-semibold font-monospace">{membresia.periodo ?? '—'}</h6>
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
            <Button size="sm" variant="outline-danger" onClick={() => openOcModal(null)}>
              <FaPlus size={10} className="me-1" /> Nueva OC
            </Button>
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
                      <Button size="sm" variant="outline-danger" onClick={() => openOcModal(oc)}>
                        <FaPen size={10} className="me-1" /> Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => deleteOc(oc.idMembresiaOC)}>
                        <FaTrash size={10} />
                      </Button>
                    </div>
                  </div>
                  <Row className="g-2 mb-3">
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>N° OC</div><div className="fw-semibold font-monospace">{oc.numeroOc ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Orden CO</div><div className="font-monospace">{ordenesCO.find(co => co.idOrdenCO === parseInt(oc.idOrdenCO))?.numeroCO ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Descripción CO</div><div>{oc.descripcionCo ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Solped</div><div className="font-monospace">{oc.solpedCompra ?? '—'}</div></Col>
                    <Col md={2}><div className="text-muted" style={{ fontSize: 11 }}>Importe USD</div><div className="fw-semibold">$ {oc.importeUsd ?? '—'}</div></Col>
                    <Col md={2}><div className="text-muted" style={{ fontSize: 11 }}>Importe PEN</div><div className="fw-semibold">S/ {oc.importePen ?? '—'}</div></Col>
                    <Col md={2}><div className="text-muted" style={{ fontSize: 11 }}>Estado</div><span className={`badge bg-${oc.estado === 'Activa' ? 'success' : 'secondary'}`}>{oc.estado}</span></Col>
                  </Row>

                  {/* HES Proveedor */}
                  <div style={{ borderTop: '1px solid #fca5a5', paddingTop: 10 }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <small className="fw-semibold text-uppercase" style={{ color: '#991b1b', fontSize: 10 }}>HES Proveedor</small>
                      <Button size="sm" variant="outline-danger" onClick={() => openHesModal(oc, null)}>
                        <FaPlus size={10} className="me-1" /> Agregar HES
                      </Button>
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
                              <td className="fw-semibold font-monospace" style={{ color: '#991b1b' }}>{h.numeroHes}</td>
                              <td className="text-muted">{h.descripcion ?? '—'}</td>
                              <td>$ {h.importeUsd ?? '—'}</td>
                              <td>S/ {h.importePen ?? '—'}</td>
                              <td className="text-muted">{h.fechaHes ?? '—'}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button size="sm" variant="outline-secondary" onClick={() => openHesModal(oc, h)}><FaPen size={10} /></Button>
                                  <Button size="sm" variant="outline-danger" onClick={() => deleteHes(h.idMembresiaHes)}><FaTrash size={10} /></Button>
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
            <Button size="sm" variant="outline-secondary" onClick={() => openOcClienteModal(null)}>
              <FaPlus size={10} className="me-1" /> Nueva OC Cliente
            </Button>
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
                    <Button size="sm" variant="outline-secondary" onClick={() => openOcClienteModal(occ)}>
                      <FaPen size={10} className="me-1" /> Editar
                    </Button>
                  </div>
                  <Row className="g-2 mb-3">
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Cod. SAP cliente</div><div className="fw-semibold font-monospace">{occ.codSapCliente ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Empresa refacturable</div><div>{occ.empresaRefacturable ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Importe ref. PEN</div><div className="fw-semibold">S/ {occ.importeRefPen ?? '—'}</div></Col>
                    <Col md={3}><div className="text-muted" style={{ fontSize: 11 }}>Importe ref. USD</div><div className="fw-semibold">$ {occ.importeRefUsd ?? '—'}</div></Col>
                  </Row>

                  {/* HES Cliente */}
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 10 }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <small className="fw-semibold text-uppercase" style={{ color: '#374151', fontSize: 10 }}>HES Cliente</small>
                      <Button size="sm" variant="outline-secondary" onClick={() => openHesClienteModal(occ, null)}>
                        <FaPlus size={10} className="me-1" /> Agregar HES
                      </Button>
                    </div>
                    {occ.hesClientes?.length === 0 ? (
                      <p className="text-muted small">Sin HES registradas.</p>
                    ) : (
                      occ.hesClientes?.map(h => (
                        <div key={h.idMembresiaHesCliente} className="mb-2 p-2 rounded"
                          style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-3">
                              <div><div className="text-muted" style={{ fontSize: 10 }}>OS Cliente CSC</div><span className="fw-semibold font-monospace small">{h.osClienteCsc ?? '—'}</span></div>
                              <div><div className="text-muted" style={{ fontSize: 10 }}>HES Cliente CSC</div><span className="fw-semibold font-monospace small" style={{ color: '#374151' }}>{h.hesClienteCsc ?? '—'}</span></div>
                              <div><div className="text-muted" style={{ fontSize: 10 }}>Fecha</div><span className="text-muted small">{h.fechaHes ?? '—'}</span></div>
                              <div><div className="text-muted" style={{ fontSize: 10 }}>USD</div><span className="small">$ {h.importeUsd ?? '—'}</span></div>
                              <div><div className="text-muted" style={{ fontSize: 10 }}>PEN</div><span className="small">S/ {h.importePen ?? '—'}</span></div>
                            </div>
                            <div className="d-flex gap-1">
                              <Button size="sm" variant="outline-secondary" onClick={() => openHesClienteModal(occ, h)}><FaPen size={10} /></Button>
                              <Button size="sm" variant="outline-danger" onClick={() => deleteHesCliente(h.idMembresiaHesCliente)}><FaTrash size={10} /></Button>
                            </div>
                          </div>

                          {/* Facturación */}
                          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <small className="text-uppercase fw-semibold" style={{ color: '#1e40af', fontSize: 10 }}>Facturación</small>
                              <Button size="sm" variant="outline-primary" onClick={() => openFactModal(h, null)}>
                                <FaPlus size={9} className="me-1" /> Nueva
                              </Button>
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
                                      <td className="font-monospace">{f.anioMesFac ?? '—'}</td>
                                      <td className="font-monospace fw-semibold">{f.nroFacturaSap ?? '—'}</td>
                                      <td>S/ {f.montoFactPen ?? '—'}</td>
                                      <td>$ {f.montoFactUsd ?? '—'}</td>
                                      <td>
                                        <div className="d-flex gap-1">
                                          <Button size="sm" variant="outline-secondary" onClick={() => openFactModal(h, f)}><FaPen size={9} /></Button>
                                          <Button size="sm" variant="outline-danger" onClick={() => deleteFact(f.idMembresiaFacturacion)}><FaTrash size={9} /></Button>
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
        <ModalHeader closeButton><ModalTitle>{editItem ? 'Editar OC Proveedor' : 'Nueva OC Proveedor'}</ModalTitle></ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="small fw-semibold">Orden CO (cargado a)</Form.Label>
              <Form.Control name="numeroCO" value={formData.numeroCO ?? ''}
                onChange={(e) => { handleChange(e); setValidacionCO(null); }}
                onBlur={validarOrdenCO} placeholder="Ej: 10000026702"
                isValid={validacionCO === 'ok'} isInvalid={validacionCO === 'notfound'}/>
              {checkingCO && <small className="text-muted">Verificando...</small>}
              {validacionCO === 'ok' && <div className="text-success small mt-1">✓ Orden CO encontrada</div>}
              {validacionCO === 'notfound' && (
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <span className="text-danger small">✗ No existe en el catálogo</span>
                    <Button size="sm" variant="outline-primary" onClick={crearNuevaCO}>+ Crear</Button>
                  </div>
                )}
            </Col>
            <Col md={6}><Form.Label className="small fw-semibold">N° OC</Form.Label>
              <Form.Control name="numeroOc" value={formData.numeroOc ?? ''} onChange={handleChange} placeholder="Ej: 4500254836"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Descripción CO</Form.Label>
              <Form.Control name="descripcionCo" value={formData.descripcionCo ?? ''} onChange={handleChange} placeholder="Ej: PRTIC - RMS Membresía RMS 2025"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Solped de compra</Form.Label>
              <Form.Control name="solpedCompra" value={formData.solpedCompra ?? ''} onChange={handleChange} placeholder="Ej: 0010077810"/></Col>
            <Col md={3}><Form.Label className="small fw-semibold">Importe USD</Form.Label>
              <Form.Control type="number" name="importeUsd" value={formData.importeUsd ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label className="small fw-semibold">Importe PEN</Form.Label>
              <Form.Control type="number" name="importePen" value={formData.importePen ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label className="small fw-semibold">Estado</Form.Label>
              <Form.Select name="estado" value={formData.estado ?? 'Activa'} onChange={handleChange}>
                <option value="Activa">Activa</option>
                <option value="Cerrada">Cerrada</option>
                <option value="Anulada">Anulada</option>
              </Form.Select>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => setShowOcModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={saveOc} disabled={saving}>{saving ? 'Guardando...' : editItem ? 'Guardar' : 'Registrar'}</Button>
        </ModalFooter>
      </Modal>

      {/* ═══ MODAL HES PROVEEDOR ═══ */}
      <Modal show={showHesModal} onHide={() => setShowHesModal(false)} centered>
        <ModalHeader closeButton><ModalTitle>{editItem ? 'Editar HES' : 'Nueva HES'}</ModalTitle></ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col md={6}><Form.Label className="small fw-semibold">N° HES *</Form.Label>
              <Form.Control name="numeroHes" value={formData.numeroHes ?? ''} onChange={handleChange} placeholder="Ej: 1000081760"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Fecha</Form.Label>
              <Form.Control type="date" name="fechaHes" value={formData.fechaHes ?? ''} onChange={handleChange}/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Importe USD</Form.Label>
              <Form.Control type="number" name="importeUsd" value={formData.importeUsd ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Importe PEN</Form.Label>
              <Form.Control type="number" name="importePen" value={formData.importePen ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={12}><Form.Label className="small fw-semibold">Descripción</Form.Label>
              <Form.Control name="descripcion" value={formData.descripcion ?? ''} onChange={handleChange} placeholder="Descripción"/></Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => setShowHesModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={saveHes} disabled={saving}>{saving ? 'Guardando...' : editItem ? 'Guardar' : 'Registrar'}</Button>
        </ModalFooter>
      </Modal>

      {/* ═══ MODAL OC CLIENTE ═══ */}
      <Modal show={showOcClienteModal} onHide={() => setShowOcClienteModal(false)} centered>
        <ModalHeader closeButton><ModalTitle>{editItem ? 'Editar OC Cliente' : 'Nueva OC Cliente'}</ModalTitle></ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col md={6}><Form.Label className="small fw-semibold">Cod. SAP cliente</Form.Label>
              <Form.Control name="codSapCliente" value={formData.codSapCliente ?? ''} onChange={handleChange} placeholder="Ej: 200000014"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Empresa refacturable</Form.Label>
              <Form.Control name="empresaRefacturable" value={formData.empresaRefacturable ?? ''} onChange={handleChange} placeholder="Ej: R010 - El S.A."/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Importe ref. PEN</Form.Label>
              <Form.Control type="number" name="importeRefPen" value={formData.importeRefPen ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Importe ref. USD</Form.Label>
              <Form.Control type="number" name="importeRefUsd" value={formData.importeRefUsd ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => setShowOcClienteModal(false)}>Cancelar</Button>
          <Button variant="secondary" onClick={saveOcCliente} disabled={saving}>{saving ? 'Guardando...' : editItem ? 'Guardar' : 'Registrar'}</Button>
        </ModalFooter>
      </Modal>

      {/* ═══ MODAL HES CLIENTE ═══ */}
      <Modal show={showHesClienteModal} onHide={() => setShowHesClienteModal(false)} centered>
        <ModalHeader closeButton><ModalTitle>{editItem ? 'Editar HES Cliente' : 'Nueva HES Cliente'}</ModalTitle></ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col md={6}><Form.Label className="small fw-semibold">OS del Cliente a CSC</Form.Label>
              <Form.Control name="osClienteCsc" value={formData.osClienteCsc ?? ''} onChange={handleChange} placeholder="Ej: 4500254859"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">HES del Cliente a CSC</Form.Label>
              <Form.Control name="hesClienteCsc" value={formData.hesClienteCsc ?? ''} onChange={handleChange} placeholder="Ej: 200080774"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Fecha</Form.Label>
              <Form.Control type="date" name="fechaHes" value={formData.fechaHes ?? ''} onChange={handleChange}/></Col>
            <Col md={3}><Form.Label className="small fw-semibold">Importe USD</Form.Label>
              <Form.Control type="number" name="importeUsd" value={formData.importeUsd ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={3}><Form.Label className="small fw-semibold">Importe PEN</Form.Label>
              <Form.Control type="number" name="importePen" value={formData.importePen ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={12}><Form.Label className="small fw-semibold">Descripción</Form.Label>
              <Form.Control name="descripcion" value={formData.descripcion ?? ''} onChange={handleChange} placeholder="Descripción"/></Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => setShowHesClienteModal(false)}>Cancelar</Button>
          <Button variant="secondary" onClick={saveHesCliente} disabled={saving}>{saving ? 'Guardando...' : editItem ? 'Guardar' : 'Registrar'}</Button>
        </ModalFooter>
      </Modal>

      {/* ═══ MODAL FACTURACIÓN ═══ */}
      <Modal show={showFactModal} onHide={() => setShowFactModal(false)} centered>
        <ModalHeader closeButton><ModalTitle>{editItem ? 'Editar facturación' : 'Nueva facturación'}</ModalTitle></ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col md={6}><Form.Label className="small fw-semibold">Estado CSC</Form.Label>
              <Form.Select name="estadoCsc" value={formData.estadoCsc ?? ''} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                <option value="0. No Iniciado">0. No Iniciado</option>
                <option value="1. En revisión">1. En revisión</option>
                <option value="2. Aprobado">2. Aprobado</option>
                <option value="3. Enviado">3. Enviado</option>
                <option value="4. En proceso">4. En proceso</option>
                <option value="5. Pendiente">5. Pendiente</option>
                <option value="6. Facturado">6. Facturado</option>
              </Form.Select>
            </Col>
            <Col md={6}><Form.Label className="small fw-semibold">Año/Mes facturación</Form.Label>
              <Form.Control name="anioMesFac" value={formData.anioMesFac ?? ''} onChange={handleChange} placeholder="YYYYMM"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Nro. Factura SAP</Form.Label>
              <Form.Control name="nroFacturaSap" value={formData.nroFacturaSap ?? ''} onChange={handleChange} placeholder="Ej: 91573764"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Monto fact. PEN</Form.Label>
              <Form.Control type="number" name="montoFactPen" value={formData.montoFactPen ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
            <Col md={6}><Form.Label className="small fw-semibold">Monto fact. USD</Form.Label>
              <Form.Control type="number" name="montoFactUsd" value={formData.montoFactUsd ?? ''} onChange={handleChange} placeholder="0.00"/></Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => setShowFactModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={saveFact} disabled={saving}>{saving ? 'Guardando...' : editItem ? 'Guardar' : 'Registrar'}</Button>
        </ModalFooter>
      </Modal>

    </div>
  );
};

export default DetalleMembresia;
