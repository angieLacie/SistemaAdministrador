import { useState, useEffect, useMemo } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Row, Col, Spinner, Badge, Modal, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaXmark, FaPen, FaToggleOn, FaToggleOff, FaCircleCheck, FaCircleXmark, FaPlus } from 'react-icons/fa6';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import SearchableSelect from '@/components/SearchableSelect';
import KpiCard   from '@/components/KpiCard';
import DataTable  from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import { indicadoresApi } from '@/api/monitor.api';

const columnHelper = createColumnHelper();

// ── Semáforo ─────────────────────────────────────────────────────────────────
const SEMAFORO = {
  VERDE:    { bg: '#dcfce7', color: '#166534', label: 'OK' },
  AMARILLO: { bg: '#fef3c7', color: '#92400e', label: 'Atención' },
  ROJO:     { bg: '#fee2e2', color: '#991b1b', label: 'Crítico' },
  SINDATA:  { bg: '#f3f4f6', color: '#6b7280', label: 'Sin datos' },
};

const GRUPO_COLORS = {
  RMS:  { bg: '#dbeafe', color: '#1e40af' },
  SERV: { bg: '#ede9fe', color: '#5b21b6' },
  NOT:  { bg: '#dcfce7', color: '#166534' },
};

const SemaforoBadge = ({ estado }) => {
  const s = SEMAFORO[estado] || SEMAFORO.SINDATA;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700,
      padding: '2px 8px', borderRadius: 20,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {s.label}
    </span>
  );
};

// ── Modal Crear / Editar ──────────────────────────────────────────────────────
const GRUPOS_OPCIONES = [
  { value: 'RMS',  label: 'RMS Retail' },
  { value: 'SERV', label: 'Servicios' },
  { value: 'NOT',  label: 'Notificaciones' },
];

