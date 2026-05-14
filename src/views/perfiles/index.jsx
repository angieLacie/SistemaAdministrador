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
import { perfilesService } from '@/services/seguridad.service';
import PerfilModal from './PerfilModal';

const columnHelper = createColumnHelper();

const EstadoBadge = ({ estado }) => (
  <Badge bg={estado === 'A' ? 'success' : 'secondary'}>
    {estado === 'A' ? 'Activo' : 'Inactivo'}
  </Badge>
);

const GestionPerfiles = () => {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchText, setSearchText]     = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 });

  const [showModal, setShowModal]         = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected]           = useState(null);
  const [saving, setSaving]               = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const lista = await perfilesService.listar({ estado: filterEstado });
      setData(lista);
    } catch (err) {
      toast.error('Error al cargar perfiles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [filterEstado]);

  const handleSavePerfil = async (payload) => {
    try {
      setSaving(true);
      if (selected) {
        await perfilesService.editar(selected.perfilId, payload);
        toast.success('Perfil actualizado correctamente');
      } else {
        await perfilesService.crear(payload);
        toast.success('Perfil creado correctamente');
      }
      setShowModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleToggleEstado = async () => {
    try {
      const nuevoEstado = selected.estadoPerfil === 'A' ? 'I' : 'A';
      await perfilesService.editar(selected.perfilId, {
        estadoPerfil: nuevoEstado,
        usuarioModificacion: 'ADMIN',
      });
      toast.success(`Perfil ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente`);
      setShowDeleteModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  const columns = [
    columnHelper.accessor('perfilId', {
      header: 'ID',
      cell: ({ getValue }) => <span className="text-muted font-monospace">{getValue()}</span>,
    }),
    columnHelper.accessor('descripcion', {
      header: 'Descripción',
      cell: ({ getValue }) => <span className="fw-semibold">{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('perfilRMS', {
      header: 'Perfil RMS',
      cell: ({ getValue }) => <span className="font-monospace text-muted">{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('flagChecklist', {
      header: 'Checklist',
      cell: ({ getValue }) => (
        <Badge bg={getValue() ? 'success' : 'secondary'}>
          {getValue() ? 'Sí' : 'No'}
        </Badge>
      ),
    }),
    columnHelper.accessor('flagTienda', {
      header: 'Tienda',
      cell: ({ getValue }) => (
        <Badge bg={getValue() ? 'success' : 'secondary'}>
          {getValue() ? 'Sí' : 'No'}
        </Badge>
      ),
    }),
    columnHelper.accessor('fechaCreacion', {
      header: 'Fecha creación',
      cell: ({ getValue }) => getValue()
        ? new Date(getValue()).toLocaleDateString('es-PE')
        : '—',
    }),
    columnHelper.accessor('estadoPerfil', {
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
          <Button size="sm"
            variant={row.original.estadoPerfil === 'A' ? 'outline-danger' : 'outline-success'}
            title={row.original.estadoPerfil === 'A' ? 'Desactivar' : 'Activar'}
            onClick={() => { setSelected(row.original); setShowDeleteModal(true); }}>
            {row.original.estadoPerfil === 'A'
              ? <FaToggleOff size={12} />
              : <FaToggleOn size={12} />}
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

  const kpis = {
    total:    data.length,
    activos:  data.filter(d => d.estadoPerfil === 'A').length,
    inactivos: data.filter(d => d.estadoPerfil === 'I').length,
  };

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión de Perfiles"
        subTitle1="Seguridad"
        subTitle2="Perfiles"
        subText="Registro y control de perfiles del sistema."
      />

      <div className="main-content">

        {/* KPIs */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={4}>
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <p className="text-muted small text-uppercase mb-1" style={{ fontSize: 10 }}>Total perfiles</p>
                <h3 className="mb-0 fw-bold" style={{ color: '#185FA5' }}>{kpis.total}</h3>
              </div>
            </div>
          </Col>
          <Col xs={6} md={4}>
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <p className="text-muted small text-uppercase mb-1" style={{ fontSize: 10 }}>Activos</p>
                <h3 className="mb-0 fw-bold text-success">{kpis.activos}</h3>
              </div>
            </div>
          </Col>
          <Col xs={6} md={4}>
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <p className="text-muted small text-uppercase mb-1" style={{ fontSize: 10 }}>Inactivos</p>
                <h3 className="mb-0 fw-bold text-secondary">{kpis.inactivos}</h3>
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
                      placeholder="Buscar perfil..."
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
                  <SearchableSelect value={filterEstado} onChange={setFilterEstado} options={[{value:'A',label:'Activo'},{value:'I',label:'Inactivo'}]} placeholder="Estado" />
                </Col>
                <Col className="d-flex justify-content-end">
                  <Button variant="primary" size="sm"
                    onClick={() => { setSelected(null); setShowModal(true); }}>
                    <FaPlus size={12} className="me-1" /> Nuevo perfil
                  </Button>
                </Col>
              </div>

              <DataTable table={table} emptyMessage="No se encontraron perfiles" />

              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="perfiles" showInfo
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

      <PerfilModal
        show={showModal}
        onHide={() => { setShowModal(false); setSelected(null); }}
        onSave={handleSavePerfil}
        perfil={selected}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        title={selected?.estadoPerfil === 'A' ? 'Desactivar perfil' : 'Activar perfil'}
        message={`¿Estás seguro de ${selected?.estadoPerfil === 'A' ? 'desactivar' : 'activar'} el perfil "${selected?.descripcion}"?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant={selected?.estadoPerfil === 'A' ? 'danger' : 'success'}
        onConfirm={handleToggleEstado}
        onCancel={() => { setShowDeleteModal(false); setSelected(null); }}
      />
    </div>
  );
};

export default GestionPerfiles;