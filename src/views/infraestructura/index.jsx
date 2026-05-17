import { useEffect, useMemo, useRef, useState } from 'react';
import { lineasCorporativasApi, personalApi } from '@/api/monitor.api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getFilteredRowModel, getSortedRowModel, flexRender,
} from '@tanstack/react-table';

const normalize = (s) => s.toLowerCase().replace(/[\s.\-_]/g, '');

const SearchableSelect = ({ value, onChange, options, placeholder }) => {
  const [text, setText] = useState(value || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = useMemo(() => {
    const q = normalize(text);
    return options.filter(o => normalize(o).includes(q) || o.toLowerCase().includes(text.toLowerCase()));
  }, [options, text]);

  useEffect(() => { setText(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (opt) => { onChange(opt); setText(opt); setOpen(false); };
  const clear   = () => { onChange(''); setText(''); setOpen(false); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="input-group input-group-sm">
        <input
          className="form-control form-control-sm"
          placeholder={placeholder}
          value={text}
          onChange={e => { setText(e.target.value); setOpen(true); if (!e.target.value) onChange(''); }}
          onFocus={() => setOpen(true)}
        />
        {text && (
          <button className="btn btn-outline-secondary btn-sm px-2" type="button" onClick={clear}>×</button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1050,
          maxHeight: 220, overflowY: 'auto', margin: 0, padding: 0,
          listStyle: 'none', background: '#fff', border: '1px solid #dee2e6',
          borderRadius: '0 0 4px 4px', boxShadow: '0 4px 12px rgba(0,0,0,.1)',
        }}>
          {filtered.map(o => (
            <li key={o}
              onMouseDown={() => select(o)}
              style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '0.82rem',
                background: o === value ? '#e8f0fe' : undefined }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f7ff'}
              onMouseLeave={e => e.currentTarget.style.background = o === value ? '#e8f0fe' : ''}>
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
const OP_COLOR = { ENTEL: '#f59e0b', CLARO: '#ef4444', MOVISTAR: '#3b82f6' };

const fmt = (v) => v == null ? '—' : Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN = (v) => v == null ? '—' : Number(v).toLocaleString('es-PE');

// ── Edición inline de Con IGV ────────────────────────────────────────────────
function InlineIgv({ row, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState('');
  const [saving, setSaving]   = useState(false);

  const open = () => { setVal(row.costoConIgv != null ? String(row.costoConIgv) : ''); setEditing(true); };

  const save = async () => {
    const num = parseFloat(val);
    if (isNaN(num)) { setEditing(false); return; }
    setSaving(true);
    try {
      await lineasCorporativasApi.actualizar(row.id, { ...row, costoConIgv: num });
      onSaved(row.id, num);
      setEditing(false);
    } catch { /* silencioso */ }
    finally { setSaving(false); }
  };

  const onKey = (e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); };

  if (editing) return (
    <div className="d-flex align-items-center gap-1" style={{ minWidth: 100 }}>
      <input
        autoFocus
        type="number"
        step="0.01"
        className="form-control form-control-sm text-end"
        style={{ width: 80, fontSize: 12, padding: '1px 4px' }}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={onKey}
        onBlur={save}
        disabled={saving}
      />
    </div>
  );

  return (
    <span
      className="text-end d-block"
      style={{ color: '#d97706', cursor: 'pointer', borderBottom: '1px dashed #d97706' }}
      title="Clic para editar"
      onClick={open}
    >
      {fmt(row.costoConIgv)}
    </span>
  );
}

export default function LineasCorporativasDashboard() {
  const [vista, setVista] = useState('dashboard'); // dashboard | tabla | personal
  const [resumen, setResumen] = useState(null);
  const [filtros, setFiltros] = useState({ periodos: [], operadores: [], estados: [], empresas: [], estadosLaboral: [], puestos: [] });
  const [lineas, setLineas]   = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros activos
  const [periodo,  setPeriodo]  = useState('');
  const [operador,       setOperador]       = useState('');
  const [estado,         setEstado]         = useState('');
  const [estadoLaboral,  setEstadoLaboral]  = useState('');
  const [puesto,         setPuesto]         = useState('');
  const [search,         setSearch]         = useState('');
  const [empresa,        setEmpresa]        = useState('');

  // Modal edición
  const [editRow,    setEditRow]    = useState(null);
  const [editData,   setEditData]   = useState({});
  const [guardando,  setGuardando]  = useState(false);

  // Copiar periodo
  const [copiando,   setCopiando]   = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  // Estado pestaña Personal
  const [personal,         setPersonal]         = useState([]);
  const [filtrosPersonal,  setFiltrosPersonal]  = useState({ empresas: [], puestos: [], estadosLaboral: [] });
  const [pEmpresa,         setPEmpresa]         = useState('');
  const [pPuesto,          setPPuesto]          = useState('');
  const [pEstadoLaboral,   setPEstadoLaboral]   = useState('');
  const [pSearch,          setPSearch]          = useState('');
  const [pPagination,      setPPagination]      = useState({ pageIndex: 0, pageSize: 20 });

  // Cargar filtros disponibles
  useEffect(() => {
    lineasCorporativasApi.filtros().then(setFiltros).catch(() => {});
    personalApi.filtros().then(setFiltrosPersonal).catch(() => {});
  }, []);

  // Cargar resumen cuando cambia el periodo
  useEffect(() => {
    setCargando(true);
    lineasCorporativasApi.resumen(periodo)
      .then(setResumen)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [periodo]);

  // Cargar líneas cuando cambian los filtros server-side (solo en vista tabla)
  useEffect(() => {
    if (vista !== 'tabla') return;
    lineasCorporativasApi.lineas({ periodo, operador, estado, empresa, estadoLaboral, puesto, search })
      .then(setLineas)
      .catch(() => {});
  }, [vista, periodo, operador, estado, empresa, estadoLaboral, puesto, search]);

  const abrirEdicion = (row) => { setEditRow(row); setEditData({ ...row }); };
  const cerrarEdicion = () => { setEditRow(null); setEditData({}); };
  const guardarEdicion = async () => {
    // Validar duplicado: periodo + operador + linea + dni (excluyendo el mismo registro)
    const duplicado = lineas.some(l =>
      l.id !== editData.id &&
      l.periodoMes === editData.periodoMes &&
      l.operador   === editData.operador &&
      l.linea      === editData.linea &&
      l.dni        === editData.dni
    );
    if (duplicado) {
      alert(`Ya existe un registro para el periodo ${editData.periodoMes}, operador ${editData.operador}, línea ${editData.linea} y DNI ${editData.dni}.`);
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await lineasCorporativasApi.actualizar(editData.id, editData);
      setLineas(prev => prev.map(l => l.id === actualizado.id ? actualizado : l));
      cerrarEdicion();
    } catch { /* error silencioso */ }
    finally { setGuardando(false); }
  };

  const copiarPeriodo = async () => {
    if (!periodo) return alert('Selecciona un periodo para copiar.');
    const sig = (() => {
      const [y, m] = periodo.split('-').map(Number);
      const d = new Date(y, m, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })();
    if (!confirm(`¿Copiar ${lineas.length > 0 ? lineas.length : '?'} registros de ${periodo} → ${sig}?`)) return;
    setCopiando(true);
    try {
      const r = await lineasCorporativasApi.copiarPeriodo(periodo, false);
      alert(`✓ ${r.copiados} líneas copiadas al periodo ${r.periodoDestino}`);
      lineasCorporativasApi.filtros().then(setFiltros).catch(() => {});
    } catch (e) {
      const msg = e?.response?.data?.mensaje;
      if (msg && confirm(msg + '\n\n¿Deseas sobrescribir?')) {
        const r = await lineasCorporativasApi.copiarPeriodo(periodo, true);
        alert(`✓ ${r.copiados} líneas copiadas al periodo ${r.periodoDestino}`);
        lineasCorporativasApi.filtros().then(setFiltros).catch(() => {});
      }
    } finally { setCopiando(false); }
  };

  // Cargar personal
  useEffect(() => {
    if (vista !== 'personal') return;
    personalApi.lista({ empresa: pEmpresa, puesto: pPuesto, estadoLaboral: pEstadoLaboral, search: pSearch })
      .then(setPersonal)
      .catch(() => {});
  }, [vista, pEmpresa, pPuesto, pEstadoLaboral, pSearch]);

  const columns = useMemo(() => [
    { id: 'acciones', header: '', size: 40, enableSorting: false,
      cell: ({ row }) => (
        <button className="btn btn-xs btn-outline-primary px-1 py-0" title="Editar"
          onClick={() => abrirEdicion(row.original)}>✎</button>
      )
    },
    { accessorKey: 'periodoMes',   header: 'Periodo',  size: 80 },
    { accessorKey: 'operador',     header: 'Operador', size: 90,
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className={`badge`} style={{ background: OP_COLOR[v] || '#6b7280' }}>{v}</span>;
      }
    },
    { accessorKey: 'linea',        header: 'Línea',    size: 110 },
    { accessorKey: 'plan',         header: 'Plan',     size: 160 },
    { accessorKey: 'nombre',       header: 'Nombre',   size: 200 },
    { accessorKey: 'dni',          header: 'DNI',      size: 90 },
    { id: 'empresa', header: 'Empresa', size: 160,
      accessorFn: r => r.empresaPersonal || r.empresaCod || '—',
      cell: ({ getValue, row }) => (
        <span title={row.original.empresaPersonal ? `Personal: ${row.original.empresaPersonal}` : ''}>
          {getValue()}
        </span>
      )
    },
    { id: 'ceco', header: 'CECO', size: 110,
      accessorFn: r => r.cecoPersonal || r.ceco || '—',
    },
    { id: 'descCeco', header: 'Desc. CECO', size: 180,
      accessorFn: r => r.descCecoPersonal || r.descripcionCeco || '—',
    },
    { accessorKey: 'responsable',      header: 'Responsable',   size: 180 },
    { accessorKey: 'estado',           header: 'Estado',        size: 110,
      cell: ({ getValue }) => {
        const v = getValue() || '—';
        const bg = v === 'Asignado' ? 'success' : v.toLowerCase().includes('baja') ? 'danger' : v.toLowerCase().includes('suspend') ? 'warning' : 'secondary';
        return <span className={`badge bg-${bg}`}>{v}</span>;
      }
    },
    { id: 'costoConIgv', header: 'Con IGV S/', size: 110,
      accessorFn: r => r.costoConIgv,
      cell: ({ row }) => <InlineIgv row={row.original} onSaved={(id, val) =>
        setLineas(prev => prev.map(l => l.id === id ? { ...l, costoConIgv: val } : l))}
      />
    },
    { id: 'sinIgv', header: 'Sin IGV S/', size: 100,
      accessorFn: r => r.costoConIgv != null ? r.costoConIgv / 1.18 : null,
      cell: ({ getValue }) => <span className="text-end d-block" style={{ color: '#374151' }}>{fmt(getValue())}</span>
    },
    { id: 'margen', header: 'Margen S/', size: 100,
      accessorFn: r => r.costoConIgv != null ? (r.costoConIgv / 1.18) / 0.85 : null,
      cell: ({ getValue }) => <span className="text-end d-block" style={{ color: '#d97706' }}>{fmt(getValue())}</span>
    },
    { id: 'aFacturar', header: 'A Facturar S/', size: 115,
      accessorFn: r => {
        if (r.costoConIgv == null) return null;
        const sinIgv = r.costoConIgv / 1.18;
        const margen = sinIgv / 0.85;
        return sinIgv + margen;
      },
      cell: ({ getValue }) => <span className="text-end d-block fw-semibold" style={{ color: '#185FA5' }}>{fmt(getValue())}</span>
    },
    { accessorKey: 'puesto',           header: 'Puesto',        size: 160 },
    { accessorKey: 'estadoLaboral',    header: 'Est. Laboral',  size: 100,
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v) return '—';
        return <span className={`badge ${v === 'ACTIVO' ? 'bg-success' : 'bg-danger'}`}>{v}</span>;
      }
    },
    { accessorKey: 'fechaIngreso', header: 'F. Ingreso', size: 100,
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v) return '—';
        return new Date(v).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    },
    { accessorKey: 'fechaCese', header: 'F. Cese', size: 100,
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v) return '—';
        return new Date(v).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    },
  ], []);

  const table = useReactTable({
    data: lineas,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const colsPersonal = useMemo(() => [
    { accessorKey: 'dni',           header: 'DNI',           size: 100 },
    { accessorKey: 'nombre',        header: 'Nombre',        size: 220 },
    { accessorKey: 'empresa',       header: 'Empresa',       size: 200 },
    { accessorKey: 'cecoId',        header: 'CECO',          size: 110 },
    { accessorKey: 'ceco',          header: 'Desc. CECO',    size: 200 },
    { accessorKey: 'puesto',        header: 'Puesto',        size: 200 },
    { accessorKey: 'estadoLaboral', header: 'Est. Laboral',  size: 100,
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v) return '—';
        return <span className={`badge ${v === 'ACTIVO' ? 'bg-success' : 'bg-danger'}`}>{v}</span>;
      }
    },
    { accessorKey: 'fechaIngreso',  header: 'F. Ingreso',    size: 100,
      cell: ({ getValue }) => {
        const v = getValue(); if (!v) return '—';
        return new Date(v).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    },
    { accessorKey: 'fechaCese',     header: 'F. Cese',       size: 100,
      cell: ({ getValue }) => {
        const v = getValue(); if (!v) return '—';
        return new Date(v).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    },
  ], []);

  const tablePersonal = useReactTable({
    data: personal,
    columns: colsPersonal,
    state: { pagination: pPagination },
    onPaginationChange: setPPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const periodoLabel = periodo || 'Todos los periodos';

  return (
    <>
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 className="mb-0 fw-600">Líneas Corporativas 2026</h4>
          <small className="text-muted">ENTEL · CLARO · MOVISTAR</small>
        </div>
        <div className="d-flex gap-2">
          <button className={`btn btn-sm ${vista === 'dashboard' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setVista('dashboard')}>Dashboard</button>
          <button className={`btn btn-sm ${vista === 'tabla'     ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setVista('tabla')}>Detalle</button>
          <button className={`btn btn-sm ${vista === 'personal'  ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setVista('personal')}>Personal</button>
        </div>
      </div>

      {/* Filtro de periodo */}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <span className="text-muted small">Periodo:</span>
        <button className={`btn btn-sm ${periodo === '' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPeriodo('')}>Todos</button>
        {filtros.periodos.map(p => (
          <button key={p} className={`btn btn-sm ${periodo === p ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPeriodo(p)}>{p}</button>
        ))}
      </div>

      {/* ── VISTA DASHBOARD ── */}
      {vista === 'dashboard' && (
        <>
          {cargando ? (
            <div className="text-center py-5 text-muted">Cargando...</div>
          ) : resumen && (
            <>
              {/* KPIs */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center">
                      <div className="fs-1 fw-700 text-primary">{fmtN(resumen.totalLineas)}</div>
                      <div className="text-muted small">Total Líneas</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center">
                      <div className="fs-1 fw-700 text-success">S/ {fmt(resumen.costoTotal)}</div>
                      <div className="text-muted small">Costo Total</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center">
                      <div className="fs-1 fw-700 text-warning">S/ {fmt(resumen.montoFacturar)}</div>
                      <div className="text-muted small">Monto a Facturar</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center">
                      <div className="fs-1 fw-700 text-info">{resumen.periodos?.length || 1}</div>
                      <div className="text-muted small">Periodos</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                {/* Por Operador — barras */}
                <div className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-transparent fw-500">Líneas por Operador</div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={resumen.porOperador} barSize={40}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="operador" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v, n) => n === 'costoTotal' ? `S/ ${fmt(v)}` : fmtN(v)} />
                          <Legend />
                          <Bar dataKey="total" name="Líneas" fill="#3b82f6" radius={[4,4,0,0]} />
                          <Bar dataKey="costoTotal" name="Costo S/" fill="#10b981" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Por Estado — pie */}
                <div className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-transparent fw-500">Líneas por Estado</div>
                    <div className="card-body d-flex align-items-center">
                      <ResponsiveContainer width="50%" height={220}>
                        <PieChart>
                          <Pie data={resumen.porEstado} dataKey="total" nameKey="estado" cx="50%" cy="50%" outerRadius={80} label={false}>
                            {resumen.porEstado.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="d-flex flex-column gap-1" style={{ fontSize: '0.78rem' }}>
                        {resumen.porEstado.map((e, i) => (
                          <div key={i} className="d-flex align-items-center gap-2">
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                            <span className="text-truncate" style={{ maxWidth: 140 }}>{e.estado}</span>
                            <span className="fw-600 ms-auto">{fmtN(e.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top empresas */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent fw-500">Top 10 Empresas por Líneas</div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Empresa</th>
                          <th className="text-end">Líneas</th>
                          <th className="text-end">Costo S/</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen.porEmpresa.map((e, i) => (
                          <tr key={i}>
                            <td className="text-muted">{i + 1}</td>
                            <td>{e.empresa}</td>
                            <td className="text-end fw-500">{fmtN(e.total)}</td>
                            <td className="text-end text-success fw-500">S/ {fmt(e.costoTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── VISTA TABLA DETALLE ── */}
      {vista === 'tabla' && (
        <>
          {/* Filtros adicionales */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-3">
              <input className="form-control form-control-sm" placeholder="Buscar línea, nombre, DNI..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="col-6 col-md-2">
              <SearchableSelect value={empresa} onChange={setEmpresa} options={filtros.empresas} placeholder="Empresa" />
            </div>
            <div className="col-6 col-md-2">
              <SearchableSelect value={operador} onChange={setOperador} options={filtros.operadores} placeholder="Operador" />
            </div>
            <div className="col-6 col-md-2">
              <SearchableSelect value={estado} onChange={setEstado} options={filtros.estados} placeholder="Estado línea" />
            </div>
            <div className="col-6 col-md-2">
              <SearchableSelect value={estadoLaboral} onChange={setEstadoLaboral} options={filtros.estadosLaboral} placeholder="Est. laboral" />
            </div>
            <div className="col-12 col-md-3">
              <SearchableSelect value={puesto} onChange={setPuesto} options={filtros.puestos} placeholder="Puesto" />
            </div>
            <div className="col-auto d-flex align-items-center gap-2">
              <span className="badge bg-secondary py-2">{lineas.length} líneas</span>
              {periodo && (
                <button className="btn btn-sm btn-outline-success" onClick={copiarPeriodo} disabled={copiando}>
                  {copiando ? '...' : `Copiar → ${(() => { const [y,m]=periodo.split('-').map(Number); const d=new Date(y,m,1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })()}`}
                </button>
              )}
            </div>
          </div>

          {/* Tabla */}
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
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} style={{ whiteSpace: 'nowrap' }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {table.getRowModel().rows.length === 0 && (
                    <tr><td colSpan={12} className="text-center text-muted py-4">Sin resultados</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top">
              <div className="d-flex align-items-center gap-2">
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

      {/* ── VISTA PERSONAL ── */}
      {vista === 'personal' && (
        <>
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
              <input className="form-control form-control-sm" placeholder="Buscar DNI, nombre, CECO..." value={pSearch} onChange={e => setPSearch(e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <SearchableSelect value={pEmpresa} onChange={setPEmpresa} options={filtrosPersonal.empresas} placeholder="Empresa" />
            </div>
            <div className="col-6 col-md-2">
              <SearchableSelect value={pEstadoLaboral} onChange={setPEstadoLaboral} options={filtrosPersonal.estadosLaboral} placeholder="Est. laboral" />
            </div>
            <div className="col-12 col-md-3">
              <SearchableSelect value={pPuesto} onChange={setPPuesto} options={filtrosPersonal.puestos} placeholder="Puesto" />
            </div>
            <div className="col-auto d-flex align-items-center">
              <span className="badge bg-secondary py-2">{personal.length} personas</span>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0" style={{ fontSize: '0.82rem' }}>
                <thead className="table-light">
                  {tablePersonal.getHeaderGroups().map(hg => (
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
                  {tablePersonal.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} style={{ whiteSpace: 'nowrap' }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {tablePersonal.getRowModel().rows.length === 0 && (
                    <tr><td colSpan={9} className="text-center text-muted py-4">Sin resultados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top">
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => tablePersonal.previousPage()} disabled={!tablePersonal.getCanPreviousPage()}>‹</button>
                <span className="small">Pág {tablePersonal.getState().pagination.pageIndex + 1} / {tablePersonal.getPageCount()}</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => tablePersonal.nextPage()} disabled={!tablePersonal.getCanNextPage()}>›</button>
              </div>
              <select className="form-select form-select-sm w-auto" value={pPagination.pageSize} onChange={e => setPPagination(p => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))}>
                {[20, 50, 100].map(s => <option key={s} value={s}>{s} por pág.</option>)}
              </select>
            </div>
          </div>
        </>
      )}
    </div>

    {/* ── MODAL EDICIÓN ── */}
    {editRow && (
      <div className="modal d-block" style={{ background: 'rgba(0,0,0,.45)' }} onClick={e => e.target === e.currentTarget && cerrarEdicion()}>
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar línea — {editRow.linea}</h5>
              <button type="button" className="btn-close" onClick={cerrarEdicion} />
            </div>
            <div className="modal-body">
              <div className="row g-3">

                {/* Periodo */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Periodo</label>
                  <select className="form-select form-select-sm"
                    value={editData.periodoMes ?? ''}
                    onChange={e => setEditData(d => ({ ...d, periodoMes: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {filtros.periodos?.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Estado */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Estado</label>
                  <select className="form-select form-select-sm"
                    value={editData.estado ?? ''}
                    onChange={e => setEditData(d => ({ ...d, estado: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {['Asignado', 'Custodia', 'Suspendido', 'Baja'].map(s =>
                      <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Operador */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Operador</label>
                  <input className="form-control form-control-sm"
                    value={editData.operador ?? ''}
                    onChange={e => setEditData(d => ({ ...d, operador: e.target.value }))} />
                </div>

                {/* Línea */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Línea</label>
                  <input className="form-control form-control-sm"
                    value={editData.linea ?? ''}
                    onChange={e => setEditData(d => ({ ...d, linea: e.target.value }))} />
                </div>

                {/* Plan */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Plan</label>
                  <input className="form-control form-control-sm"
                    value={editData.plan ?? ''}
                    onChange={e => setEditData(d => ({ ...d, plan: e.target.value }))} />
                </div>

                {/* Costo */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Costo S/</label>
                  <input type="number" step="0.01" className="form-control form-control-sm"
                    value={editData.costoLinea ?? ''}
                    onChange={e => setEditData(d => ({ ...d, costoLinea: e.target.value === '' ? null : Number(e.target.value) }))} />
                </div>

                {/* Equipo */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Equipo</label>
                  <input className="form-control form-control-sm"
                    value={editData.equipo ?? ''}
                    onChange={e => setEditData(d => ({ ...d, equipo: e.target.value }))} />
                </div>

                {/* DNI — busca en personal al salir */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">DNI</label>
                  <input className="form-control form-control-sm"
                    value={editData.dni ?? ''}
                    onChange={e => setEditData(d => ({ ...d, dni: e.target.value }))}
                    onBlur={async (e) => {
                      const dni = e.target.value.trim();
                      if (!dni) return;
                      try {
                        const res = await personalApi.buscarPorDni(dni);
                        const lista = Array.isArray(res) ? res : (res?.items ?? []);
                        const persona = lista.find(p => p.dni === dni);
                        if (persona) {
                          setEditData(d => ({
                            ...d,
                            nombre:          persona.nombre          ?? d.nombre,
                            empresaCod:      persona.empresa         ?? d.empresaCod,
                            ceco:            persona.cecoId          ?? d.ceco,
                            descripcionCeco: persona.ceco            ?? d.descripcionCeco,
                          }));
                        }
                      } catch { /* silencioso */ }
                    }}
                  />
                </div>

                {/* Nombre */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Nombre</label>
                  <input className="form-control form-control-sm"
                    value={editData.nombre ?? ''}
                    onChange={e => setEditData(d => ({ ...d, nombre: e.target.value }))} />
                </div>

                {/* Empresa */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Empresa</label>
                  <input className="form-control form-control-sm"
                    value={editData.empresaCod ?? ''}
                    onChange={e => setEditData(d => ({ ...d, empresaCod: e.target.value }))} />
                </div>

                {/* CECO */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">CECO</label>
                  <input className="form-control form-control-sm"
                    value={editData.ceco ?? ''}
                    onChange={e => setEditData(d => ({ ...d, ceco: e.target.value }))} />
                </div>

                {/* Desc. CECO */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Desc. CECO</label>
                  <input className="form-control form-control-sm"
                    value={editData.descripcionCeco ?? ''}
                    onChange={e => setEditData(d => ({ ...d, descripcionCeco: e.target.value }))} />
                </div>

                {/* Responsable */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Responsable</label>
                  <input className="form-control form-control-sm"
                    value={editData.responsable ?? ''}
                    onChange={e => setEditData(d => ({ ...d, responsable: e.target.value }))} />
                </div>

                {/* Año Cobro */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Año Cobro</label>
                  <input type="number" className="form-control form-control-sm"
                    value={editData.anioCobro ?? ''}
                    onChange={e => setEditData(d => ({ ...d, anioCobro: e.target.value === '' ? null : Number(e.target.value) }))} />
                </div>

                {/* Mes Cobro */}
                <div className="col-6 col-md-4">
                  <label className="form-label small mb-1">Mes Cobro</label>
                  <input className="form-control form-control-sm"
                    value={editData.mesCobro ?? ''}
                    onChange={e => setEditData(d => ({ ...d, mesCobro: e.target.value }))} />
                </div>

              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={cerrarEdicion}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={guardarEdicion} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