function ModalEditar({ item, onClose, onSaved }) {
  const esNuevo = !item?.idIndicador;
  const [form, setForm] = useState({
    nombre_Indicador:  item?.nombre_Indicador  || '',
    descripcion:       item?.descripcion       || '',
    pagina:            item?.pagina            || '',
    grupo:             item?.grupo             || '',
    umbralVerde:       item?.umbralVerde       ?? 0,
    umbralAmarillo:    item?.umbralAmarillo    ?? 10,
    job_Email:         item?.job_Email         || '',
    store_Procedure:   item?.store_Procedure   || '',
    flag_implementado: item?.flag_implementado ?? 0,
    estado:            item?.estado            || 'A',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const payload = () => ({
    Nombre_Indicador:  form.nombre_Indicador,
    Descripcion:       form.descripcion,
    Pagina:            form.pagina          || null,
    Grupo:             form.grupo           || null,
    UmbralVerde:       Number(form.umbralVerde),
    UmbralAmarillo:    Number(form.umbralAmarillo),
    Job_Email:         form.job_Email       || null,
    Store_Procedure:   form.store_Procedure || null,
    flag_implementado: Number(form.flag_implementado),
    Estado:            form.estado,
  });

  const guardar = async () => {
    if (!form.nombre_Indicador.trim()) return toast.warning('El código es requerido.');
    if (!form.descripcion.trim())      return toast.warning('La descripción es requerida.');
    setSaving(true);
    try {
      if (esNuevo) {
        await indicadoresApi.crear(payload());
        toast.success('Indicador creado correctamente.');
      } else {
        await indicadoresApi.editar(item.idIndicador, payload());
        toast.success('Indicador actualizado.');
      }
      onSaved();
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 16 }}>
          {esNuevo ? 'Nuevo Indicador' : <>Editar Indicador — <span style={{ color: '#185FA5' }}>#{item.idIndicador}</span></>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ fontSize: 12, fontWeight: 600 }}>Código KPI</Form.Label>
              <Form.Control size="sm" value={form.nombre_Indicador}
                onChange={e => set('nombre_Indicador', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ fontSize: 12, fontWeight: 600 }}>Grupo / Sistema</Form.Label>
              <Form.Select size="sm" value={form.grupo} onChange={e => set('grupo', e.target.value)}>
                <option value="">— Sin grupo —</option>
                {GRUPOS_OPCIONES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label style={{ fontSize: 12, fontWeight: 600 }}>Descripción (nombre visible)</Form.Label>
              <Form.Control size="sm" value={form.descripcion}
                onChange={e => set('descripcion', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label style={{ fontSize: 12, fontWeight: 600 }}>Página / Ruta</Form.Label>
              <Form.Control size="sm" value={form.pagina} placeholder="/ruta/de/pagina"
                onChange={e => set('pagina', e.target.value)} />
            </Form.Group>
          </Col>

          <Col md={12}>
            <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
                Umbrales de alerta
                <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', marginLeft: 8 }}>
                  ≤ Verde → OK · ≤ Amarillo → Atención · &gt; Amarillo → Crítico
                </span>
              </p>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>🟢 Umbral Verde (máx OK)</Form.Label>
                    <Form.Control size="sm" type="number" min={0} value={form.umbralVerde}
                      onChange={e => set('umbralVerde', e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>🟡 Umbral Amarillo (máx atención)</Form.Label>
                    <Form.Control size="sm" type="number" min={0} value={form.umbralAmarillo}
                      onChange={e => set('umbralAmarillo', e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Col>

          <Col md={12}>
            <Form.Group>
              <Form.Label style={{ fontSize: 12, fontWeight: 600 }}>Store Procedure</Form.Label>
              <Form.Control size="sm" value={form.store_Procedure} placeholder="SCHEMA.usp_NombreProcedimiento"
                onChange={e => set('store_Procedure', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label style={{ fontSize: 12, fontWeight: 600 }}>Emails de alerta</Form.Label>
              <Form.Control size="sm" value={form.job_Email} placeholder="correo1@empresa.com;correo2@empresa.com"
                onChange={e => set('job_Email', e.target.value)} />
              <Form.Text className="text-muted" style={{ fontSize: 11 }}>Separar con punto y coma (;)</Form.Text>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ fontSize: 12, fontWeight: 600 }}>En Dashboard</Form.Label>
              <Form.Select size="sm" value={form.flag_implementado}
                onChange={e => set('flag_implementado', Number(e.target.value))}>
                <option value={1}>Sí — Visible en dashboard</option>
                <option value={0}>No — Oculto</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ fontSize: 12, fontWeight: 600 }}>Estado</Form.Label>
              <Form.Select size="sm" value={form.estado} onChange={e => set('estado', e.target.value)}>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="primary" size="sm" onClick={guardar} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
const GestionIndicadores = () => {
  const [data,         setData]         = useState([]);
  const [grupos,       setGrupos]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [grupo,        setGrupo]        = useState('');
  const [implementado, setImplementado] = useState('');
  const [editando,     setEditando]     = useState(null);
  const [pagination,   setPagination]   = useState({ pageIndex: 0, pageSize: 10 });

  const cargar = () => {
    setLoading(true);
    indicadoresApi.listar({ grupo, implementado })
      .then(r => setData(Array.isArray(r) ? r : []))
      .catch(err => toast.error('Error: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    indicadoresApi.grupos().then(r => setGrupos(Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  useEffect(() => { cargar(); }, [grupo, implementado]);

  const toggleImplementado = async (id) => {
    try {
      await indicadoresApi.toggleImplementado(id);
      setData(prev => prev.map(d =>
        d.idIndicador === id ? { ...d, flag_implementado: d.flag_implementado === 1 ? 0 : 1 } : d
      ));
      toast.success('Actualizado.');
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };

  const onSaved = () => { setEditando(null); cargar(); };

  // ── Columnas ────────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    columnHelper.accessor('idIndicador', {
      header: '#',
      cell: ({ getValue }) => <span className="text-muted">{getValue()}</span>,
    }),
    columnHelper.accessor('grupo', {
      header: 'Grupo',
      cell: ({ getValue }) => {
        const g = getValue();
        const gc = GRUPO_COLORS[g] || { bg: '#f3f4f6', color: '#374151' };
        return g
          ? <span style={{ background: gc.bg, color: gc.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>{g}</span>
          : <span className="text-muted">—</span>;
      },
    }),
    columnHelper.accessor('nombre_Indicador', {
      header: 'Código',
      cell: ({ getValue }) => <code style={{ fontSize: 12, fontWeight: 600 }}>{getValue()}</code>,
    }),
    columnHelper.accessor('descripcion', {
      header: 'Descripción',
      cell: ({ getValue }) => (
        <span title={getValue()} style={{ display: 'block', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('cantidad', {
      header: 'Valor',
      cell: ({ getValue }) => <span style={{ fontWeight: 700, fontSize: 15 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('estadoSemaforo', {
      header: 'Estado',
      cell: ({ getValue }) => <SemaforoBadge estado={getValue()} />,
    }),
    columnHelper.accessor('flag_implementado', {
      header: 'Dashboard',
      cell: ({ row }) => (
        <button
          onClick={() => toggleImplementado(row.original.idIndicador)}
          title={row.original.flag_implementado === 1 ? 'Quitar del dashboard' : 'Agregar al dashboard'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
        >
          {row.original.flag_implementado === 1
            ? <FaToggleOn  size={22} color="#16a34a" />
            : <FaToggleOff size={22} color="#d1d5db" />}
        </button>
      ),
    }),
    columnHelper.accessor('umbralVerde', {
      header: 'Umbrales',
      cell: ({ row }) => (
        <span style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
          <span style={{ color: '#166534' }}>🟢≤{row.original.umbralVerde ?? 0}</span>
          <span style={{ color: '#92400e', marginLeft: 6 }}>🟡≤{row.original.umbralAmarillo ?? 10}</span>
        </span>
      ),
    }),
    columnHelper.accessor('ult_Fecha_Ejecucion', {
      header: 'Última ejecución',
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className="text-muted" style={{ fontSize: 12 }}>
          {v ? new Date(v).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
        </span>;
      },
    }),
    columnHelper.accessor('estado', {
      header: 'Estado',
      cell: ({ getValue }) => getValue() === 'A'
        ? <FaCircleCheck size={15} color="#16a34a" title="Activo" />
        : <FaCircleXmark size={15} color="#d1d5db" title="Inactivo" />,
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <button title="Editar" onClick={() => setEditando(row.original)}
          style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:7, border:'1.5px solid #bfdbfe', background:'#eff6ff', color:'#185FA5', cursor:'pointer', transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#185FA5'; }}
          onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; e.currentTarget.style.borderColor='#bfdbfe'; }}>
          <FaPen size={13} />
        </button>
      ),
    }),
  ], [data]);

  // ── TanStack Table ──────────────────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, pagination },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
  });

  const pageIndex  = table.getState().pagination.pageIndex;
  const pageSize   = table.getState().pagination.pageSize;
  const totalItems = table.getFilteredRowModel().rows.length;
  const start      = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const end        = Math.min(start + pageSize - 1, totalItems);

  // ── KPI stats ───────────────────────────────────────────────────────────────
  const totalEnDashboard = data.filter(d => d.flag_implementado === 1).length;
  const totalActivos     = data.filter(d => d.estado === 'A').length;
  const totalCriticos    = data.filter(d => d.estadoSemaforo === 'ROJO').length;

  const grupoOptions = grupos.map(g => ({ value: g, label: g }));
  const implOptions  = [
    { value: '1', label: 'En dashboard' },
    { value: '0', label: 'Ocultos' },
  ];

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión de Indicadores"
        subTitle1="Monitor"
        subTitle2="Indicadores"
        subText="Configura los KPIs del dashboard de sincronización."
      />

      <div className="main-content">

        {/* KPIs */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <KpiCard label="Total Indicadores" value={data.length}
              color="#185FA5" badgeBg="#dbeafe" badgeColor="#1e40af"
              badge={data.length} subtitle="registrados" />
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="En Dashboard" value={totalEnDashboard}
              color="#16a34a" badgeBg="#dcfce7" badgeColor="#166534"
              badge={`${data.length > 0 ? Math.round((totalEnDashboard / data.length) * 100) : 0}%`}
              subtitle="del total" />
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="Activos" value={totalActivos}
              color="#7c3aed" badgeBg="#ede9fe" badgeColor="#5b21b6"
              badge={totalActivos} subtitle="habilitados" />
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="En Crítico" value={totalCriticos}
              color="#dc2626" badgeBg="#fee2e2" badgeColor="#991b1b"
              badge={totalCriticos} subtitle="requieren atención" />
          </Col>
        </Row>

        {/* Toolbar */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2 px-3">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={4}>
                <div style={{ position: 'relative' }}>
                  <i className="ri-search-line" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }} />
                  <input type="text" value={globalFilter}
                    onChange={e => { setGlobalFilter(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
                    placeholder="Buscar código, descripción, grupo..."
                    style={{ width: '100%', padding: '7px 36px 7px 32px', border: '1.5px solid #dde1e7', borderRadius: 8, fontSize: 13, outline: 'none', background: 'white' }}
                    onFocus={e => e.target.style.borderColor = '#185FA5'}
                    onBlur={e  => e.target.style.borderColor = '#dde1e7'}
                  />
                  {globalFilter && (
                    <button onClick={() => setGlobalFilter('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, display: 'flex' }}>
                      <FaXmark size={12} />
                    </button>
                  )}
                </div>
              </Col>
              <Col xs={12} md={3}>
                <SearchableSelect options={grupoOptions} value={grupo}
                  onChange={v => { setGrupo(v); setPagination(p => ({ ...p, pageIndex: 0 })); }}
                  placeholder="Filtrar por grupo..." />
              </Col>
              <Col xs={12} md={2}>
                <SearchableSelect options={implOptions} value={implementado}
                  onChange={v => { setImplementado(v); setPagination(p => ({ ...p, pageIndex: 0 })); }}
                  placeholder="Dashboard..." />
              </Col>
              <Col xs="auto" className="ms-auto">
                <button onClick={() => setEditando({})}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
                  <FaPlus size={12} /> Nuevo indicador
                </button>
              </Col>
            </Row>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <DataTable
              table={table}
              emptyMessage="No se encontraron indicadores."
              exportFileName={`indicadores_${new Date().toISOString().slice(0, 10)}`}
            />
            <TablePagination
              totalItems={totalItems}
              start={start}
              end={end}
              itemsName="indicadores"
              showInfo
              previousPage={table.previousPage}
              canPreviousPage={table.getCanPreviousPage()}
              pageCount={table.getPageCount()}
              pageIndex={pageIndex}
              setPageIndex={table.setPageIndex}
              nextPage={table.nextPage}
              canNextPage={table.getCanNextPage()}
              pageSize={pageSize}
              onPageSizeChange={s => table.setPageSize(s)}
              showPageLimit
            />
          </>
        )}

      </div>

      {editando !== null && (
        <ModalEditar
          item={editando}
          onClose={() => setEditando(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
};

export default GestionIndicadores;
