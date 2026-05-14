import { useState, useEffect, useMemo } from 'react';
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
import { FaPen } from 'react-icons/fa6';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import JobModal from './JobModal';
import { jobsService } from '@/services/jobs.service';

const columnHelper = createColumnHelper();

const EstadoBadge = ({ estado }) => (
  <Badge bg={estado === 'A' ? 'success' : 'secondary'}>
    {estado === 'A' ? 'Activo' : 'Inactivo'}
  </Badge>
);

const TipoBadge = ({ tipo }) => {
  const colores = {
    INTERFAZ:     { bg: '#11a304', color: '#ffffff' },
    SYNC_Tiendas: { bg: '#120eee', color: '#ffffff' },
    NOVA:         { bg: '#d81972', color: '#ffffff' },
    SYNC_Nova:    { bg: '#92400e', color: '#ffffff' },
  };
  const estilo = colores[tipo] || { bg: '#374151', color: '#ffffff' };
  return (
    <Badge bg="" style={{ backgroundColor: estilo.bg, color: estilo.color, fontFamily: 'monospace', fontSize: 11 }}>
      {tipo}
    </Badge>
  );
};

const GestionJobs = () => {
  const [data, setData]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchText, setSearchText]     = useState('');
  const [filterTipo, setFilterTipo]     = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 15 });
  const [showModal, setShowModal]       = useState(false);
  const [selected, setSelected]         = useState(null);
  const [saving, setSaving]             = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const lista = await jobsService.listar({ tipo: filterTipo, estado: filterEstado });
      setData(lista);
    } catch (err) {
      toast.error('Error al cargar jobs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [filterTipo, filterEstado]);

  const tipos = useMemo(() => {
    const set = new Set(data.map(d => d.tipo).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const dataAgrupada = useMemo(() => {
    if (filterTipo) return data;
    return [...data].sort((a, b) => {
      if (a.tipo < b.tipo) return -1;
      if (a.tipo > b.tipo) return 1;
      return (a.orden ?? 0) - (b.orden ?? 0);
    });
  }, [data, filterTipo]);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      if (selected) {
        await jobsService.editar(selected.jobId, { ...payload, usuarioModificacion: 'ADMIN' });
        toast.success('Job actualizado correctamente');
      } else {
        await jobsService.crear(payload);
        toast.success('Job creado correctamente');
      }
      setShowModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const toggleEstado = async (item) => {
    try {
      const nuevoEstado = item.estado === 'A' ? 'I' : 'A';
      await jobsService.cambiarEstado(item.jobId, {
        estado: nuevoEstado,
        usuarioModificacion: 'ADMIN',
      });
      toast.success(`Job ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente`);
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  const columns = [
    columnHelper.accessor('jobId', {
      header: 'ID',
      cell: ({ getValue }) => <span className="text-muted font-monospace">{getValue()}</span>,
    }),
    columnHelper.accessor('jobDescripcion', {
      header: 'Descripción',
      cell: ({ getValue }) => <span className="fw-semibold">{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('cronExpression', {
      header: 'Cron',
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v) return <span className="text-muted">—</span>;
        const partes = v.split(' ');
        const coloresCron = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6'];
        return (
          <span style={{ fontFamily: 'monospace', fontSize: 11 }}>
            {partes.map((p, i) => (
              <span key={i} style={{ color: coloresCron[i % coloresCron.length], marginRight: 3, fontWeight: 600 }}>
                {p}
              </span>
            ))}
          </span>
        );
      },
    }),
    columnHelper.accessor('tipo', {
      header: 'Tipo',
      cell: ({ getValue }) => <TipoBadge tipo={getValue()} />,
    }),
    columnHelper.accessor('jobClave', {
      header: 'Clave',
      cell: ({ getValue }) => (
        <span className="text-muted font-monospace" style={{ fontSize: 11 }}>{getValue() ?? '—'}</span>
      ),
    }),
    columnHelper.accessor('fechaUltimoEjecucion', {
      header: 'Última ejecución',
      cell: ({ getValue }) => getValue()
        ? <span style={{ fontSize: 12 }}>{new Date(getValue()).toLocaleString('es-PE')}</span>
        : <span className="text-muted">—</span>,
    }),
    columnHelper.accessor('estadoUltimoEjecucion', {
      header: 'Estado ejec.',
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v) return <span className="text-muted">—</span>;
        const config = {
          OK:        { bg: 'success', label: '✓ OK'         },
          ERROR:     { bg: 'danger',  label: '✗ ERROR'      },
          PENDIENTE: { bg: 'warning', label: '⏳ Pendiente'  },
        };
        const c = config[v] ?? { bg: 'secondary', label: v };
        return <Badge bg={c.bg}>{c.label}</Badge>;
      },
    }),
    columnHelper.accessor('mensajeUltimoEjecucion', {
      header: 'Mensaje',
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v) return <span className="text-muted">—</span>;
        return (
          <span title={v} style={{
            fontSize: 11, maxWidth: 200, display: 'inline-block',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: v.toLowerCase().includes('error') ? '#dc2626' : '#374151',
          }}>{v}</span>
        );
      },
    }),
    columnHelper.accessor('estado', {
      header: 'Estado',
      cell: ({ row }) => (
        <div className="d-flex align-items-center gap-2">
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              checked={row.original.estado === 'A'}
              onChange={() => toggleEstado(row.original)}
              style={{ cursor: 'pointer' }}/>
          </div>
          <EstadoBadge estado={row.original.estado} />
        </div>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button size="sm" variant="outline-secondary"
          onClick={() => { setSelected(row.original); setShowModal(true); }}>
          <FaPen size={12} />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: dataAgrupada,
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

  const kpis = useMemo(() => ({
    total:    data.length,
    activos:  data.filter(d => d.estado === 'A').length,
    inactivos: data.filter(d => d.estado === 'I').length,
    tipos:    new Set(data.map(d => d.tipo).filter(Boolean)).size,
  }), [data]);

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión de Jobs"
        subTitle1="Administración"
        subTitle2="Jobs"
        subText="Control y monitoreo de jobs programados del sistema."
      />

      <div className="main-content">

        {/* KPIs */} 
      <Row className="mb-4 g-3">
        <Col xs={6} md={3}>
          <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
            <div className="card-body py-3 px-4">
              <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                Total Jobs
              </p>
              <h2 className="mb-1 fw-bold" style={{ color: '#185FA5', fontSize: 32 }}>{kpis.total}</h2>
              <div className="d-flex align-items-center gap-2 mt-1">
                <Badge bg="" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 600 }}>
                  {kpis.tipos} tipos
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
                <span className="text-muted" style={{ fontSize: 11 }}>del total</span>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
            <div className="card-body py-3 px-4">
              <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                Tipos
              </p>
              <h2 className="mb-1 fw-bold" style={{ color: '#a855f7', fontSize: 32 }}>{kpis.tipos}</h2>
              <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                {['INTERFAZ','SYNC_Tiendas','NOVA','SYNC_Nova'].map(t => (
                  <Badge key={t} bg="" style={{
                    backgroundColor: {
                      INTERFAZ:     '#11a304',
                      SYNC_Tiendas: '#120eee',
                      NOVA:         '#d81972',
                      SYNC_Nova:    '#92400e',
                    }[t],
                    color: '#fff',
                    fontSize: 9,
                    fontFamily: 'monospace',
                  }}>{t}</Badge>
                ))}
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
                      placeholder="Buscar job, descripción..."
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
                  <SearchableSelect value={filterTipo} onChange={setFilterTipo} options={tipos} placeholder="Tipo" />
                </Col>
                <Col xs={6} sm={4} lg={2}>
                  <SearchableSelect value={filterEstado} onChange={setFilterEstado} options={[{value:'A',label:'Activo'},{value:'I',label:'Inactivo'}]} placeholder="Estado" />
                </Col>
                <Col className="d-flex justify-content-end">
                  <Button variant="primary" size="sm"
                    onClick={() => { setSelected(null); setShowModal(true); }}>
                    + Nuevo Job
                  </Button>
                </Col>
              </div>

              <DataTable table={table} emptyMessage="No se encontraron jobs" />

              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="jobs" showInfo
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

      <JobModal
        show={showModal}
        onHide={() => { setShowModal(false); setSelected(null); }}
        onSave={handleSave}
        job={selected}
        tipos={tipos}
        saving={saving}
      />
    </div>
  );
};

export default GestionJobs;