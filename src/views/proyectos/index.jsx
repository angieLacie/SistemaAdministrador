import { useState, useEffect } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Row, Col, Badge, Spinner } from 'react-bootstrap';
import SearchableSelect from '@/components/SearchableSelect';
import { toast } from 'react-toastify';
import { FaPlus, FaPen, FaEye, FaTrash, FaXmark } from 'react-icons/fa6';
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
        <span className="fw-bold" style={{ color: '#185FA5', fontSize: 13 }}>{getValue()}</span>
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
      cell: ({ getValue }) => <span className="text-muted" style={{ fontSize: 12 }}>{getValue() ?? '—'}</span>,
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
          {[
            { icon: <FaEye size={13}/>, title: 'Ver detalle', color: '#0891b2', bg: '#ecfeff', bd: '#a5f3fc', onClick: () => navigate(`/proyectos/${row.original.codProy}`) },
            { icon: <FaPen size={13}/>, title: 'Editar', color: '#185FA5', bg: '#eff6ff', bd: '#bfdbfe', onClick: () => { setSelected(row.original); setShowModal(true); } },
            { icon: <FaTrash size={13}/>, title: 'Anular', color: '#dc2626', bg: '#fef2f2', bd: '#fecaca', onClick: () => { setSelected(row.original); setShowDeleteModal(true); } },
          ].map(({ icon, title, color, bg, bd, onClick }) => (
            <button key={title} onClick={onClick} title={title}
              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:7, border:`1.5px solid ${bd}`, background:bg, color, cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=color; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor=color; }}
              onMouseLeave={e => { e.currentTarget.style.background=bg; e.currentTarget.style.color=color; e.currentTarget.style.borderColor=bd; }}>
              {icon}
            </button>
          ))}
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
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body py-2 px-3">
                  <Row className="g-2 align-items-center">
                    <Col xs={12} md={3}>
                      <div style={{ position: 'relative' }}>
                        <i className="ri-search-line" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:14 }} />
                        <input type="text" value={globalFilter ?? ''}
                          onChange={e => setGlobalFilter(e.target.value)}
                          placeholder="Buscar código, nombre, key user..."
                          autoComplete="off"
                          style={{ width:'100%', padding:'7px 36px 7px 32px', border:'1.5px solid #dde1e7', borderRadius:8, fontSize:13, outline:'none', background:'white' }}
                          onFocus={e => e.target.style.borderColor='#185FA5'}
                          onBlur={e  => e.target.style.borderColor='#dde1e7'}
                        />
                        {globalFilter && (
                          <button onClick={() => setGlobalFilter('')}
                            style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:2, display:'flex' }}>
                            <FaXmark size={12} />
                          </button>
                        )}
                      </div>
                    </Col>
                    <Col xs={6} md={2}>
                      <SearchableSelect value={filterEstado} onChange={setFilterEstado} options={['En curso','Finalizado','Suspendido','Pendiente','Anulado']} placeholder="Estado" />
                    </Col>
                    <Col xs={6} md={2}>
                      <SearchableSelect value={filterAnalista} onChange={setFilterAnalista} options={analistas} placeholder="Analista" />
                    </Col>
                    <Col xs={6} md={2}>
                      <SearchableSelect value={filterPeriodo} onChange={setFilterPeriodo} options={periodos} placeholder="Periodo" />
                    </Col>
                    <Col xs="auto" className="ms-auto">
                      <button onClick={() => { setSelected(null); setShowModal(true); }}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
                        <FaPlus size={12} /> Nuevo proyecto
                      </button>
                    </Col>
                  </Row>
                </div>
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