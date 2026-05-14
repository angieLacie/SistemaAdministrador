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
import { FaPlus, FaPen, FaEye, FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import ConfirmModal from '@/components/modals/ConfirmModal';
import { proyectosService } from '@/services/proyectos.service';
import ProyectoModal from './ProyectoModal';

const columnHelper = createColumnHelper();

const EstadoBadge = ({ estado }) => {
  const map = {
    'En curso':    { bg: '#E6F1FB', color: '#185FA5' },
    'Finalizado':  { bg: '#EAF3DE', color: '#3B6D11' },
    'Suspendido':  { bg: '#FAEEDA', color: '#BA7517' },
    'Anulado':     { bg: '#FCEBEB', color: '#A32D2D' },
    'Pendiente':   { bg: '#F1EFE8', color: '#5F5E5A' },
  };
  const e = map[estado] || { bg: '#F1EFE8', color: '#5F5E5A' };
  return (
    <Badge style={{ background: e.bg, color: e.color, fontSize: 10, fontWeight: 500 }}>
      {estado ?? '—'}
    </Badge>
  );
};

const GestionProyectos = () => {
  const navigate = useNavigate();
  const [data, setData]         = useState([]);
  const [resumen, setResumen]   = useState({ total: 0, porEstado: [], montoTotal: 0 });
  const [loading, setLoading]   = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchText, setSearchText]     = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterAnalista, setFilterAnalista] = useState('');
  const [filterPeriodo, setFilterPeriodo]   = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [showModal, setShowModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [saving, setSaving]         = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [lista, res] = await Promise.all([
        proyectosService.listar({ estado: filterEstado, analista: filterAnalista, periodo: filterPeriodo }),
        proyectosService.resumen(),
      ]);
      setData(lista);
      setResumen(res);
    } catch (err) {
      toast.error('Error al cargar proyectos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [filterEstado, filterAnalista, filterPeriodo]);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      if (selected) {
        await proyectosService.editar(selected.codProy, payload);
        toast.success('Proyecto actualizado correctamente');
      } else {
        await proyectosService.crear(payload);
        toast.success('Proyecto creado correctamente');
      }
      setShowModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await proyectosService.eliminar(selected.codProy);
      toast.success(`Proyecto ${selected.codProy} anulado correctamente`);
      setShowDeleteModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  // Analistas y periodos únicos para filtros
  const analistas = [...new Set(data.map(d => d.analista).filter(Boolean))].sort();
  const periodos  = [...new Set(data.map(d => d.periodo).filter(Boolean))].sort().reverse();

  const columns = [
    columnHelper.accessor('codProy', {
      header: 'Código',
      cell: ({ getValue }) => (
        <span className="fw-bold font-monospace" style={{ color: '#185FA5', fontSize: 12 }}>{getValue()}</span>
      ),
    }),
    columnHelper.accessor('nombreRequerimiento', {
      header: 'Nombre del requerimiento',
      cell: ({ getValue }) => (
        <span style={{ fontSize: 12 }} title={getValue()}>{getValue() ?? '—'}</span>
      ),
    }),
    columnHelper.accessor('analista', {
      header: 'Analista',
      cell: ({ getValue }) => <span className="text-muted" style={{ fontSize: 12 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('keyUser', {
      header: 'Key User',
      cell: ({ getValue }) => <span style={{ fontSize: 12 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('tipoDesarrollo', {
      header: 'Tipo',
      cell: ({ getValue }) => getValue()
        ? <Badge bg="light" text="dark" style={{ border: '1px solid #d1d5db', fontSize: 10 }}>{getValue()}</Badge>
        : '—',
    }),
    columnHelper.accessor('periodo', {
      header: 'Periodo',
      cell: ({ getValue }) => <span className="font-monospace text-muted" style={{ fontSize: 11 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('montoTotalProyecto', {
      header: 'Monto total',
      cell: ({ getValue }) => getValue()
        ? <span className="fw-semibold" style={{ fontSize: 12 }}>S/ {Number(getValue()).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
        : <span className="text-muted">—</span>,
    }),
    columnHelper.accessor('estado', {
      header: 'Estado',
      cell: ({ getValue }) => <EstadoBadge estado={getValue()} />,
    }),
    columnHelper.accessor('estadoInterno', {
      header: 'Estado interno',
      cell: ({ getValue }) => getValue()
        ? <span className="text-muted" style={{ fontSize: 11 }}>{getValue()}</span>
        : '—',
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-primary" title="Ver detalle"
            onClick={() => navigate(`/proyectos/${row.original.codProy}`)}>
            <FaEye size={12} />
          </Button>
          <Button size="sm" variant="outline-secondary" title="Editar"
            onClick={() => { setSelected(row.original); setShowModal(true); }}>
            <FaPen size={12} />
          </Button>
          <Button size="sm" variant="outline-danger" title="Anular"
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

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión de Proyectos"
        subTitle1="Proyectos"
        subTitle2="Lista"
        subText="Registro y control de proyectos TIC."
      />

      <div className="main-content">

        {/* KPIs */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <p className="text-muted small text-uppercase mb-1" style={{ fontSize: 10 }}>Total proyectos</p>
                <h3 className="mb-0 fw-bold" style={{ color: '#185FA5' }}>{resumen.total}</h3>
              </div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <p className="text-muted small text-uppercase mb-1" style={{ fontSize: 10 }}>En curso</p>
                <h3 className="mb-0 fw-bold" style={{ color: '#185FA5' }}>
                  {resumen.porEstado?.find(e => e.estado === 'En curso')?.total ?? 0}
                </h3>
              </div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <p className="text-muted small text-uppercase mb-1" style={{ fontSize: 10 }}>Finalizados</p>
                <h3 className="mb-0 fw-bold text-success">
                  {resumen.porEstado?.find(e => e.estado === 'Finalizado')?.total ?? 0}
                </h3>
              </div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-3">
                <p className="text-muted small text-uppercase mb-1" style={{ fontSize: 10 }}>Monto total</p>
                <h3 className="mb-0 fw-bold" style={{ color: '#3B6D11', fontSize: 18 }}>
                  S/ {Number(resumen.montoTotal ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                </h3>
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
                      placeholder="Buscar código, nombre, key user..."
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
                  <SearchableSelect value={filterEstado} onChange={setFilterEstado} options={['En curso','Finalizado','Suspendido','Pendiente','Anulado']} placeholder="Estado" />
                </Col>
                <Col xs={6} sm={3} lg={2}>
                  <SearchableSelect value={filterAnalista} onChange={setFilterAnalista} options={analistas} placeholder="Analista" />
                </Col>
                <Col xs={6} sm={3} lg={2}>
                  <SearchableSelect value={filterPeriodo} onChange={setFilterPeriodo} options={periodos} placeholder="Periodo" />
                </Col>
                <Col className="d-flex justify-content-end">
                  <Button variant="primary" size="sm"
                    onClick={() => { setSelected(null); setShowModal(true); }}>
                    <FaPlus size={12} className="me-1" /> Nuevo proyecto
                  </Button>
                </Col>
              </div>

              <DataTable table={table} emptyMessage="No se encontraron proyectos" />

              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="proyectos" showInfo
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

      <ProyectoModal
        show={showModal}
        onHide={() => { setShowModal(false); setSelected(null); }}
        onSave={handleSave}
        proyecto={selected}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        title="Anular proyecto"
        message={`¿Estás seguro de anular el proyecto "${selected?.codProy} — ${selected?.nombreRequerimiento}"?`}
        confirmText="Sí, anular"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteModal(false); setSelected(null); }}
      />
    </div>
  );
};

export default GestionProyectos;