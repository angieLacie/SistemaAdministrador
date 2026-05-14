import { useState, useEffect } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { Row, Col, Button, Badge, Form, Spinner, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';
import SearchableSelect from '@/components/SearchableSelect';
import { toast } from 'react-toastify';
import { FaPlus, FaPen, FaTrash, FaClockRotateLeft } from 'react-icons/fa6';

import DataTable from '@/components/table/DataTable';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import { c4SalesService } from '@/services/c4sales.service';

const columnHelper = createColumnHelper();

const EstadoBadge = ({ estado }) => {
  const esActivo = estado === 'Activo';
  return (
    <Badge bg={esActivo ? 'success' : 'secondary'}>{estado}</Badge>
  );
};

const GestionC4Sales = () => {
  const [data, setData]           = useState([]);
  const [resumen, setResumen]     = useState({ total: 0, personalActivo: 0, licenciaActiva: 0, inactivos: 0 });
  const [loading, setLoading]     = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchText, setSearchText]     = useState('');
  const [filterEstadoP, setFilterEstadoP] = useState('');
  const [filterEstadoL, setFilterEstadoL] = useState('');

  // Modals
  const [showModal, setShowModal]             = useState(false);
  const [showCambioModal, setShowCambioModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selected, setSelected]               = useState(null);
  const [historial, setHistorial]             = useState([]);
  const [formData, setFormData]               = useState({});
  const [cambioData, setCambioData]           = useState({});
  const [saving, setSaving]                   = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [lista, res] = await Promise.all([
        c4SalesService.listar({ estadoPersonal: filterEstadoP, estadoLicencia: filterEstadoL }),
        c4SalesService.resumen(),
      ]);
      setData(lista);
      setResumen(res);
    } catch (err) {
      toast.error('Error al cargar C4 Sales: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [filterEstadoP, filterEstadoL]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCambioChange = (e) => setCambioData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Modal crear/editar ────────────────────────────────
  const openModal = (item = null) => {
    setSelected(item);
    setFormData(item ? {
      usuario:        item.usuario        ?? '',
      nombreActual:   item.nombreActual   ?? '',
      estadoPersonal: item.estadoPersonal ?? 'Activo',
      estadoLicencia: item.estadoLicencia ?? 'Activo',
      anioInicio:     item.anioInicio     ?? '',
    } : { usuario: '', nombreActual: '', estadoPersonal: 'Activo', estadoLicencia: 'Activo', anioInicio: '' });
    setShowModal(true);
  };

  const save = async () => {
    try {
      setSaving(true);
      if (selected) {
        await c4SalesService.editar(selected.idC4, formData);
        toast.success('Registro actualizado correctamente');
      } else {
        await c4SalesService.crear(formData);
        toast.success('Registro creado correctamente');
      }
      setShowModal(false);
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  // ── Modal cambio personal ─────────────────────────────
  const openCambioModal = (item) => {
    setSelected(item);
    setCambioData({ usuarioNuevo: '', nombreNuevo: '', motivo: '', realizadoPor: '' }); // ← agregar usuarioNuevo
    setShowCambioModal(true);
  };

  const saveCambio = async () => {
    try {
      setSaving(true);
      await c4SalesService.cambiarPersonal(selected.idC4, cambioData);
      toast.success('Personal cambiado correctamente');
      setShowCambioModal(false);
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  // ── Modal historial ───────────────────────────────────
  const openHistorial = async (item) => {
    setSelected(item);
    try {
      const h = await c4SalesService.historial(item.idC4);
      setHistorial(h);
      setShowHistorialModal(true);
    } catch (err) { toast.error(err.message); }
  };

  // ── Eliminar ──────────────────────────────────────────
  const eliminar = async () => {
    try {
      await c4SalesService.eliminar(selected.idC4);
      toast.success('Registro eliminado');
      setShowDeleteModal(false);
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  const columns = [
    columnHelper.accessor('usuario', {
      header: 'Usuario',
      cell: ({ getValue }) => <span className="fw-semibold font-monospace" style={{ color: '#185FA5' }}>{getValue()}</span>,
    }),
    columnHelper.accessor('nombreActual', {
      header: 'Personal actual',
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor('nombreAnterior', {
      header: 'Personal anterior',
      cell: ({ getValue }) => <span className="text-muted">{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('estadoPersonal', {
      header: 'Estado personal',
      cell: ({ getValue }) => <EstadoBadge estado={getValue()} />,
    }),
    columnHelper.accessor('estadoLicencia', {
      header: 'Estado licencia',
      cell: ({ getValue }) => <EstadoBadge estado={getValue()} />,
    }),
    columnHelper.accessor('anioInicio', {
      header: 'Año inicio',
      cell: ({ getValue }) => <span className="font-monospace">{getValue() ?? '—'}</span>,
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-info" title="Historial"
            onClick={() => openHistorial(row.original)}>
            <FaClockRotateLeft size={12} />
          </Button>
          <Button size="sm" variant="outline-success" title="Cambiar personal"
            onClick={() => openCambioModal(row.original)}>
            <span style={{ fontSize: 12 }}>👤</span>
          </Button>
          <Button size="sm" variant="outline-secondary" title="Editar"
            onClick={() => openModal(row.original)}>
            <FaPen size={12} />
          </Button>
          <Button size="sm" variant="outline-danger" title="Eliminar"
            onClick={() => { setSelected(row.original); setShowDeleteModal(true); }}>
            <FaTrash size={12} />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión C4 Sales"
        subTitle1="Administración"
        subTitle2="C4 Sales"
        subText="Control de licencias C4 Sales por usuario."
      />

      <div className="main-content">
        {/* KPIs */} 
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Total usuarios
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#185FA5', fontSize: 32 }}>{resumen.total}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 600 }}>
                    {resumen.total} usuarios
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>registrados</span>
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
                <h2 className="mb-1 fw-bold text-success" style={{ fontSize: 32 }}>{resumen.personalActivo}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 600 }}>
                    {resumen.total > 0 ? Math.round((resumen.personalActivo / resumen.total) * 100) : 0}%
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
                  Licencias activas
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#a855f7', fontSize: 32 }}>{resumen.licenciaActiva}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', fontSize: 10, fontWeight: 600 }}>
                    {resumen.total > 0 ? Math.round((resumen.licenciaActiva / resumen.total) * 100) : 0}%
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>del total</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
         
        
        <Row>
          <Col lg={12}>
            <div className="st-wrapper">

              {/* Toolbar */}
              <div className="st-toolbar row mb-3 g-2 align-items-center">
                <Col xs={12} sm={6} lg={3}>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text px-2">
                      <svg width={14} height={14}><use href="/icons/sprite.svg#search"></use></svg>
                    </span>
                    <input type="text" className="form-control"
                      placeholder="Buscar usuario, personal..."
                      value={searchText}
                      onChange={e => { setSearchText(e.target.value); setGlobalFilter(e.target.value); }}
                      autoComplete="off"/>
                    {searchText && (
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => { setSearchText(''); setGlobalFilter(''); }}>✕</button>
                    )}
                  </div>
                </Col>
                <Col xs={6} sm={3} lg={2}>
                  <SearchableSelect value={filterEstadoP} onChange={setFilterEstadoP} options={['Activo','Inactivo']} placeholder="Estado personal" />
                </Col>
                <Col xs={6} sm={3} lg={2}>
                  <SearchableSelect value={filterEstadoL} onChange={setFilterEstadoL} options={['Activo','Inactivo']} placeholder="Estado licencia" />
                </Col>
                <Col className="d-flex justify-content-end">
                  <Button variant="primary" size="sm" onClick={() => openModal(null)}>
                    <FaPlus size={11} className="me-1" /> Nuevo registro
                  </Button>
                </Col>
              </div>

              {/* Tabla */}
              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover table-sm align-middle" style={{ fontSize: 13 }}>
                      <thead className="table-light">
                        {table.getHeaderGroups().map(hg => (
                          <tr key={hg.id}>
                            {hg.headers.map(h => (
                              <th key={h.id} className="fw-semibold text-muted" style={{ fontSize: 11 }}>
                                {flexRender(h.column.columnDef.header, h.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                          <tr><td colSpan={7} className="text-center text-muted py-4">No se encontraron registros</td></tr>
                        ) : table.getRowModel().rows.map(row => (
                          <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <div className="d-flex align-items-center gap-2">
                      <Form.Select size="sm" style={{ width: 70 }}
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}>
                        {[10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                      </Form.Select>
                      <small className="text-muted">
                        Mostrando {table.getRowModel().rows.length} de {data.length} registros
                      </small>
                    </div>
                    <div className="d-flex gap-1">
                      <Button variant="outline-secondary" size="sm" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>«</Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</Button>
                      {Array.from({ length: table.getPageCount() }, (_, i) => (
                        <Button key={i} size="sm"
                          variant={table.getState().pagination.pageIndex === i ? 'primary' : 'outline-secondary'}
                          onClick={() => table.setPageIndex(i)}>{i + 1}</Button>
                      ))}
                      <Button variant="outline-secondary" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>»</Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* MODAL CREAR / EDITAR */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <ModalHeader closeButton>
          <ModalTitle>{selected ? `Editar — ${selected.usuario}` : 'Nuevo registro C4 Sales'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="small fw-semibold">Usuario *</Form.Label>
              <Form.Control name="usuario" value={formData.usuario ?? ''}
                onChange={handleChange} placeholder="Ej: CGARCIA"
                disabled={!!selected}/>
            </Col>
            <Col md={6}>
              <Form.Label className="small fw-semibold">Año inicio</Form.Label>
              <Form.Control name="anioInicio" value={formData.anioInicio ?? ''}
                onChange={handleChange} placeholder="Ej: 202604"/>
            </Col>
            <Col md={12}>
              <Form.Label className="small fw-semibold">Personal actual</Form.Label>
              <Form.Control name="nombreActual" value={formData.nombreActual ?? ''}
                onChange={handleChange} placeholder="Nombre completo"/>
            </Col>
            <Col md={6}>
              <Form.Label className="small fw-semibold">Estado personal</Form.Label>
              <Form.Select name="estadoPersonal" value={formData.estadoPersonal ?? 'Activo'} onChange={handleChange}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label className="small fw-semibold">Estado licencia</Form.Label>
              <Form.Select name="estadoLicencia" value={formData.estadoLicencia ?? 'Activo'} onChange={handleChange}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </Form.Select>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? 'Guardando...' : selected ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* MODAL CAMBIO PERSONAL */}
      <Modal show={showCambioModal} onHide={() => setShowCambioModal(false)} centered>
        <ModalHeader closeButton>
          <ModalTitle>Cambio de personal — {selected?.usuario}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {/* Personal actual */}
          <div className="p-3 rounded mb-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <p className="text-muted small mb-1 text-uppercase" style={{ fontSize: 10 }}>Personal actual</p>
            <p className="fw-semibold mb-0">{selected?.nombreActual ?? '—'}</p>
          </div>
          <div className="text-center text-muted mb-3" style={{ fontSize: 12 }}>↓ Se reemplazará por</div>

          <Row className="g-3">
          <Col md={6}>
            <Form.Label className="small fw-semibold">Usuario nuevo *</Form.Label>
            <Form.Control name="usuarioNuevo" value={cambioData.usuarioNuevo ?? ''}
              onChange={handleCambioChange} placeholder="Ej: CGARCIA"/>
          </Col>
          <Col md={6}>
            <Form.Label className="small fw-semibold">Nombre nuevo *</Form.Label>
            <Form.Control name="nombreNuevo" value={cambioData.nombreNuevo ?? ''}
              onChange={handleCambioChange} placeholder="Nombre completo del nuevo personal"/>
          </Col>
          <Col md={12}>
            <Form.Label className="small fw-semibold">Motivo del cambio</Form.Label>
            <Form.Control as="textarea" rows={2} name="motivo"
              value={cambioData.motivo ?? ''} onChange={handleCambioChange}
              placeholder="Descripción breve del motivo..."/>
          </Col>
          <Col md={12}>
            <Form.Label className="small fw-semibold">Realizado por</Form.Label>
            <Form.Control name="realizadoPor" value={cambioData.realizadoPor ?? ''}
              onChange={handleCambioChange} placeholder="Nombre del responsable"/>
          </Col>
        </Row>
          <div className="mt-3 p-2 rounded text-center" style={{ background: '#fef3c7', fontSize: 11, color: '#92400e' }}>
            El personal anterior quedará registrado en el historial.
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => setShowCambioModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={saveCambio} disabled={saving}>
            {saving ? 'Guardando...' : 'Confirmar cambio'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* MODAL HISTORIAL */}
      <Modal show={showHistorialModal} onHide={() => setShowHistorialModal(false)} centered size="lg">
        <ModalHeader closeButton>
          <ModalTitle>Historial — {selected?.usuario}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {historial.length === 0 ? (
            <p className="text-muted text-center py-3">Sin historial de cambios.</p>
          ) : (
            <table className="table table-sm" style={{ fontSize: 12 }}>
            <thead className="table-light">
              <tr>
                <th>Usuario anterior</th>
                <th>Personal anterior</th>
                <th>Usuario nuevo</th>
                <th>Personal nuevo</th>
                <th>Motivo</th>
                <th>Realizado por</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {historial.map(h => (
                <tr key={h.idHistorial}>
                  <td className="font-monospace" style={{ color: '#185FA5' }}>{h.usuarioAnterior ?? '—'}</td>
                  <td className="text-muted">{h.nombreAnterior ?? '—'}</td>
                  <td className="font-monospace" style={{ color: '#185FA5' }}>{h.usuarioNuevo ?? '—'}</td>
                  <td className="fw-semibold">{h.nombreNuevo ?? '—'}</td>
                  <td className="text-muted">{h.motivo ?? '—'}</td>
                  <td>{h.realizadoPor ?? '—'}</td>
                  <td className="text-muted">{h.fechaCambio ? new Date(h.fechaCambio).toLocaleDateString('es-PE') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => setShowHistorialModal(false)}>Cerrar</Button>
        </ModalFooter>
      </Modal>

      {/* MODAL ELIMINAR */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <ModalHeader closeButton><ModalTitle>Confirmar eliminación</ModalTitle></ModalHeader>
        <ModalBody>
          <p className="mb-0">¿Eliminar el registro <strong>{selected?.usuario}</strong>?</p>
          <small className="text-muted">Esta acción no se puede deshacer.</small>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={eliminar}>Eliminar</Button>
        </ModalFooter>
      </Modal>

    </div>
  );
};

export default GestionC4Sales;
