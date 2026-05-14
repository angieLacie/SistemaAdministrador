import { useState, useEffect } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import SearchableSelect from '@/components/SearchableSelect';
import { toast } from 'react-toastify';
import { FaPlus, FaPen, FaToggleOn, FaToggleOff } from 'react-icons/fa6';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import ConfirmModal from '@/components/modals/ConfirmModal';
import { empleadosService } from '@/services/seguridad.service';
import EmpleadoModal from './EmpleadoModal';

const columnHelper = createColumnHelper();

const OrigenBadge = ({ origen } ) => {
  const map = {
    0: { bg: '#dbeafe', color: '#1e40af', label: 'Sistema' },
    1: { bg: '#dcfce7', color: '#166534', label: 'Tiendas' },
    2: { bg: '#ede9fe', color: '#5b21b6', label: 'RMS' },
  };
  const e = map[origen] || { bg: '#f3f4f6', color: '#374151', label: '—' };
  return <Badge style={{ background: e.bg, color: e.color, fontSize: 10 }}>{e.label}</Badge>;
};

const GestionEmpleados = () => {
  const [data, setData]           = useState([]);
  const [resumen, setResumen]     = useState({ total: 0, activos: 0, inactivos: 0, sistema: 0, rms: 0, tiendas: 0 });
  const [loading, setLoading]     = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchText, setSearchText]     = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterOrigen, setFilterOrigen] = useState('');
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 });

  const [showModal, setShowModal]           = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [selected, setSelected]             = useState(null);
  const [saving, setSaving]                 = useState(false);
  const [filtrosActivos, setFiltrosActivos] = useState({ estado: '', origen: '', search: '' });

const cargar = async () => {
  try {
    setLoading(true);
    const [lista, res] = await Promise.all([
      empleadosService.listar({
        estado:  filtrosActivos.estado,
        origen:  filtrosActivos.origen,
        search:  filtrosActivos.search,
      }),
      empleadosService.resumen(),
    ]);
    setData(lista);
    setResumen(res);
  } catch (err) {
    toast.error('Error al cargar empleados: ' + err.message);
  } finally {
    setLoading(false);
  }
};
 
 useEffect(() => { cargar(); }, [filtrosActivos]);

