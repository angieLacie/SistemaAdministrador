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
import { FaPlus, FaPen, FaTrash, FaKey, FaLock, FaLockOpen } from 'react-icons/fa6';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import ConfirmModal from '@/components/modals/ConfirmModal';
import { usuariosService, perfilesService } from '@/services/seguridad.service';
import UsuarioModal from './UsuarioModal';
import ClaveModal from './ClaveModal';
import CambiarPerfilModal from './CambiarPerfilModal';

const columnHelper = createColumnHelper();

const EstadoBadge = ({ estado }) => {
  const map = {
    A: { bg: 'success', label: 'Activo' },
    I: { bg: 'secondary', label: 'Inactivo' },
    B: { bg: 'danger', label: 'Bloqueado' },
  };
  const e = map[estado] || { bg: 'secondary', label: estado };
  return <Badge bg={e.bg}>{e.label}</Badge>;
};

const GestionUsuarios = () => {
  const [data, setData]           = useState([]);
  const [perfiles, setPerfiles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchText, setSearchText]     = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 });

  const [showModal, setShowModal]         = useState(false);
  const [showClaveModal, setShowClaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected]           = useState(null);
  const [saving, setSaving]               = useState(false);
const [showPerfilModal, setShowPerfilModal] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [lista, listaPerfiles] = await Promise.all([
        usuariosService.listar({ estado: filterEstado }),
        perfilesService.listar(),
      ]);
      setData(lista);
      setPerfiles(listaPerfiles);
    } catch (err) {
      toast.error('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [filterEstado]);

  const handleSaveUsuario = async (payload) => {
    try {
      setSaving(true);
      if (selected) {
        await usuariosService.editar(selected.usuarioId, payload);
        toast.success('Usuario actualizado correctamente');
      } else {
        await usuariosService.crear(payload);
        toast.success('Usuario creado correctamente');
      }
      setShowModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleSaveClave = async (payload) => {
    try {
      setSaving(true);
      await usuariosService.actualizarClave(selected.usuarioId, payload);
      toast.success('Clave actualizada correctamente');
      setShowClaveModal(false);
      setSelected(null);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleToggleEstado = async (item) => {
    try {
      const nuevoEstado = item.estadoUsuario === 'A' ? 'B' : 'A';
      await usuariosService.cambiarEstado(item.usuarioId, { estado: nuevoEstado });
      toast.success(`Usuario ${nuevoEstado === 'A' ? 'activado' : 'bloqueado'} correctamente`);
      await cargar();
    } catch (err) { toast.error(err.message); }
  };
const handleCambiarPerfil = async (payload) => {
  try {
    setSaving(true);
    await usuariosService.cambiarPerfilUsuario(selected.usuarioId, payload);
    toast.success('Perfil actualizado correctamente');
    setShowPerfilModal(false);
    setSelected(null);
    await cargar();
  } catch (err) { toast.error(err.message); }
  finally { setSaving(false); }
};
  const handleDelete = async () => {
    try {
      await usuariosService.eliminar(selected.usuarioId);
      toast.success(`Usuario ${selected.usuarioId} eliminado`);
      setShowDeleteModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  const columns = [
    columnHelper.accessor('usuarioId', {
      header: 'Usuario',
      cell: ({ getValue }) => <span className="fw-semibold font-monospace" style={{ color: '#185FA5' }}>{getValue()}</span>,
    }),
    columnHelper.accessor('nombreUsuario', {
      header: 'Nombre',
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor('empleado', {
      header: 'Empleado',
      cell: ({ getValue }) => <span className="text-muted font-monospace">{getValue() ?? '—'}</span>,
    }),
  columnHelper.accessor('perfilDescripcion', {
  header: 'Perfil',
  cell: ({ getValue }) => (
    <Badge bg="light" text="dark" style={{ border: '1px solid #d1d5db', fontSize: 10 }}>
      {getValue() ?? '—'}
    </Badge>
  ),
}),
    columnHelper.accessor('fechaUltimoUso', {
      header: 'Último acceso',
      cell: ({ getValue }) => getValue()
        ? new Date(getValue()).toLocaleString('es-PE')
        : <span className="text-muted">—</span>,
    }),
    columnHelper.accessor('estadoUsuario', {
      header: 'Estado',
      cell: ({ getValue }) => <EstadoBadge estado={getValue()} />,
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
          <Button size="sm" variant="outline-warning" title="Cambiar clave"
            onClick={() => { setSelected(row.original); setShowClaveModal(true); }}>
            <FaKey size={12} />
          </Button>
          <Button size="sm"
            variant={row.original.estadoUsuario === 'A' ? 'outline-danger' : 'outline-success'}
            title={row.original.estadoUsuario === 'A' ? 'Bloquear' : 'Activar'}
            onClick={() => handleToggleEstado(row.original)}>
            {row.original.estadoUsuario === 'A' ? <FaLock size={12} /> : <FaLockOpen size={12} />}
          </Button>
          <Button size="sm" variant="outline-primary" title="Cambiar perfil"
          onClick={() => { setSelected(row.original); setShowPerfilModal(true); }}>
           <FaKey size={12} />
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

  // KPIs
const kpis = {
  total:      data.length,
  activos:    data.filter(d => d.estadoUsuario === 'A').length,
  inactivos:  data.filter(d => d.estadoUsuario === 'I').length,
  bloqueados: data.filter(d => d.estadoUsuario === 'B').length,
};

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión de Usuarios"
        subTitle1="Seguridad"
        subTitle2="Usuarios"
        subText="Registro y control de usuarios del sistema."
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
                <h2 className="mb-1 fw-bold" style={{ color: '#185FA5', fontSize: 32 }}>{kpis.total}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 600 }}>
                    {kpis.total} usuarios
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
                <h2 className="mb-1 fw-bold text-success" style={{ fontSize: 32 }}>{kpis.activos}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 600 }}>
                    {kpis.total > 0 ? Math.round((kpis.activos / kpis.total) * 100) : 0}%
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
                <h2 className="mb-1 fw-bold text-secondary" style={{ fontSize: 32 }}>{kpis.inactivos}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#f3f4f6', color: '#374151', fontSize: 10, fontWeight: 600 }}>
                    {kpis.total > 0 ? Math.round((kpis.inactivos / kpis.total) * 100) : 0}%
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
                  Bloqueados
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#a855f7', fontSize: 32 }}>{kpis.bloqueados}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', fontSize: 10, fontWeight: 600 }}>
                    {kpis.total > 0 ? Math.round((kpis.bloqueados / kpis.total) * 100) : 0}%
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
              <div className="st-toolbar row mb-3 g-2 align-items-center">
                <Col xs={12} sm={6} lg={3}>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text px-2">
                      <svg className="sa-icon sa-bold" width={14} height={14}>
                        <use href="/icons/sprite.svg#search"></use>
                      </svg>
                    </span>
                    <input type="text" className="form-control"
                      placeholder="Buscar usuario, nombre..."
                      value={searchText}
                      onChange={e => { setSearchText(e.target.value); setGlobalFilter(e.target.value); }}
                      autoComplete="off"/>
                    {searchText && (
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => { setSearchText(''); setGlobalFilter(''); }}>✕</button>
                    )}
                  </div>
                </Col>
                <Col xs={6} sm={4} lg={2}>
                  <SearchableSelect value={filterEstado} onChange={setFilterEstado} options={[{value:'A',label:'Activo'},{value:'I',label:'Inactivo'},{value:'B',label:'Bloqueado'}]} placeholder="Estado" />
                </Col>
                <Col className="d-flex justify-content-end">
                  <Button variant="primary" size="sm"
                    onClick={() => { setSelected(null); setShowModal(true); }}>
                    <FaPlus size={12} className="me-1" /> Nuevo usuario
                  </Button>
                </Col>
              </div>

              <DataTable table={table} emptyMessage="No se encontraron usuarios" />

              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="usuarios" showInfo
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

      <UsuarioModal
        show={showModal}
        onHide={() => { setShowModal(false); setSelected(null); }}
        onSave={handleSaveUsuario}
        usuario={selected}
        perfiles={perfiles}
        saving={saving}
      />

      <ClaveModal
        show={showClaveModal}
        onHide={() => { setShowClaveModal(false); setSelected(null); }}
        onSave={handleSaveClave}
        usuario={selected}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar el usuario ${selected?.usuarioId}? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteModal(false); setSelected(null); }}
      />
      <CambiarPerfilModal
          show={showPerfilModal}
          onHide={() => { setShowPerfilModal(false); setSelected(null); }}
          onSave={handleCambiarPerfil}
          usuario={selected}
          perfiles={perfiles}
          saving={saving}
        />
    </div>
  );
};

export default GestionUsuarios;
