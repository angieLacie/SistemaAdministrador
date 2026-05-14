import { useState, useEffect, useRef } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Row, Col, Button, Badge, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa6';
import { Chart, registerables } from 'chart.js';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import { interfazService } from '@/services/monitor.service';

Chart.register(...registerables);

const columnHelper = createColumnHelper();

const EstadoBadge = ({ estado1, estado2, estado3, estado4 }) => {
  if (estado4 > 0) return <Badge bg="danger" style={{ fontSize: 10 }}>Error</Badge>;
  if (estado3 > 0) return <Badge bg="success" style={{ fontSize: 10 }}>OK</Badge>;
  if (estado2 > 0) return <Badge bg="primary" style={{ fontSize: 10 }}>En proceso</Badge>;
  if (estado1 > 0) return <Badge bg="secondary" style={{ fontSize: 10 }}>Pendiente</Badge>;
  return '—';
};

const KpiCard = ({ titulo, valor, color, bg, barColor, barBg, total, onClick }) => {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="card border-0 h-100" style={{ background: bg, borderRadius: 8, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div className="card-body py-3">
        <div style={{ fontSize: 11, color, marginBottom: 6 }}>{titulo}{onClick ? ' — clic para ver' : ''}</div>
        <div style={{ fontSize: 28, fontWeight: 500, color }}>{valor?.toLocaleString() ?? 0}</div>
        <div style={{ marginTop: 8, height: 3, background: barBg, borderRadius: 2 }}>
          <div style={{ width: `${pct}%`, height: 3, background: barColor, borderRadius: 2, transition: 'width 0.5s' }}></div>
        </div>
        <div style={{ fontSize: 10, color, marginTop: 4, opacity: 0.7 }}>{pct}% del total</div>
      </div>
    </div>
  );
};

const DashboardInterfaz = () => {
  const [tab, setTab]         = useState('ventas');
  const [resumen, setResumen] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [vista, setVista]     = useState('dashboard');
  const [filtroEstado, setFiltroEstado] = useState(null);

  const [filterFecha, setFilterFecha]   = useState('');
  const [filterTienda, setFilterTienda] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchText, setSearchText]     = useState('');
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 15 });

  // Chart refs
  const donutRef   = useRef(null);
  const barTablaRef = useRef(null);
  const barTiendaRef = useRef(null);
  const donutChart  = useRef(null);
  const barTablaChart = useRef(null);
  const barTiendaChart = useRef(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await interfazService.resumen();
        setResumen(res);
      } catch (err) {
        toast.error('Error al cargar resumen: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const datosTab = resumen?.[tab === 'ventas' ? 'ventas' : 'movimientos'];

  // Destruir charts al cambiar tab o vista
  const destroyCharts = () => {
    [donutChart, barTablaChart, barTiendaChart].forEach(ref => {
      if (ref.current) { ref.current.destroy(); ref.current = null; }
    });
  };

  useEffect(() => {
    if (vista !== 'dashboard' || !datosTab) return;
    destroyCharts();

    const total = (datosTab.pendientes ?? 0) + (datosTab.enProceso ?? 0) +
                  (datosTab.satisfactorios ?? 0) + (datosTab.errores ?? 0);

    // Donut
    if (donutRef.current) {
      donutChart.current = new Chart(donutRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Pendientes', 'En proceso', 'Satisfactorios', 'Errores'],
          datasets: [{
            data: [datosTab.pendientes, datosTab.enProceso, datosTab.satisfactorios, datosTab.errores],
            backgroundColor: ['#888780', '#185FA5', '#3B6D11', '#A32D2D'],
            borderWidth: 0,
            hoverOffset: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.toLocaleString()}` } }
          }
        }
      });
    }

    // Bar por tabla
    const tablaData = datosTab.porTabla?.slice(0, 8) ?? [];
    if (barTablaRef.current && tablaData.length > 0) {
      barTablaChart.current = new Chart(barTablaRef.current, {
        type: 'bar',
        data: {
          labels: tablaData.map(t => t.tabla),
          datasets: [{
            label: 'Errores',
            data: tablaData.map(t => t.total),
            backgroundColor: tablaData.map((_, i) =>
              i === 0 ? '#A32D2D' : i < 3 ? '#E24B4A' : '#F09595'),
            borderRadius: 4,
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#888780', maxRotation: 30 } },
            y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 }, color: '#888780' } }
          }
        }
      });
    }

    // Bar por tienda/centro
    const tiendaKey = tab === 'ventas' ? 'porTienda' : 'porCentro';
    const labelKey  = tab === 'ventas' ? 'tienda'    : 'centro';
    const tiendaData = datosTab[tiendaKey]?.slice(0, 8) ?? [];
    if (barTiendaRef.current && tiendaData.length > 0) {
      barTiendaChart.current = new Chart(barTiendaRef.current, {
        type: 'bar',
        data: {
          labels: tiendaData.map(t => t[labelKey]),
          datasets: [{
            label: 'Errores',
            data: tiendaData.map(t => t.total),
            backgroundColor: '#BA7517',
            borderRadius: 4,
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#888780' } },
            y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 }, color: '#888780' } }
          },
          onClick: (evt, elements) => {
            if (elements.length > 0) {
              const idx = elements[0].index;
              const item = tiendaData[idx];
              verDetalle(4, tab === 'ventas' ? { tienda: item[labelKey] } : { centroOrigen: item[labelKey] });
            }
          }
        }
      });
    }

    return () => destroyCharts();
  }, [datosTab, vista, tab]);

  const verDetalle = async (estadoFiltro = null, filtrosExtra = {}) => {
    try {
      destroyCharts();
      setLoadingDetalle(true);
      setVista('detalle');
      setFiltroEstado(estadoFiltro);
      setFilterFecha(''); setFilterTienda(''); setFilterEstado(estadoFiltro ? String(estadoFiltro) : '');
      setSearchText(''); setGlobalFilter('');

      const filtros = { ...filtrosExtra };
      if (estadoFiltro) filtros.estado = estadoFiltro;

      const data = tab === 'ventas'
        ? await interfazService.ventas(filtros)
        : await interfazService.movimientos(filtros);
      setDetalle(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Error al cargar detalle: ' + err.message);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setLoadingDetalle(true);
      const filtros = {};
      if (filterFecha)  filtros.fecha  = filterFecha;
      if (filterTienda) filtros.tienda = filterTienda;
      if (filterEstado) filtros.estado = filterEstado;
      const data = tab === 'ventas'
        ? await interfazService.ventas(filtros)
        : await interfazService.movimientos(filtros);
      setDetalle(Array.isArray(data) ? data : []);
    } catch (err) { toast.error(err.message); }
    finally { setLoadingDetalle(false); }
  };

  const columnsVentas = [
    columnHelper.accessor('fecha',    { header: 'Fecha',   cell: ({ getValue }) => <span className="font-monospace text-muted" style={{ fontSize: 11 }}>{getValue()}</span> }),
    columnHelper.accessor('tabla',    { header: 'Tabla',   cell: ({ getValue }) => <span className="font-monospace" style={{ fontSize: 11 }}>{getValue() ?? '—'}</span> }),
    columnHelper.accessor('tienda',   { header: 'Tienda',  cell: ({ getValue }) => <span className="fw-semibold font-monospace" style={{ color: '#185FA5' }}>{getValue()}</span> }),
    columnHelper.accessor('nroFolio', { header: 'Folio',   cell: ({ getValue }) => <span className="font-monospace" style={{ fontSize: 11 }}>{getValue()}</span> }),
    columnHelper.accessor('orden',    { header: 'Orden',   cell: ({ getValue }) => <span className="font-monospace text-muted" style={{ fontSize: 11 }}>{getValue() ?? '—'}</span> }),
    columnHelper.display({ id: 'estado', header: 'Estado', cell: ({ row }) => <EstadoBadge estado1={row.original.estado1} estado2={row.original.estado2} estado3={row.original.estado3} estado4={row.original.estado4} /> }),
    columnHelper.accessor('mensaje',  { header: 'Mensaje', cell: ({ getValue }) => { const v = getValue(); if (!v) return '—'; return <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }} title={v}>{v.length > 60 ? v.slice(0, 60) + '...' : v}</span>; } }),
  ];

  const columnsMov = [
    columnHelper.accessor('fecha',        { header: 'Fecha',   cell: ({ getValue }) => <span className="font-monospace text-muted" style={{ fontSize: 11 }}>{getValue()}</span> }),
    columnHelper.accessor('tabla',        { header: 'Tabla',   cell: ({ getValue }) => <span className="font-monospace" style={{ fontSize: 11 }}>{getValue() ?? '—'}</span> }),
    columnHelper.accessor('nroGuia',      { header: 'N° Guía', cell: ({ getValue }) => <span className="font-monospace" style={{ fontSize: 11 }}>{getValue()}</span> }),
    columnHelper.accessor('nroOc',        { header: 'N° OC',   cell: ({ getValue }) => <span className="font-monospace text-muted" style={{ fontSize: 11 }}>{getValue() ?? '—'}</span> }),
    columnHelper.accessor('centroOrigen', { header: 'Origen',  cell: ({ getValue }) => <span className="fw-semibold font-monospace" style={{ color: '#185FA5' }}>{getValue() ?? '—'}</span> }),
    columnHelper.accessor('centroDestino',{ header: 'Destino', cell: ({ getValue }) => <span className="font-monospace text-muted">{getValue() ?? '—'}</span> }),
    columnHelper.display({ id: 'estado', header: 'Estado', cell: ({ row }) => <EstadoBadge estado1={row.original.estado1} estado2={row.original.estado2} estado3={row.original.estado3} estado4={row.original.estado4} /> }),
    columnHelper.accessor('mensaje',      { header: 'Mensaje', cell: ({ getValue }) => { const v = getValue(); if (!v) return '—'; return <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }} title={v}>{v.length > 60 ? v.slice(0, 60) + '...' : v}</span>; } }),
  ];

  const table = useReactTable({
    data: detalle,
    columns: tab === 'ventas' ? columnsVentas : columnsMov,
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

  const total = datosTab
    ? (datosTab.pendientes ?? 0) + (datosTab.enProceso ?? 0) + (datosTab.satisfactorios ?? 0) + (datosTab.errores ?? 0)
    : 0;

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Control de Interfaces"
        subTitle1="Monitor"
        subTitle2="Interfaces"
        subText="Estado de interfaces de ventas y movimientos hacia SAP."
      />

      <div className="main-content">

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4">
          {['ventas', 'movimientos'].map(t => (
            <Button key={t} size="sm"
              variant={tab === t ? 'primary' : 'outline-secondary'}
              onClick={() => { setTab(t); setVista('dashboard'); }}>
              {t === 'ventas' ? 'Ventas' : 'Movimientos'}
            </Button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {vista === 'dashboard' && (
          <>
            {/* KPIs */}
            <Row className="mb-4 g-3">
              <Col xs={6} md={3}>
                <KpiCard titulo="Pendientes" valor={datosTab?.pendientes}
                  color="#5F5E5A" bg="#F1EFE8" barColor="#888780" barBg="#D3D1C7" total={total}
                  onClick={() => verDetalle(1)} />
              </Col>
              <Col xs={6} md={3}>
                <KpiCard titulo="En proceso" valor={datosTab?.enProceso}
                  color="#185FA5" bg="#E6F1FB" barColor="#185FA5" barBg="#B5D4F4" total={total}
                  onClick={() => verDetalle(2)} />
              </Col>
              <Col xs={6} md={3}>
                <KpiCard titulo="Satisfactorios" valor={datosTab?.satisfactorios}
                  color="#3B6D11" bg="#EAF3DE" barColor="#3B6D11" barBg="#C0DD97" total={total}
                  onClick={() => verDetalle(3)} />
              </Col>
              <Col xs={6} md={3}>
                <KpiCard titulo="Con error" valor={datosTab?.errores}
                  color="#A32D2D" bg="#FCEBEB" barColor="#A32D2D" barBg="#F7C1C1" total={total}
                  onClick={() => verDetalle(4)} />
              </Col>
            </Row>

            {/* Gráficos */}
            <Row className="g-3 mb-4">
              <Col md={4}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted small fw-semibold text-uppercase mb-3" style={{ fontSize: 11 }}>Distribución por estado</p>
                    <div className="d-flex flex-column gap-2 mb-3">
                      {[
                        { label: 'Pendientes', val: datosTab?.pendientes, color: '#888780' },
                        { label: 'En proceso', val: datosTab?.enProceso,  color: '#185FA5' },
                        { label: 'Satisfactorios', val: datosTab?.satisfactorios, color: '#3B6D11' },
                        { label: 'Errores', val: datosTab?.errores, color: '#A32D2D' },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }}></span>
                          <span className="text-muted" style={{ flex: 1 }}>{item.label}</span>
                          <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.val?.toLocaleString() ?? 0}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ position: 'relative', height: 180 }}>
                      <canvas ref={donutRef} role="img" aria-label="Donut chart distribución por estado">
                        Distribución de registros por estado
                      </canvas>
                    </div>
                  </div>
                </div>
              </Col>

              <Col md={8}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted small fw-semibold text-uppercase mb-3" style={{ fontSize: 11 }}>Errores por tabla</p>
                    <div style={{ position: 'relative', height: 260 }}>
                      <canvas ref={barTablaRef} role="img" aria-label="Bar chart errores por tabla">
                        Errores por tabla de interfaz
                      </canvas>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <p className="text-muted small fw-semibold text-uppercase mb-3" style={{ fontSize: 11 }}>
                  Errores por {tab === 'ventas' ? 'tienda' : 'centro origen'} — clic en barra para ver detalle
                </p>
                <div style={{ position: 'relative', height: 200 }}>
                  <canvas ref={barTiendaRef} role="img" aria-label="Bar chart errores por tienda o centro">
                    Errores por tienda o centro
                  </canvas>
                </div>
              </div>
            </div>

            {/* Fechas disponibles */}
            {(datosTab?.fechas?.length ?? 0) > 0 && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <p className="text-muted small fw-semibold text-uppercase mb-2" style={{ fontSize: 11 }}>Fechas disponibles</p>
                  <div className="d-flex flex-wrap gap-2">
                    {datosTab.fechas.map(f => (
                      <Button key={f} size="sm" variant="outline-secondary"
                        style={{ fontSize: 11, fontFamily: 'monospace' }}
                        onClick={() => verDetalle(null, { fecha: f })}>
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex gap-2 justify-content-center">
              <Button variant="outline-primary" size="sm" onClick={() => verDetalle()}>Ver todos los registros</Button>
              <Button size="sm" style={{ background: '#FCEBEB', color: '#A32D2D', border: '1px solid #F7C1C1' }}
                onClick={() => verDetalle(4)}>Ver solo errores</Button>
            </div>
          </>
        )}

        {/* ── DETALLE ── */}
        {vista === 'detalle' && (
          <>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Button variant="outline-secondary" size="sm" onClick={() => setVista('dashboard')}>
                <FaArrowLeft size={11} className="me-1" /> Volver
              </Button>
              <div>
                <h6 className="mb-0 fw-semibold">
                  {tab === 'ventas' ? 'Ventas' : 'Movimientos'}
                  {filtroEstado && (
                    <Badge className="ms-2" bg={filtroEstado === 4 ? 'danger' : filtroEstado === 3 ? 'success' : filtroEstado === 2 ? 'primary' : 'secondary'}>
                      {filtroEstado === 1 ? 'Pendientes' : filtroEstado === 2 ? 'En proceso' : filtroEstado === 3 ? 'Satisfactorios' : 'Errores'}
                    </Badge>
                  )}
                </h6>
                <small className="text-muted">{detalle.length} registros</small>
              </div>
            </div>

            <div className="st-wrapper">
              <div className="st-toolbar row mb-3 g-2 align-items-center">
                <Col xs={12} sm={6} lg={3}>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text px-2">
                      <svg className="sa-icon" width={14} height={14}><use href="/icons/sprite.svg#search"></use></svg>
                    </span>
                    <input type="text" className="form-control"
                      placeholder="Buscar folio, tabla, mensaje..."
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
                  <Form.Select size="sm" value={filterFecha} onChange={e => setFilterFecha(e.target.value)}>
                    <option value="">Todas las fechas</option>
                    {datosTab?.fechas?.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                </Col>
                {tab === 'ventas' && (
                  <Col xs={6} sm={3} lg={2}>
                    <Form.Select size="sm" value={filterTienda} onChange={e => setFilterTienda(e.target.value)}>
                      <option value="">Todas las tiendas</option>
                      {datosTab?.tiendas?.map(t => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                  </Col>
                )}
                <Col xs={6} sm={3} lg={2}>
                  <Form.Select size="sm" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="1">Pendiente</option>
                    <option value="2">En proceso</option>
                    <option value="3">Satisfactorio</option>
                    <option value="4">Error</option>
                  </Form.Select>
                </Col>
                <Col xs={6} sm={3} lg={1}>
                  <Button size="sm" variant="primary" onClick={aplicarFiltros} disabled={loadingDetalle}>Filtrar</Button>
                </Col>
              </div>

              {loadingDetalle ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
              ) : (
                <>
                  <DataTable table={table} emptyMessage="No se encontraron registros" />
                  <TablePagination
                    totalItems={totalItems} start={start} end={end} itemsName="registros" showInfo
                    previousPage={table.previousPage} canPreviousPage={table.getCanPreviousPage()}
                    pageCount={table.getPageCount()} pageIndex={table.getState().pagination.pageIndex}
                    setPageIndex={table.setPageIndex} nextPage={table.nextPage}
                    canNextPage={table.getCanNextPage()} pageSize={table.getState().pagination.pageSize}
                    onPageSizeChange={table.setPageSize} showPageLimit
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardInterfaz;