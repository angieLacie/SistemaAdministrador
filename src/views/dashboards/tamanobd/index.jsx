import { useState, useEffect, useMemo } from 'react';
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
import { FaDatabase, FaTriangleExclamation, FaArrowLeft, FaClockRotateLeft, FaCircleExclamation } from 'react-icons/fa6';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend, ReferenceLine,
} from 'recharts';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import { tamanoBaseDatosService } from '@/services/monitor.service';

const columnHelper = createColumnHelper();

const LIMIT_GB   = 10;   // SQL Express límite por BD
const WARN_GB    = 7;    // Alerta amarilla
const CRIT_GB    = 9;    // Alerta roja

const nivelColor = (gb) => {
  if (gb >= CRIT_GB) return '#dc2626';
  if (gb >= WARN_GB) return '#d97706';
  return '#16a34a';
};
const nivelBg = (gb) => {
  if (gb >= CRIT_GB) return '#fee2e2';
  if (gb >= WARN_GB) return '#fef3c7';
  return '#dcfce7';
};
const nivelLabel = (gb) => {
  if (gb >= CRIT_GB) return { text: 'CRÍTICO', bg: 'danger' };
  if (gb >= WARN_GB) return { text: 'ALERTA',  bg: 'warning' };
  return                  { text: 'OK',        bg: 'success' };
};

const BarraCapacidad = ({ gb }) => {
  const pct = Math.min((gb / LIMIT_GB) * 100, 100);
  const color = nivelColor(gb);
  return (
    <div style={{ width: '100%' }}>
      <div className="d-flex justify-content-between mb-1" style={{ fontSize: 10 }}>
        <span className="fw-semibold" style={{ color }}>{Number(gb).toFixed(2)} GB</span>
        <span className="text-muted">{pct.toFixed(0)}%</span>
      </div>
      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
};

const KpiCard = ({ titulo, valor, subtitulo, color = '#185FA5', onClick }) => (
  <div className="card border-0 shadow-sm h-100"
    style={{ cursor: onClick ? 'pointer' : 'default', borderTop: `3px solid ${color}` }}
    onClick={onClick}>
    <div className="card-body py-3">
      <p className="text-muted small text-uppercase mb-1" style={{ fontSize: 10 }}>{titulo}</p>
      <h3 className="fw-bold mb-0" style={{ color }}>{valor}</h3>
      {subtitulo && <small className="text-muted">{subtitulo}</small>}
    </div>
  </div>
);

const CustomTooltipBar = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const gb = Number(d?.tamanoTotalGB);
  const pct = Math.min((gb / LIMIT_GB) * 100, 100).toFixed(0);
  return (
    <div className="card border-0 shadow-sm p-2" style={{ fontSize: 11 }}>
      <p className="fw-semibold mb-1" style={{ color: '#185FA5' }}>{d?.tiendaNombre}</p>
      <p className="mb-0" style={{ color: '#6b7280', fontSize: 10 }}>{d?.nombreBaseDatos}</p>
      <hr className="my-1" />
      <p className="mb-0">Total: <strong style={{ color: nivelColor(gb) }}>{gb.toFixed(2)} GB</strong></p>
      <p className="mb-0">Capacidad usada: <strong>{pct}% de {LIMIT_GB} GB</strong></p>
      <p className="mb-0" style={{ color: '#2563eb' }}>Datos: {Number(d?.tamanoDatosGB).toFixed(2)} GB</p>
      <p className="mb-0" style={{ color: '#60a5fa' }}>Log: {Number(d?.tamanoLogGB).toFixed(2)} GB</p>
    </div>
  );
};