const buscar = () => {
  setFiltrosActivos({ estado: filterEstado, origen: filterOrigen, search: searchText });
};
  const handleSaveEmpleado = async (payload) => {
    try {
      setSaving(true);
      if (selected) {
        await empleadosService.editar(selected.empleado, payload);
        toast.success('Empleado actualizado correctamente');
      } else {
        const res = await empleadosService.crear(payload);
        toast.success(`Empleado creado. Usuario generado: ${res.usuarioGenerado}`);
      }
      setShowModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleToggleEstado = async () => {
    try {
      const nuevoEstado = selected.estadoEmpleado === 'A' ? 'I' : 'A';
      await empleadosService.cambiarEstado(selected.empleado, {
        estado: nuevoEstado,
        usuarioModificacion: 'ADMIN',
      });
      toast.success(`Empleado ${nuevoEstado === 'A' ? 'activado' : 'anulado'} correctamente`);
      setShowEstadoModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  const columns = [
  columnHelper.accessor('empleadoId', {
    header: 'Empleado',
    cell: ({ getValue }) => (
      <span className="fw-semibold font-monospace" style={{ color: '#185FA5' }}>{getValue()}</span>
    ),
  }),
  columnHelper.accessor('nombreCompleto', {
    header: 'Nombre completo',
    cell: ({ getValue }) => getValue() ?? '—',
  }),
  columnHelper.accessor('documentoIdentidad', {
    header: 'Documento',
    cell: ({ getValue }) => <span className="font-monospace text-muted">{getValue() ?? '—'}</span>,
  }),
  columnHelper.accessor('usuario', {
    header: 'Usuario',
    cell: ({ getValue }) => (
      <span className="fw-semibold font-monospace" style={{ color: '#185FA5' }}>{getValue() ?? '—'}</span>
    ),
  }),
  columnHelper.accessor('perfil', {
    header: 'Perfil',
    cell: ({ getValue }) => (
      <Badge bg="light" text="dark" style={{ border: '1px solid #d1d5db', fontSize: 10 }}>
        {getValue() ?? '—'}
      </Badge>
    ),
  }),
  columnHelper.accessor('tiendaActual', {
    header: 'Tienda',
    cell: ({ row }) => row.original.tiendaActual ? (
      <div>
        <span className="font-monospace fw-semibold" style={{ fontSize: 11 }}>{row.original.tiendaActual}</span>
        <div className="text-muted" style={{ fontSize: 10 }}>{row.original.tiendaDescripcion}</div>
      </div>
    ) : '—',
  }),
  columnHelper.accessor('empresa', {
    header: 'Empresa',
    cell: ({ getValue }) => <span className="text-muted" style={{ fontSize: 11 }}>{getValue() ?? '—'}</span>,
  }),
  columnHelper.accessor('puesto', {
    header: 'Puesto',
    cell: ({ getValue }) => <span className="text-muted">{getValue() ?? '—'}</span>,
  }),
  columnHelper.accessor('origen', {
    header: 'Origen',
    cell: ({ getValue }) => <OrigenBadge origen={getValue()} />,
  }),
  columnHelper.accessor('estadoEmpleado', {
    header: 'Estado',
    cell: ({ getValue }) => (
      <Badge bg={getValue() === 'A' ? 'success' : 'secondary'}>
        {getValue() === 'A' ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => (
      <div className="d-flex gap-1">
        <Button size="sm" variant="outline-secondary" title="Editar"
          onClick={() => { setSelected(row.original); setShowModal(true); }}>
          <FaPen size={12} />
        </Button>
        <Button size="sm"
          variant={row.original.estadoEmpleado === 'A' ? 'outline-danger' : 'outline-success'}
          title={row.original.estadoEmpleado === 'A' ? 'Anular' : 'Activar'}
          onClick={() => { setSelected(row.original); setShowEstadoModal(true); }}>
          {row.original.estadoEmpleado === 'A' ? <FaToggleOff size={12} /> : <FaToggleOn size={12} />}
        </Button>
      </div>
    ),
  }),
];

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalItems = table.getFilteredRowModel().rows.length;
  const start = pagination.pageIndex * pagination.pageSize + 1;
  const end   = Math.min(start + pagination.pageSize - 1, totalItems);

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión de Empleados"
        subTitle1="Seguridad"
        subTitle2="Empleados"
        subText="Registro y control de empleados del sistema."
      />

      <div className="main-content">
        {/* KPIs */} 
        <Row className="mb-4 g-3">
          <Col xs={6} md={2}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Total usuarios
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#185FA5', fontSize: 32 }}>{resumen.total}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 600 }}>
                    {resumen.origen} usuarios
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>con accesos</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} md={2}>
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

          <Col xs={6} md={2}>
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

          <Col xs={6} md={2}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Empresas
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#a855f7', fontSize: 32 }}>{resumen.rms}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', fontSize: 10, fontWeight: 600 }}>
                    usuarios
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>de RMS</span>
                </div>
              </div>
            </div>
            
          </Col>
          <Col xs={6} md={2}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Sistemas de origen
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#992e04', fontSize: 32 }}>{resumen.sistema}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#f3e8ff', color: '#a88921', fontSize: 10, fontWeight: 600 }}>
                    usuarios
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>de sistemas</span>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={6} md={2}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Usuarios con tienda
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#a855f7', fontSize: 32 }}>{resumen.tiendas}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', fontSize: 10, fontWeight: 600 }}>
                    usuarios
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>con Tiendas</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>


     
        <Row>
          <Col lg={12}>
            <div className="st-wrapper">
              <div className="st-toolbar row mb-3 g-2 align-items-center">
                <Col xs={12} sm={6} lg={3}>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text px-2">
                      <svg className="sa-icon sa-bold" width={14} height={14}>
                        <use href="/icons/sprite.svg#search"></use>
                      </svg>
                    </span>
                    <input type="text" className="form-control"
                    placeholder="Buscar empleado, nombre, DNI..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && buscar()}
                    autoComplete="off"/>
                    {searchText && (
                    <button className="btn btn-outline-secondary" type="button"
                        onClick={() => { setSearchText(''); setFiltrosActivos(prev => ({ ...prev, search: '' })); }}>✕</button>
                    )}
                    <button className="btn btn-primary" type="button" onClick={buscar}>
                    Buscar
                    </button>
                  </div>
                </Col>
                <Col xs={6} sm={3} lg={2}>
                  <SearchableSelect value={filterEstado} onChange={v => { setFilterEstado(v); setFiltrosActivos(prev => ({ ...prev, estado: v })); }} options={[{value:'A',label:'Activo'},{value:'I',label:'Inactivo'}]} placeholder="Estado" />
                </Col>
                <Col xs={6} sm={3} lg={2}>
                    <SearchableSelect value={filterOrigen} onChange={v => { setFilterOrigen(v); setFiltrosActivos(prev => ({ ...prev, origen: v })); }} options={[{value:'0',label:'Sistema'},{value:'1',label:'Tiendas'},{value:'2',label:'RMS'}]} placeholder="Origen" />
                </Col>
                <Col className="d-flex justify-content-end">
                  <Button variant="primary" size="sm"
                    onClick={() => { setSelected(null); setShowModal(true); }}>
                    <FaPlus size={12} className="me-1" /> Nuevo empleado
                  </Button>
                </Col>
              </div>

              <DataTable table={table} emptyMessage="No se encontraron empleados" />

              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="empleados" showInfo
                previousPage={table.previousPage} canPreviousPage={table.getCanPreviousPage()}
                pageCount={table.getPageCount()} pageIndex={table.getState().pagination.pageIndex}
                setPageIndex={table.setPageIndex} nextPage={table.nextPage}
                canNextPage={table.getCanNextPage()} pageSize={table.getState().pagination.pageSize}
                onPageSizeChange={table.setPageSize} showPageLimit
              />
            </div>
          </Col>
        </Row>
      </div>

      <EmpleadoModal
        show={showModal}
        onHide={() => { setShowModal(false); setSelected(null); }}
        onSave={handleSaveEmpleado}
        empleado={selected}
        saving={saving}
      />

      <ConfirmModal
        show={showEstadoModal}
        title={selected?.estadoEmpleado === 'A' ? 'Anular empleado' : 'Activar empleado'}
        message={`¿Estás seguro de ${selected?.estadoEmpleado === 'A' ? 'anular' : 'activar'} al empleado "${selected?.nombreCompleto}"? ${selected?.estadoEmpleado === 'A' ? 'También se anulará su usuario.' : 'También se activará su usuario.'}`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant={selected?.estadoEmpleado === 'A' ? 'danger' : 'success'}
        onConfirm={handleToggleEstado}
        onCancel={() => { setShowEstadoModal(false); setSelected(null); }}
      />
    </div>
  );
};

export default GestionEmpleados;