import { useState, useEffect, useMemo } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getExpandedRowModel,
} from '@tanstack/react-table';
import { Row, Col, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import SearchableSelect from '@/components/SearchableSelect';
import { toast } from 'react-toastify';
import { FaChevronRight, FaChevronDown, FaPlus, FaPen, FaTrash, FaBell } from 'react-icons/fa6';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import ConfirmModal from '@/components/modals/ConfirmModal';

import { notificacionesService } from '@/services/notificaciones.service';

const columnHelper = createColumnHelper();

// ── Status badges ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <Badge bg={status === 1 ? 'success' : 'secondary'} className="px-2">
    {status === 1 ? 'Activo' : 'Inactivo'}
  </Badge>
);

// ── Process Modal ──────────────────────────────────────────────────────────────
function ProcessModal({ show, onHide, onSave, proceso, saving }) {
  const isEdit = !!proceso;
  const emptyForm = {
    NameProcess: '', Description: '', Mode: '', DestinationType: '', ProcessStatus: 1,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (proceso) {
      setForm({
        NameProcess:     proceso.nameProcess     || '',
        Description:     proceso.description     || '',
        Mode:            proceso.mode            || '',
        DestinationType: proceso.destinationType || '',
        ProcessStatus:   proceso.processStatus   ?? 1,
      });
    } else {
      setForm(emptyForm);
    }
  }, [proceso, show]);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'number' ? Number(value) : value });
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const inputStyle = {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #ced4da',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
  };

  const labelStyle = { fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block', color: '#374151' };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 16 }}>{isEdit ? 'Editar' : 'Nuevo'} Proceso de Notificación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={8}>
              <label style={labelStyle}>Nombre del proceso *</label>
              <input
                style={inputStyle}
                name="NameProcess"
                value={form.NameProcess}
                onChange={onChange}
                required
                placeholder="Ej: Envío facturación mensual"
              />
            </Col>
            <Col md={4}>
              <label style={labelStyle}>Modo</label>
              <input
                style={inputStyle}
                name="Mode"
                value={form.Mode}
                onChange={onChange}
                placeholder="Ej: EMAIL"
                maxLength={5}
              />
            </Col>
            <Col md={12}>
              <label style={labelStyle}>Descripción</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical' }}
                name="Description"
                value={form.Description}
                onChange={onChange}
                rows={3}
                maxLength={350}
              />
            </Col>
            <Col md={6}>
              <label style={labelStyle}>Tipo de destino</label>
              <input
                style={inputStyle}
                name="DestinationType"
                value={form.DestinationType}
                onChange={onChange}
                placeholder="Ej: CORREO, SMS"
                maxLength={50}
              />
            </Col>
            <Col md={6}>
              <label style={labelStyle}>Estado</label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn btn-sm flex-fill ${form.ProcessStatus === 1 ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setForm({ ...form, ProcessStatus: 1 })}
                >
                  Activo
                </button>
                <button
                  type="button"
                  className={`btn btn-sm flex-fill ${form.ProcessStatus === 0 ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => setForm({ ...form, ProcessStatus: 0 })}
                >
                  Inactivo
                </button>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

// ── Detail Modal ───────────────────────────────────────────────────────────────
function DetailModal({ show, onHide, onSave, detalle, saving }) {
  const isEdit = !!detalle;
  const emptyForm = {
    Name: '', Email: '', Company: '', DestinationType: '', Destination: '', Status: 1,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (detalle) {
      setForm({
        Name:            detalle.name            || '',
        Email:           detalle.email           || '',
        Company:         detalle.company         || '',
        DestinationType: detalle.destinationType || '',
        Destination:     detalle.destination     || '',
        Status:          detalle.status          ?? 1,
      });
    } else {
      setForm(emptyForm);
    }
  }, [detalle, show]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const inputStyle = {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #ced4da',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
  };

  const labelStyle = { fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block', color: '#374151' };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 16 }}>{isEdit ? 'Editar' : 'Nuevo'} Destinatario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <label style={labelStyle}>Nombre *</label>
              <input
                style={inputStyle}
                name="Name"
                value={form.Name}
                onChange={onChange}
                required
                maxLength={50}
              />
            </Col>
            <Col md={6}>
              <label style={labelStyle}>Empresa</label>
              <input
                style={inputStyle}
                name="Company"
                value={form.Company}
                onChange={onChange}
                maxLength={10}
              />
            </Col>
            <Col md={12}>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                type="email"
                name="Email"
                value={form.Email}
                onChange={onChange}
                maxLength={200}
              />
            </Col>
            <Col md={6}>
              <label style={labelStyle}>Tipo de destino</label>
              <input
                style={inputStyle}
                name="DestinationType"
                value={form.DestinationType}
                onChange={onChange}
                maxLength={50}
              />
            </Col>
            <Col md={6}>
              <label style={labelStyle}>Destino</label>
              <input
                style={inputStyle}
                name="Destination"
                value={form.Destination}
                onChange={onChange}
                maxLength={20}
              />
            </Col>
            <Col md={12}>
              <label style={labelStyle}>Estado</label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn btn-sm flex-fill ${form.Status === 1 ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setForm({ ...form, Status: 1 })}
                >
                  Activo
                </button>
                <button
                  type="button"
                  className={`btn btn-sm flex-fill ${form.Status === 0 ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => setForm({ ...form, Status: 0 })}
                >
                  Inactivo
                </button>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

// ── Detail inner table ─────────────────────────────────────────────────────────
function DetalleTabla({ processId, onAdd }) {
  const [detalles, setDetalles] = useState([]);
  const [loadingDet, setLoadingDet] = useState(true);

  const [showDetModal, setShowDetModal] = useState(false);
  const [showDelDet, setShowDelDet] = useState(false);
  const [selectedDet, setSelectedDet] = useState(null);
  const [savingDet, setSavingDet] = useState(false);

  const cargarDetalles = async () => {
    try {
      setLoadingDet(true);
      const res = await notificacionesService.listarDetalle(processId);
      setDetalles(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error('Error cargando destinatarios: ' + err.message);
    } finally {
      setLoadingDet(false);
    }
  };

  useEffect(() => { cargarDetalles(); }, [processId]);

  const handleSaveDet = async (formData) => {
    try {
      setSavingDet(true);
      if (selectedDet) {
        await notificacionesService.actualizarDetalle(processId, selectedDet.item, formData);
        toast.success('Destinatario actualizado');
      } else {
        await notificacionesService.crearDetalle(processId, formData);
        toast.success('Destinatario agregado');
      }
      setShowDetModal(false);
      setSelectedDet(null);
      await cargarDetalles();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingDet(false);
    }
  };

  const handleDeleteDet = async () => {
    try {
      await notificacionesService.eliminarDetalle(processId, selectedDet.item);
      toast.success('Destinatario eliminado');
      setShowDelDet(false);
      setSelectedDet(null);
      await cargarDetalles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loadingDet) return <div className="p-3 text-center"><Spinner size="sm" /></div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-semibold" style={{ fontSize: 13, color: '#374151' }}>
          Destinatarios ({detalles.length})
        </span>
        <Button size="sm" variant="outline-primary" onClick={() => { setSelectedDet(null); setShowDetModal(true); }}>
          <FaPlus size={11} className="me-1" /> Agregar destinatario
        </Button>
      </div>

      {detalles.length === 0 ? (
        <p className="text-muted text-center py-3" style={{ fontSize: 13 }}>Sin destinatarios registrados</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-bordered mb-0" style={{ fontSize: 12 }}>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Empresa</th>
                <th>Tipo destino</th>
                <th>Destino</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map(d => (
                <tr key={d.item}>
                  <td className="text-muted">{d.item}</td>
                  <td>{d.name || '—'}</td>
                  <td>{d.email || '—'}</td>
                  <td>{d.company || '—'}</td>
                  <td>{d.destinationType || '—'}</td>
                  <td>{d.destination || '—'}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button size="sm" variant="outline-secondary" title="Editar"
                        onClick={() => { setSelectedDet(d); setShowDetModal(true); }}>
                        <FaPen size={11} />
                      </Button>
                      <Button size="sm" variant="outline-danger" title="Eliminar"
                        onClick={() => { setSelectedDet(d); setShowDelDet(true); }}>
                        <FaTrash size={11} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DetailModal
        show={showDetModal}
        onHide={() => { setShowDetModal(false); setSelectedDet(null); }}
        onSave={handleSaveDet}
        detalle={selectedDet}
        saving={savingDet}
      />

      <ConfirmModal
        show={showDelDet}
        title="Eliminar destinatario"
        message={`¿Eliminar el destinatario "${selectedDet?.name}"? Esta acción es permanente.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeleteDet}
        onCancel={() => { setShowDelDet(false); setSelectedDet(null); }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const GestionNotificaciones = () => {
  const [data, setData]     = useState([]);
  const [resumen, setResumen] = useState({ total: 0, activos: 0, inactivos: 0, totalDestinatarios: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const [filtros, setFiltros] = useState({ buscar: '', status: '', mode: '', destinationType: '' });
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 });
  const [expanded, setExpanded]         = useState({});
  const [showFilters, setShowFilters]   = useState(false);

  const [showProcModal, setShowProcModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected]             = useState(null);

  // ── Carga ──────────────────────────────────────────────────────────────────
  const cargar = async () => {
    try {
      setLoading(true);
      const [list, res] = await Promise.all([
        notificacionesService.listar({}),
        notificacionesService.resumen(),
      ]);
      setData(Array.isArray(list) ? list : []);
      if (res) setResumen(res);
    } catch (err) {
      toast.error('Error al cargar notificaciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // ── Filtrado client-side ───────────────────────────────────────────────────
  const dataFiltrada = useMemo(() => {
    return data.filter(row => {
      if (filtros.status !== '' && String(row.processStatus) !== String(filtros.status)) return false;
      if (filtros.mode && row.mode !== filtros.mode) return false;
      if (filtros.destinationType && row.destinationType !== filtros.destinationType) return false;
      if (filtros.buscar) {
        const b = filtros.buscar.toLowerCase();
        const matchName = row.nameProcess?.toLowerCase().includes(b);
        const matchDesc = row.description?.toLowerCase().includes(b);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [data, filtros]);

  // Opciones dinámicas desde datos
  const modeOptions = useMemo(() =>
    [...new Set(data.map(d => d.mode).filter(Boolean))].sort().map(v => ({ value: v, label: v })),
    [data]);

  const destTypeOptions = useMemo(() =>
    [...new Set(data.map(d => d.destinationType).filter(Boolean))].sort().map(v => ({ value: v, label: v })),
    [data]);

  const filtrosActivos = [filtros.status, filtros.mode, filtros.destinationType].filter(v => v !== '').length;

  // ── Columnas ───────────────────────────────────────────────────────────────
  const columns = [
    columnHelper.display({
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <Button size="sm" variant="link" className="p-0 text-primary"
          onClick={() => row.toggleExpanded()}>
          {row.getIsExpanded() ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
        </Button>
      ),
    }),
    columnHelper.accessor('process', {
      header: 'ID',
      cell: ({ row }) => <span className="fw-semibold text-primary">#{row.original.process}</span>,
    }),
    columnHelper.accessor('nameProcess', {
      header: 'Nombre del proceso',
      cell: ({ row }) => row.original.nameProcess || <span className="text-muted">—</span>,
    }),
    columnHelper.accessor('mode', {
      header: 'Modo',
      cell: ({ row }) => row.original.mode
        ? <Badge bg="info" text="dark" className="px-2">{row.original.mode}</Badge>
        : <span className="text-muted">—</span>,
    }),
    columnHelper.accessor('destinationType', {
      header: 'Tipo destino',
      cell: ({ row }) => row.original.destinationType || <span className="text-muted">—</span>,
    }),
    columnHelper.accessor('processStatus', {
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.original.processStatus} />,
    }),
    columnHelper.accessor('creationDate', {
      header: 'Fecha creación',
      cell: ({ row }) => row.original.creationDate
        ? new Date(row.original.creationDate).toLocaleDateString('es-PE')
        : <span className="text-muted">—</span>,
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-secondary" title="Editar"
            onClick={() => { setSelected(row.original); setShowProcModal(true); }}>
            <FaPen size={12} />
          </Button>
          <Button size="sm" variant="outline-danger" title="Desactivar"
            onClick={() => { setSelected(row.original); setShowDeleteModal(true); }}>
            <FaTrash size={12} />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: dataFiltrada,
    columns,
    state: { globalFilter, pagination, expanded },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: 'includesString',
  });

  const pageIndex  = table.getState().pagination.pageIndex;
  const pageSize   = table.getState().pagination.pageSize;
  const totalItems = table.getFilteredRowModel().rows.length;
  const start      = pageIndex * pageSize + 1;
  const end        = Math.min(start + pageSize - 1, totalItems);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSaveProcess = async (formData) => {
    try {
      setSaving(true);
      if (selected) {
        await notificacionesService.actualizar(selected.process, formData);
        toast.success(`Proceso "${formData.NameProcess}" actualizado`);
      } else {
        await notificacionesService.crear(formData);
        toast.success(`Proceso "${formData.NameProcess}" creado`);
      }
      setShowProcModal(false);
      setSelected(null);
      await cargar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await notificacionesService.eliminar(selected.process);
      toast.success(`Proceso "${selected.nameProcess}" desactivado`);
      setShowDeleteModal(false);
      setSelected(null);
      await cargar();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión de Notificaciones"
        subTitle1="Configuración"
        subTitle2="Notificaciones"
        subText="Gestión de procesos de notificación y sus destinatarios."
      />

      <div className="main-content">
        {/* KPIs */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Total Procesos
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#185FA5', fontSize: 32 }}>{resumen.total}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 600 }}>
                    registrados
                  </Badge>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Activos
                </p>
                <h2 className="mb-1 fw-bold text-success" style={{ fontSize: 32 }}>{resumen.activos}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 600 }}>
                    {resumen.total > 0 ? Math.round((resumen.activos / resumen.total) * 100) : 0}%
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>del total</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Inactivos
                </p>
                <h2 className="mb-1 fw-bold text-secondary" style={{ fontSize: 32 }}>{resumen.inactivos}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#f3f4f6', color: '#374151', fontSize: 10, fontWeight: 600 }}>
                    {resumen.total > 0 ? Math.round((resumen.inactivos / resumen.total) * 100) : 0}%
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>deshabilitados</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Total Destinatarios
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#0891b2', fontSize: 32 }}>{resumen.totalDestinatarios}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: 10, fontWeight: 600 }}>
                    configurados
                  </Badge>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Toolbar */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2 px-3">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={4}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="ri-search-line text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Buscar nombre o descripción..."
                    value={filtros.buscar}
                    onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                  />
                  {filtros.buscar && (
                    <button className="btn btn-outline-secondary" type="button"
                      onClick={() => setFiltros({ ...filtros, buscar: '' })}>✕</button>
                  )}
                </div>
              </Col>
              <Col xs="auto" className="ms-auto d-flex gap-2">
                <Button variant={showFilters ? 'primary' : 'outline-secondary'} size="sm"
                  onClick={() => setShowFilters(!showFilters)}>
                  <i className="ri-filter-3-line me-1"></i> Filtros
                  {filtrosActivos > 0 && <Badge bg="light" text="dark" className="ms-2">{filtrosActivos}</Badge>}
                </Button>
                <Button variant="outline-primary" size="sm" onClick={cargar}>
                  <i className="ri-refresh-line me-1"></i> Actualizar
                </Button>
                <Button variant="primary" size="sm" onClick={() => { setSelected(null); setShowProcModal(true); }}>
                  <FaPlus size={12} className="me-1" /> Nuevo proceso
                </Button>
              </Col>
            </Row>

            {/* Filtros colapsables */}
            {showFilters && (
              <div className="mt-3 pt-3 border-top">
                <Row className="g-2">
                  <Col xs={12} sm={6} md={3}>
                    <label className="form-label small text-muted mb-1">Estado</label>
                    <SearchableSelect
                      value={filtros.status}
                      onChange={v => setFiltros({ ...filtros, status: v })}
                      options={[{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }]}
                      placeholder="Todos los estados"
                    />
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <label className="form-label small text-muted mb-1">Modo</label>
                    <SearchableSelect
                      value={filtros.mode}
                      onChange={v => setFiltros({ ...filtros, mode: v })}
                      options={modeOptions}
                      placeholder="Todos los modos"
                    />
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <label className="form-label small text-muted mb-1">Tipo de destino</label>
                    <SearchableSelect
                      value={filtros.destinationType}
                      onChange={v => setFiltros({ ...filtros, destinationType: v })}
                      options={destTypeOptions}
                      placeholder="Todos los tipos"
                    />
                  </Col>
                  <Col xs={12}>
                    <div className="d-flex justify-content-end mt-2">
                      <Button variant="link" size="sm" className="text-muted"
                        onClick={() => setFiltros({ ...filtros, status: '', mode: '', destinationType: '' })}>
                        Limpiar filtros
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <DataTable
              table={table}
              emptyMessage="No se encontraron procesos de notificación"
              renderSubComponent={({ row }) => (
                <DetalleTabla processId={row.original.process} />
              )}
            />
            <div className="p-3 border-top">
              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="procesos" showInfo
                previousPage={table.previousPage} canPreviousPage={table.getCanPreviousPage()}
                pageCount={table.getPageCount()} pageIndex={pageIndex}
                setPageIndex={table.setPageIndex} nextPage={table.nextPage}
                canNextPage={table.getCanNextPage()} pageSize={pageSize}
                onPageSizeChange={table.setPageSize} showPageLimit
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProcessModal
        show={showProcModal}
        onHide={() => { setShowProcModal(false); setSelected(null); }}
        onSave={handleSaveProcess}
        proceso={selected}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        title="Desactivar proceso"
        message={`¿Desactivar el proceso "${selected?.nameProcess}"? El registro quedará inactivo.`}
        confirmText="Sí, desactivar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteModal(false); setSelected(null); }}
      />
    </div>
  );
};

export default GestionNotificaciones;