const DashboardTamanoBD = () => {
  const [registros, setRegistros] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingSub, setLoadingSub] = useState(false);

  const [vista, setVista]               = useState('dashboard');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);
  const [filtroNivel, setFiltroNivel]   = useState('');
  const [filtroBD, setFiltroBD]         = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchText, setSearchText]     = useState('');
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 15 });

  useEffect(() => {
    tamanoBaseDatosService.ultimos({})
      .then(setRegistros)
      .catch(e => toast.error('Error al cargar datos: ' + e.message))
      .finally(() => setLoading(false));
  }, []);

  // Nombres únicos normalizados a MAYÚSCULAS (RETAILDATA y RetailData → mismo botón)
  const nombresBDs = useMemo(() =>
    [...new Set(registros.map(r => r.nombreBaseDatos.toUpperCase()))].sort(),
    [registros]);

  // Base filtrada por BD — comparación case-insensitive
  const registrosBase = useMemo(() =>
    filtroBD ? registros.filter(r => r.nombreBaseDatos.toUpperCase() === filtroBD) : registros,
    [registros, filtroBD]);

  // Derivados del dashboard — reflejan el filtro BD
  const criticas  = useMemo(() => registrosBase.filter(r => r.tamanoTotalGB >= CRIT_GB), [registrosBase]);
  const alertas   = useMemo(() => registrosBase.filter(r => r.tamanoTotalGB >= WARN_GB && r.tamanoTotalGB < CRIT_GB), [registrosBase]);
  const errores   = useMemo(() => registrosBase.filter(r => r.estado !== 'OK'), [registrosBase]);
  const totalGB   = useMemo(() => registrosBase.reduce((s, r) => s + Number(r.tamanoTotalGB), 0), [registrosBase]);

  const topTiendas = useMemo(() =>
    [...registrosBase].sort((a, b) => b.tamanoTotalGB - a.tamanoTotalGB).slice(0, 10),
    [registrosBase]);

  // Tabla: filtro adicional por nivel
  const registrosFiltrados = useMemo(() => {
    if (filtroNivel === 'critico') return criticas;
    if (filtroNivel === 'alerta')  return alertas;
    if (filtroNivel === 'error')   return errores;
    return registrosBase;
  }, [filtroNivel, registrosBase, criticas, alertas, errores]);

  const verTabla = (nivel = '') => {
    setFiltroNivel(nivel);
    setFiltroBD('');
    setSearchText('');
    setGlobalFilter('');
    setVista('tabla');
  };

  const verHistorial = async (tienda) => {
    try {
      setLoadingSub(true);
      setVista('historial');
      setTiendaSeleccionada(tienda);
      const data = await tamanoBaseDatosService.historial(tienda.tiendaId, { dias: 30 });
      setHistorial(data);
    } catch (e) {
      toast.error('Error al cargar historial: ' + e.message);
    } finally {
      setLoadingSub(false);
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('tiendaNombre', {
      header: 'Tienda / BD',
      cell: ({ row }) => (
        <div>
          <span className="fw-semibold" style={{ color: '#185FA5', fontSize: 12 }}>
            {row.original.tiendaNombre}
          </span>
          <div className="text-muted font-monospace" style={{ fontSize: 10 }}>
            {row.original.nombreBaseDatos}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('tamanoTotalGB', {
      header: 'Capacidad usada',
      cell: ({ getValue }) => <BarraCapacidad gb={getValue()} />,
    }),
    columnHelper.accessor('tamanoDatosGB', {
      header: 'Datos (GB)',
      cell: ({ getValue }) => <span style={{ fontSize: 12 }}>{Number(getValue()).toFixed(2)}</span>,
    }),
    columnHelper.accessor('tamanoLogGB', {
      header: 'Log (GB)',
      cell: ({ getValue }) => <span style={{ fontSize: 12 }}>{Number(getValue()).toFixed(2)}</span>,
    }),
    columnHelper.display({
      id: 'nivel',
      header: 'Nivel',
      cell: ({ row }) => {
        const { text, bg } = nivelLabel(row.original.tamanoTotalGB);
        return <Badge bg={bg} text={bg === 'warning' ? 'dark' : undefined} style={{ fontSize: 10 }}>{text}</Badge>;
      },
    }),
    columnHelper.accessor('fechaRegistro', {
      header: 'Actualización',
      cell: ({ getValue }) => (
        <span className="text-muted" style={{ fontSize: 11 }}>
          {new Date(getValue()).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="outline-primary" style={{ fontSize: 10, padding: '2px 8px' }}
          onClick={() => verHistorial(row.original)}>
          <FaClockRotateLeft size={10} className="me-1" /> Historial
        </Button>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: registrosFiltrados,
    columns,
    state: { globalFilter, pagination },
    initialState: { sorting: [{ id: 'tamanoTotalGB', desc: true }] },
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

  const historialChart = useMemo(() =>
    [...historial]
      .sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro))
      .map(r => ({
        fecha: new Date(r.fechaRegistro).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }),
        Total: Number(r.tamanoTotalGB),
        Datos: Number(r.tamanoDatosGB),
        Log:   Number(r.tamanoLogGB),
      })),
    [historial]);

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Tamaño de Base de Datos — SQL Express"
        subTitle1="Monitor"
        subTitle2="Dashboard"
        subText={`Límite SQL Express: ${LIMIT_GB} GB por base de datos. Alerta ≥ ${WARN_GB} GB · Crítico ≥ ${CRIT_GB} GB.`}
      />

      <div className="main-content">

        {/* ── DASHBOARD ── */}
        {vista === 'dashboard' && (
          <>
            {/* Filtro BD — botones */}
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="text-muted small me-1">Base de datos:</span>
              <button
                className={`btn btn-sm ${filtroBD === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ fontSize: 11 }}
                onClick={() => setFiltroBD('')}>
                Todas
              </button>
              {nombresBDs.map(bd => (
                <button
                  key={bd}
                  className={`btn btn-sm ${filtroBD === bd ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: 11 }}
                  onClick={() => setFiltroBD(bd)}>
                  {bd}
                </button>
              ))}
            </div>

            {/* KPIs */}
            <Row className="mb-4 g-3">
              <Col xs={6} md={3}>
                <KpiCard titulo="Total BDs" valor={registrosBase.length}
                  subtitulo={`${[...new Set(registrosBase.map(r => r.tiendaId))].length} tiendas`}
                  color="#185FA5" onClick={() => verTabla()} />
              </Col>
              <Col xs={6} md={3}>
                <KpiCard titulo={`Críticas ≥ ${CRIT_GB} GB`} valor={criticas.length}
                  subtitulo="cerca del límite de 10 GB"
                  color={criticas.length > 0 ? '#dc2626' : '#16a34a'}
                  onClick={() => criticas.length > 0 && verTabla('critico')} />
              </Col>
              <Col xs={6} md={3}>
                <KpiCard titulo={`En alerta ≥ ${WARN_GB} GB`} valor={alertas.length}
                  subtitulo="requieren seguimiento"
                  color={alertas.length > 0 ? '#d97706' : '#16a34a'}
                  onClick={() => alertas.length > 0 && verTabla('alerta')} />
              </Col>
              <Col xs={6} md={3}>
                <KpiCard titulo="Con error" valor={errores.length}
                  subtitulo="fallos de conexión/lectura"
                  color={errores.length > 0 ? '#dc2626' : '#16a34a'}
                  onClick={() => errores.length > 0 && verTabla('error')} />
              </Col>
            </Row>

            {/* Gráfico + Panel críticas */}
            <Row className="mb-4 g-3">
              <Col md={8}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2 d-flex align-items-center justify-content-between"
                    style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
                    <span className="fw-semibold small" style={{ color: '#1e40af' }}>
                      <FaDatabase size={12} className="me-1" />
                      Top 10 BDs más grandes — límite SQL Express ({LIMIT_GB} GB)
                    </span>
                    <Button size="sm" variant="outline-primary" style={{ fontSize: 11 }}
                      onClick={() => verTabla()}>Ver todas</Button>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={topTiendas} margin={{ top: 10, right: 20, left: 10, bottom: 65 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="tiendaNombre" tick={{ fontSize: 9 }} angle={-40} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} unit=" GB" domain={[0, LIMIT_GB + 1]} />
                        <Tooltip content={<CustomTooltipBar />} />
                        <ReferenceLine y={LIMIT_GB} stroke="#dc2626" strokeDasharray="5 3"
                          label={{ value: `Límite ${LIMIT_GB} GB`, position: 'insideTopRight', fontSize: 10, fill: '#dc2626' }} />
                        <ReferenceLine y={WARN_GB} stroke="#d97706" strokeDasharray="5 3"
                          label={{ value: `Alerta ${WARN_GB} GB`, position: 'insideTopRight', fontSize: 10, fill: '#d97706' }} />
                        <Bar dataKey="tamanoTotalGB" name="Total GB" radius={[4, 4, 0, 0]}
                          onClick={(d) => verHistorial(d)}>
                          {topTiendas.map((r, i) => (
                            <Cell key={i} fill={nivelColor(r.tamanoTotalGB)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>

              {/* Panel críticas/alertas */}
              <Col md={4}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header py-2"
                    style={{ background: criticas.length > 0 ? '#fee2e2' : '#fef3c7', borderBottom: `1px solid ${criticas.length > 0 ? '#fca5a5' : '#fcd34d'}` }}>
                    <span className="fw-semibold small" style={{ color: criticas.length > 0 ? '#991b1b' : '#92400e' }}>
                      <FaCircleExclamation size={12} className="me-1" />
                      BDs críticas y en alerta
                    </span>
                  </div>
                  <div className="card-body p-0" style={{ overflowY: 'auto', maxHeight: 290 }}>
                    {criticas.length === 0 && alertas.length === 0 ? (
                      <div className="text-center text-muted py-4" style={{ fontSize: 12 }}>
                        Todas las BDs dentro del límite
                      </div>
                    ) : (
                      <table className="table table-sm table-hover mb-0" style={{ fontSize: 11 }}>
                        <tbody>
                          {[...criticas, ...alertas].map(r => {
                            const { text, bg } = nivelLabel(r.tamanoTotalGB);
                            const pct = Math.min((r.tamanoTotalGB / LIMIT_GB) * 100, 100).toFixed(0);
                            return (
                              <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => verHistorial(r)}>
                                <td style={{ width: '50%' }}>
                                  <div className="fw-semibold" style={{ color: '#185FA5', fontSize: 11 }}>{r.tiendaNombre}</div>
                                  <div className="text-muted font-monospace" style={{ fontSize: 9 }}>{r.nombreBaseDatos}</div>
                                </td>
                                <td>
                                  <Badge bg={bg} text={bg === 'warning' ? 'dark' : undefined} style={{ fontSize: 9 }}>{text}</Badge>
                                  <div style={{ fontSize: 10, color: nivelColor(r.tamanoTotalGB) }} className="mt-1">
                                    {Number(r.tamanoTotalGB).toFixed(2)} GB ({pct}%)
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            {/* Resumen total */}
            <Row className="g-3">
              <Col>
                <div className="card border-0 shadow-sm">
                  <div className="card-body py-2 d-flex align-items-center gap-4 flex-wrap" style={{ fontSize: 12 }}>
                    <span className="text-muted">Total almacenado:</span>
                    <span className="fw-bold" style={{ color: '#7c3aed' }}>{totalGB.toFixed(1)} GB</span>
                    <span className="text-muted ms-3">Distribución:</span>
                    <span style={{ color: '#16a34a' }}>✓ OK: {registros.filter(r => r.tamanoTotalGB < WARN_GB).length} BDs</span>
                    <span style={{ color: '#d97706' }}>⚠ Alerta: {alertas.length} BDs</span>
                    <span style={{ color: '#dc2626' }}>✕ Crítico: {criticas.length} BDs</span>
                    {errores.length > 0 && <span style={{ color: '#dc2626' }}>⛔ Error: {errores.length} BDs</span>}
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}

        {/* ── TABLA COMPLETA ── */}
        {vista === 'tabla' && (
          <>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Button variant="outline-secondary" size="sm" onClick={() => setVista('dashboard')}>
                <FaArrowLeft size={11} className="me-1" /> Volver
              </Button>
              <div>
                <h6 className="mb-0 fw-semibold">
                  Bases de datos
                  {filtroNivel === 'critico' && <Badge className="ms-2" bg="danger">Críticas ≥ {CRIT_GB} GB</Badge>}
                  {filtroNivel === 'alerta'  && <Badge className="ms-2" bg="warning" text="dark">Alerta ≥ {WARN_GB} GB</Badge>}
                  {filtroNivel === 'error'   && <Badge className="ms-2" bg="danger">Con error</Badge>}
                  {!filtroNivel             && <Badge className="ms-2" bg="secondary">Todas</Badge>}
                </h6>
                <small className="text-muted">{registrosFiltrados.length} registros</small>
              </div>
            </div>

            <div className="st-wrapper">
              <div className="st-toolbar row mb-3 g-2 align-items-center">
                <Col xs={12} sm={6} lg={3}>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text px-2">
                      <svg className="sa-icon" width={14} height={14}><use href="/icons/sprite.svg#search" /></svg>
                    </span>
                    <input type="text" className="form-control"
                      placeholder="Buscar tienda, base de datos..."
                      value={searchText}
                      onChange={e => { setSearchText(e.target.value); setGlobalFilter(e.target.value); }}
                      autoComplete="off" />
                    {searchText && (
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => { setSearchText(''); setGlobalFilter(''); }}>✕</button>
                    )}
                  </div>
                </Col>
                <Col xs={6} sm={3} lg={2}>
                  <Form.Select size="sm" value={filtroNivel} onChange={e => { setFiltroNivel(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}>
                    <option value="">Todos los niveles</option>
                    <option value="critico">Críticas ≥ {CRIT_GB} GB</option>
                    <option value="alerta">Alerta ≥ {WARN_GB} GB</option>
                    <option value="error">Con error</option>
                  </Form.Select>
                </Col>
                <Col xs={6} sm={4} lg={3}>
                  <Form.Select size="sm" value={filtroBD} onChange={e => { setFiltroBD(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}>
                    <option value="">Todas las BDs</option>
                    {nombresBDs.map(bd => (
                      <option key={bd} value={bd}>{bd}</option>
                    ))}
                  </Form.Select>
                </Col>
              </div>

              <DataTable table={table} emptyMessage="No se encontraron registros" />
              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="registros" showInfo
                previousPage={table.previousPage} canPreviousPage={table.getCanPreviousPage()}
                pageCount={table.getPageCount()} pageIndex={table.getState().pagination.pageIndex}
                setPageIndex={table.setPageIndex} nextPage={table.nextPage}
                canNextPage={table.getCanNextPage()} pageSize={table.getState().pagination.pageSize}
                onPageSizeChange={table.setPageSize} showPageLimit
              />
            </div>
          </>
        )}

        {/* ── HISTORIAL ── */}
        {vista === 'historial' && (
          <>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Button variant="outline-secondary" size="sm" onClick={() => setVista('tabla')}>
                <FaArrowLeft size={11} className="me-1" /> Volver
              </Button>
              <div>
                <h6 className="mb-0 fw-semibold">
                  Historial — últimos 30 días
                  <Badge className="ms-2" bg="primary">{tiendaSeleccionada?.tiendaNombre}</Badge>
                  <Badge className="ms-1" bg="secondary" style={{ fontSize: 10 }}>{tiendaSeleccionada?.nombreBaseDatos}</Badge>
                </h6>
                <small className="text-muted">{historial.length} registros</small>
              </div>
            </div>

            {loadingSub ? (
              <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : (
              <div className="card border-0 shadow-sm">
                <div className="card-header py-2 d-flex align-items-center gap-3"
                  style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
                  <span className="fw-semibold small" style={{ color: '#1e40af' }}>
                    Evolución del tamaño (GB) — límite SQL Express {LIMIT_GB} GB
                  </span>
                  {tiendaSeleccionada && (() => {
                    const { text, bg } = nivelLabel(tiendaSeleccionada.tamanoTotalGB);
                    return <Badge bg={bg} text={bg === 'warning' ? 'dark' : undefined}>{text} — {Number(tiendaSeleccionada.tamanoTotalGB).toFixed(2)} GB</Badge>;
                  })()}
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historialChart} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} unit=" GB" domain={[0, LIMIT_GB + 0.5]} />
                      <Tooltip formatter={(v) => `${v.toFixed(3)} GB`} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <ReferenceLine y={LIMIT_GB} stroke="#dc2626" strokeDasharray="5 3"
                        label={{ value: `Límite ${LIMIT_GB} GB`, position: 'insideTopRight', fontSize: 10, fill: '#dc2626' }} />
                      <ReferenceLine y={WARN_GB} stroke="#d97706" strokeDasharray="5 3"
                        label={{ value: `Alerta ${WARN_GB} GB`, position: 'insideTopRight', fontSize: 10, fill: '#d97706' }} />
                      <Line type="monotone" dataKey="Total" stroke="#185FA5" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Datos" stroke="#2563eb" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                      <Line type="monotone" dataKey="Log"   stroke="#60a5fa" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardTamanoBD;
