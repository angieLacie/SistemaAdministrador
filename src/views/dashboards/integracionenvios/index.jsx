import { useEffect, useMemo, useState } from 'react';
import { integracionEnviosApi } from '@/api/monitor.api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, flexRender,
} from '@tanstack/react-table';

const fmtFecha = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};
const fmtBytes = (b) => {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};
const fmtNum = (v) => v == null ? '—' : Number(v).toLocaleString('es-PE');

const EstadoBadge = ({ estado }) => {
  if (!estado) return <span className="badge bg-secondary">—</span>;
  const cls = estado === 'OK' ? 'bg-success' : estado === 'ERROR' ? 'bg-danger' : 'bg-warning';
  return <span className={`badge ${cls}`}>{estado}</span>;
};

const CLIENT_COLORS = { tiendasel: '#3b82f6', johnholden: '#f59e0b' };

export default function IntegracionEnviosDashboard() {
  const [vista,   setVista]   = useState('dashboard');
  const [resumen, setResumen] = useState(null);
  const [filtros, setFiltros] = useState({ clientes: [], estados: [], periodos: [] });
  const [envios,  setEnvios]  = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros detalle
  const [cliente,    setCliente]    = useState('');
  const [estado,     setEstado]     = useState('');
  const [periodo,    setPeriodo]    = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [search,     setSearch]     = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  // Filtro resumen
  const [filtroCliente, setFiltroCliente] = useState('');

  useEffect(() => {
    integracionEnviosApi.filtros().then(setFiltros).catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    integracionEnviosApi.resumen({ cliente: filtroCliente })
      .then(setResumen).catch(() => {}).finally(() => setCargando(false));
  }, [filtroCliente]);

  useEffect(() => {
    if (vista !== 'detalle') return;
    integracionEnviosApi.envios({ cliente, estado, periodo, fechaDesde, fechaHasta, search })
      .then(setEnvios).catch(() => {});
  }, [vista, cliente, estado, periodo, fechaDesde, fechaHasta, search]);

  const columns = useMemo(() => [
    { accessorKey: 'id',             header: 'ID',         size: 55 },
    { accessorKey: 'fechaEnvio',     header: 'Fecha Envío',  size: 140,
      cell: ({ getValue }) => <span style={{ fontSize: '0.8rem' }}>{fmtFecha(getValue())}</span> },
    { accessorKey: 'cliente',        header: 'Cliente',    size: 120,
      cell: ({ getValue }) => {
        const v = getValue();
        const color = CLIENT_COLORS[v] || '#6b7280';
        return <span className="badge" style={{ background: color }}>{v}</span>;
      }
    },
    { accessorKey: 'periodo',        header: 'Periodo',    size: 90 },
    { accessorKey: 'nombreArchivo',  header: 'Archivo',    size: 220,
      cell: ({ getValue }) => <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{getValue()}</span> },
    { accessorKey: 'registros',      header: 'Registros',  size: 90,
      cell: ({ getValue }) => <span className="text-end d-block fw-500">{fmtNum(getValue())}</span> },
    { accessorKey: 'tamanoBytes',    header: 'Tamaño',     size: 80,
      cell: ({ getValue }) => <span className="text-end d-block text-muted">{fmtBytes(getValue())}</span> },
    { accessorKey: 'duracionSegundos', header: 'Duración', size: 85,
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className="text-end d-block">{v != null ? `${Number(v).toFixed(2)}s` : '—'}</span>;
      }
    },
    { accessorKey: 'estado',         header: 'Estado',     size: 80,
      cell: ({ getValue }) => <EstadoBadge estado={getValue()} /> },
    { accessorKey: 'mensajeError',   header: 'Error',      size: 200,
      cell: ({ getValue }) => {
        const v = getValue();
        return v ? <span className="text-danger small">{v}</span> : <span className="text-muted">—</span>;
      }
    },
    { accessorKey: 'rutaRemota',     header: 'Ruta Remota', size: 200,
      cell: ({ getValue }) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6b7280' }}>{getValue() || '—'}</span> },
  ], []);

  const table = useReactTable({
    data: envios, columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 className="mb-0 fw-600">Integración Envíos</h4>
          <small className="text-muted">Historial de archivos enviados a clientes</small>
        </div>
        <div className="d-flex gap-2">
          <button className={`btn btn-sm ${vista === 'dashboard' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setVista('dashboard')}>Dashboard</button>
          <button className={`btn btn-sm ${vista === 'detalle'   ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setVista('detalle')}>Detalle</button>
        </div>
      </div>

      {/* ── DASHBOARD ── */}
      {vista === 'dashboard' && (
        <>
          {/* Filtro cliente */}
          <div className="d-flex gap-2 mb-3 align-items-center flex-wrap">
            <span className="text-muted small">Cliente:</span>
            <button className={`btn btn-sm ${filtroCliente === '' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFiltroCliente('')}>Todos</button>
            {filtros.clientes.map(c => (
              <button key={c} className={`btn btn-sm ${filtroCliente === c ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFiltroCliente(c)}>{c}</button>
            ))}
          </div>

          {cargando ? (
            <div className="text-center py-5 text-muted">Cargando...</div>
          ) : resumen && (
            <>
              {/* KPIs */}
              <div className="row g-3 mb-4">
                {[
                  { label: 'Total Envíos',    value: fmtNum(resumen.totalEnvios),    color: 'primary',  icon: '📤' },
                  { label: 'Exitosos',         value: fmtNum(resumen.exitosos),       color: 'success',  icon: '✅' },
                  { label: 'Con Error',        value: fmtNum(resumen.errores),        color: resumen.errores > 0 ? 'danger' : 'secondary', icon: '❌' },
                  { label: 'Total Registros',  value: fmtNum(resumen.totalRegistros), color: 'info',     icon: '📋' },
                  { label: 'Total Enviado',    value: fmtBytes(resumen.totalBytes),   color: 'warning',  icon: '💾' },
                  { label: 'Duración Prom.',   value: resumen.duracionPromedio != null ? `${Number(resumen.duracionPromedio).toFixed(2)}s` : '—', color: 'secondary', icon: '⏱️' },
                ].map(({ label, value, color, icon }) => (
                  <div key={label} className="col-6 col-md-2">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center py-3">
                        <div className="fs-4 mb-1">{icon}</div>
                        <div className={`fs-4 fw-700 text-${color}`}>{value}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row g-3 mb-4">
                {/* Envíos por día */}
                <div className="col-12 col-lg-7">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-transparent fw-500">Envíos por Día</div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={resumen.porDia} barSize={32}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v, n) => n === 'registros' ? fmtNum(v) : v} />
                          <Legend />
                          <Bar dataKey="exitosos" name="Exitosos" fill="#10b981" radius={[4,4,0,0]} stackId="a" />
                          <Bar dataKey="errores"  name="Errores"  fill="#ef4444" radius={[4,4,0,0]} stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Resumen por cliente */}
                <div className="col-12 col-lg-5">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-transparent fw-500">Por Cliente</div>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Cliente</th>
                            <th className="text-end">Envíos</th>
                            <th className="text-end">Registros</th>
                            <th className="text-end">Último Envío</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resumen.porCliente.map(c => (
                            <tr key={c.cliente}>
                              <td>
                                <span className="badge" style={{ background: CLIENT_COLORS[c.cliente] || '#6b7280' }}>{c.cliente}</span>
                              </td>
                              <td className="text-end">
                                <span className="text-success fw-500">{c.exitosos}</span>
                                {c.errores > 0 && <span className="text-danger ms-1">/ {c.errores} err</span>}
                              </td>
                              <td className="text-end fw-500">{fmtNum(c.registros)}</td>
                              <td className="text-end text-muted small">{fmtFecha(c.ultimoEnvio)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registros por día */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-transparent fw-500">Registros Enviados por Día</div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={resumen.porDia}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={v => fmtNum(v)} />
                      <Line type="monotone" dataKey="registros" name="Registros" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── DETALLE ── */}
      {vista === 'detalle' && (
        <>
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-3">
              <input className="form-control form-control-sm" placeholder="Buscar archivo, cliente..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select form-select-sm" value={cliente} onChange={e => setCliente(e.target.value)}>
                <option value="">Todos los clientes</option>
                {filtros.clientes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select form-select-sm" value={estado} onChange={e => setEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                {filtros.estados.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <input type="date" className="form-control form-control-sm" title="Desde" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
            </div>
            <div className="col-6 col-md-2">
              <input type="date" className="form-control form-control-sm" title="Hasta" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
            </div>
            <div className="col-auto d-flex align-items-center">
              <span className="badge bg-secondary py-2">{envios.length} envíos</span>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0" style={{ fontSize: '0.82rem' }}>
                <thead className="table-light">
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th key={h.id} style={{ whiteSpace: 'nowrap' }}
                          onClick={h.column.getToggleSortingHandler()} className="cursor-pointer user-select-none">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {h.column.getIsSorted() === 'asc' ? ' ↑' : h.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className={row.original.estado !== 'OK' ? 'table-danger' : ''}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} style={{ whiteSpace: 'nowrap' }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {table.getRowModel().rows.length === 0 && (
                    <tr><td colSpan={11} className="text-center text-muted py-4">Sin resultados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top">
              <div className="d-flex gap-2 align-items-center">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</button>
                <span className="small">Pág {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</button>
              </div>
              <select className="form-select form-select-sm w-auto" value={pagination.pageSize} onChange={e => setPagination(p => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))}>
                {[20, 50, 100].map(s => <option key={s} value={s}>{s} por pág.</option>)}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
