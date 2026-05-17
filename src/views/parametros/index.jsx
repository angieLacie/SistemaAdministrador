import { useState, useEffect, useMemo } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getExpandedRowModel,
} from '@tanstack/react-table';
import { Row, Col, Badge, Spinner } from 'react-bootstrap';
import SearchableSelect from '@/components/SearchableSelect';
import { toast } from 'react-toastify';
import { FaChevronRight, FaChevronDown, FaPlus, FaPen, FaTrash, FaPowerOff, FaXmark } from 'react-icons/fa6';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import ConfirmModal from '@/components/modals/ConfirmModal';
 

import { parametroService } from '@/services/parametro.service';
import { empresaService, tiendaService } from '@/services/maestros.service';
import ParametroModal from './ParametroModal';

const columnHelper = createColumnHelper();

const EstadoBadge = ({ estado }) => (
  <Badge bg={estado === 'A' ? 'success' : 'secondary'} className="px-2">
    {estado === 'A' ? 'Activo' : 'Inactivo'}
  </Badge>
);

const ValorBadge = ({ valor }) => {
  if (valor === '0' || valor === 0) return <Badge bg="success">Activo</Badge>;
  if (valor === '1' || valor === 1) return <Badge bg="danger">Bloqueado</Badge>;
  return <span className="text-muted">—</span>;
};


const Parametros = () => {
  const [data, setData]         = useState([]);
  const [tiendas, setTiendas]   = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [codigos, setCodigos]   = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const [filtros, setFiltros] = useState({
    periodo: '', empresa: '', tienda: '', estado: '', valor: '', codigo: '',
  });
  const [searchText, setSearchText]     = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 });
  const [showFilters, setShowFilters]   = useState(false);

  const [showModal, setShowModal]             = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [selected, setSelected]               = useState(null);
  const [expanded, setExpanded] = useState({});
  // ===== Carga =====
  const cargar = async () => {
    if (!filtros.periodo) {
      toast.warning('El periodo es obligatorio');
      return;
    }
    try {
      setLoading(true);
      const res = await parametroService.listar(filtros);
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error('Error al cargar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarMaestros = async () => {
    try {
      const [t, e, c, p] = await Promise.all([
        tiendaService.listar(),
        empresaService.listar(),
        parametroService.listarCodigos(),
        parametroService.listarPeriodos(),
      ]);
      setTiendas(Array.isArray(t) ? t : []);
      setEmpresas(Array.isArray(e) ? e : []);
      setCodigos(Array.isArray(c) ? c : []);
      const listaPeriodos = (Array.isArray(p) ? p : []).sort();
      setPeriodos(listaPeriodos);
      return listaPeriodos;
    } catch (err) {
      toast.error('Error cargando maestros: ' + err.message);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      const listaPeriodos = await cargarMaestros();
      // Tomar el último periodo disponible como default
      const ultimoPeriodo = listaPeriodos.length > 0
        ? listaPeriodos[listaPeriodos.length - 1]
        : new Date().getFullYear().toString();
      setFiltros(f => ({ ...f, periodo: ultimoPeriodo }));
      // Cargar datos con ese periodo
      try {
        setLoading(true);
        const res = await parametroService.listar({ periodo: ultimoPeriodo });
        setData(Array.isArray(res) ? res : []);
      } catch (err) {
        toast.error('Error al cargar: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ===== KPIs =====
  const kpis = useMemo(() => ({
    total: data.length,
    activos: data.filter(p => p.parametroEstado === 'A').length,
    inactivos: data.filter(p => p.parametroEstado === 'I').length,
    empresas: new Set(data.filter(p => p.empresa).map(p => p.empresa)).size,
  }), [data]); // KPIs sobre datos totales del periodo

  const filtrosActivos = [filtros.empresa, filtros.tienda, filtros.estado, filtros.valor, filtros.codigo].filter(Boolean).length;

  // Opciones de Valor dinámicas desde los datos cargados
  const valoresUnicos = useMemo(() =>
    [...new Set(data.map(d => String(d.valor ?? '')).filter(Boolean))].sort()
  , [data]);

  // Opciones de Código: value=código, label="código - nombre" (para buscar por ambos)
  const codigoOpciones = useMemo(() => {
    const mapaNames = {};
    data.forEach(d => {
      if (d.parametroCodigo && !mapaNames[d.parametroCodigo])
        mapaNames[d.parametroCodigo] = d.parametroNombre || '';
    });
    return codigos.map(c => ({
      value: c,
      label: mapaNames[c] ? `${c} - ${mapaNames[c]}` : c,
    }));
  }, [codigos, data]);

  // Filtrado client-side sobre los datos ya cargados
  const dataFiltrada = useMemo(() => {
    return data.filter(row => {
      if (filtros.empresa && row.empresa !== filtros.empresa) return false;
      if (filtros.tienda  && row.tienda  !== filtros.tienda)  return false;
      if (filtros.codigo  && row.parametroCodigo !== filtros.codigo) return false;
      if (filtros.estado  && row.parametroEstado !== filtros.estado) return false;
      if (filtros.valor   && String(row.valor ?? '').toLowerCase() !== String(filtros.valor).toLowerCase()) return false;
      return true;
    });
  }, [data, filtros]);

  // ===== Columnas =====
  const columns = [
    columnHelper.display({
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <button onClick={() => row.toggleExpanded()}
          style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:'2px 4px', display:'flex', alignItems:'center' }}>
          {row.getIsExpanded() ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
        </button>
      ),
    }),
    columnHelper.accessor('parametroCodigo', {
      header: 'Código',
      cell: ({ row }) => <span className="fw-semibold text-primary">{row.original.parametroCodigo}</span>,
    }),
    columnHelper.accessor('parametroNombre', {
      header: 'Nombre',
      cell: ({ row }) => row.original.parametroNombre || <span className="text-muted">—</span>,
    }),
    columnHelper.accessor('empresa', {
      header: 'Empresa',
      cell: ({ row }) => row.original.empresa
        ? <span>{row.original.empresa} - {row.original.empresaDescripcion}</span>
        : <span className="text-muted">—</span>,
    }),
    columnHelper.accessor('tienda', {
      header: 'Tienda',
      cell: ({ row }) => {
        if (!row.original.tienda) return <span className="text-muted">—</span>;
        const txt = `${row.original.tienda} - ${row.original.tiendaDescripcion}`;
        return (
          <span className="text-truncate d-inline-block" style={{ maxWidth: 200 }} title={txt}>
            {txt}
          </span>
        );
      },
    }),
    columnHelper.accessor('valor', {
      header: 'Valor',
      cell: ({ row }) => <ValorBadge valor={row.original.valor} />,
    }),
    columnHelper.accessor('parametroEstado', {
      header: 'Estado',
      cell: ({ row }) => <EstadoBadge estado={row.original.parametroEstado} />,
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          {[
            { icon: <FaPen size={13}/>, title: 'Editar', color: '#185FA5', bg: '#eff6ff', bd: '#bfdbfe', onClick: () => { setSelected(row.original); setShowModal(true); } },
            { icon: <FaPowerOff size={13}/>, title: 'Cambiar estado', color: '#d97706', bg: '#fffbeb', bd: '#fde68a', onClick: () => { setSelected(row.original); setShowToggleModal(true); } },
            { icon: <FaTrash size={13}/>, title: 'Eliminar', color: '#dc2626', bg: '#fef2f2', bd: '#fecaca', onClick: () => { setSelected(row.original); setShowDeleteModal(true); } },
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
  data: dataFiltrada,
  columns,
  state: { globalFilter, pagination, expanded },
  onPaginationChange: setPagination,
  onGlobalFilterChange: setGlobalFilter,
  onExpandedChange: setExpanded,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  globalFilterFn: 'includesString',
});

  const pageIndex  = table.getState().pagination.pageIndex;
  const pageSize   = table.getState().pagination.pageSize;
  const totalItems = table.getFilteredRowModel().rows.length;
  const start      = pageIndex * pageSize + 1;
  const end        = Math.min(start + pageSize - 1, totalItems);

  // ===== CRUD =====
  const handleSave = async (formData) => {
    try {
      setSaving(true);
      if (selected) {
        await parametroService.actualizar(selected.parametroId, formData);
        toast.success(`Parámetro ${formData.ParametroCodigo} actualizado`);
      } else {
        await parametroService.crear(formData);
        toast.success(`Parámetro ${formData.ParametroCodigo} creado`);
      }
      setShowModal(false);
      setSelected(null);
      await cargar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    try {
      await parametroService.cambiarEstado(selected.parametroId);
      toast.success(`Estado de ${selected.parametroCodigo} cambiado`);
      setShowToggleModal(false);
      setSelected(null);
      await cargar();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await parametroService.eliminar(selected.parametroId);
      toast.success(`Parámetro ${selected.parametroCodigo} eliminado`);
      setShowDeleteModal(false);
      setSelected(null);
      await cargar();
    } catch (err) {
      toast.error(err.message);
    }
  };


  // ===== Render =====
  if (loading) {
    return (
      <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Parámetros Llave"
        subTitle1="Configuración"
        subTitle2="Parámetros"
        subText="Gestión de parámetros del sistema por periodo, empresa y tienda."
      />

      <div className="main-content">
        {/* KPIs */} 
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Total Parámetros
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#185FA5', fontSize: 32 }}>{kpis.total}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 600 }}>
                    {kpis.empresas} empresas
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
                  Empresas
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#a855f7', fontSize: 32 }}>{kpis.empresas}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', fontSize: 10, fontWeight: 600 }}>
                    distintas
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>con parámetros</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        {/* Toolbar */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2 px-3">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={3}>
                <div style={{ position: 'relative' }}>
                  <i className="ri-search-line" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:14 }} />
                  <input type="text" value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="Buscar código o nombre..."
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
                <SearchableSelect
                  value={filtros.periodo}
                  onChange={v => setFiltros({ ...filtros, periodo: v })}
                  options={periodos.map(p => ({ value: p, label: p }))}
                  placeholder="Periodo..."
                />
              </Col>
              <Col xs="auto" className="ms-auto d-flex gap-2">
                <button onClick={() => setShowFilters(!showFilters)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                    border: showFilters ? '1.5px solid #185FA5' : '1.5px solid #d1d5db',
                    background: showFilters ? '#185FA5' : 'white',
                    color: showFilters ? 'white' : '#374151',
                  }}>
                  <i className="ri-filter-3-line" />
                  Filtros
                  {filtrosActivos > 0 && (
                    <span style={{ background: showFilters ? 'rgba(255,255,255,0.25)' : '#dbeafe', color: showFilters ? 'white' : '#1e40af', borderRadius:10, padding:'1px 7px', fontSize:11 }}>
                      {filtrosActivos}
                    </span>
                  )}
                </button>
                <button onClick={cargar}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:7, border:'1.5px solid #bfdbfe', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#185FA5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; e.currentTarget.style.borderColor='#bfdbfe'; }}>
                  <i className="ri-refresh-line" /> Aplicar
                </button>
                <button onClick={() => { setSelected(null); setShowModal(true); }}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
                  <FaPlus size={12} /> Nuevo
                </button>
              </Col>
            </Row>

            {/* Filtros colapsables */}
            {showFilters && (
              <div className="mt-3 pt-3 border-top">
                <Row className="g-2">
                  <Col xs={12} sm={6} md={3}>
                    <label className="form-label small text-muted mb-1">Empresa</label>
                    <SearchableSelect
                      value={filtros.empresa}
                      onChange={v => setFiltros({ ...filtros, empresa: v, tienda: '' })}
                      options={empresas.map(e => ({ value: e.empresaId, label: e.empresaId }))}
                      placeholder="Seleccionar..."
                    />
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <label className="form-label small text-muted mb-1">Tienda</label>
                    <SearchableSelect
                      value={filtros.tienda}
                      onChange={v => setFiltros({ ...filtros, tienda: v })}
                      options={tiendas
                        .filter(t => !filtros.empresa || t.empresa === filtros.empresa)
                        .map(t => ({ value: t.tiendaId, label: `${t.tiendaId} - ${t.descripcion}` }))}
                      placeholder="Seleccionar..."
                    />
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <label className="form-label small text-muted mb-1">Código</label>
                    <SearchableSelect
                      value={filtros.codigo}
                      onChange={v => setFiltros({ ...filtros, codigo: v })}
                      options={codigoOpciones}
                      placeholder="Seleccionar..."
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <label className="form-label small text-muted mb-1">Estado</label>
                    <SearchableSelect value={filtros.estado} onChange={v => setFiltros({ ...filtros, estado: v })} options={[{value:'A',label:'Activos'},{value:'I',label:'Inactivos'}]} placeholder="Estado" />
                  </Col>
                  <Col xs={6} md={2}>
                    <label className="form-label small text-muted mb-1">Valor</label>
                    <SearchableSelect value={filtros.valor} onChange={v => setFiltros({ ...filtros, valor: v })} options={valoresUnicos} placeholder="Valor" />
                  </Col>
                  <Col xs={12}>
                    <div className="d-flex justify-content-end mt-2">
                      <button type="button"
                        onClick={() => setFiltros({ ...filtros, empresa: '', tienda: '', estado: '', valor: '', codigo: '' })}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:12, fontWeight:600, padding:'4px 8px' }}>
                        Limpiar filtros
                      </button>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <DataTable
            table={table}
            emptyMessage="No se encontraron parámetros"
            renderSubComponent={({ row }) => (
              <Row className="g-2">
                <Col md={4}><strong>Periodo:</strong> {row.original.periodo}</Col>
                <Col md={12}><strong>Mensaje:</strong> {row.original.mensaje || '—'}</Col>
                <Col md={4}><strong>Nivel:</strong> {row.original.parametroNivel ?? '—'}</Col>
                <Col md={4}><strong>Orden:</strong> {row.original.orden}</Col>
                <Col md={12}><strong>Descripción 1:</strong> {row.original.descripcion1 || '—'}</Col>
                <Col md={12}><strong>Descripción 2:</strong> {row.original.descripcion2 || '—'}</Col>
                <Col md={12}><strong>Comentario:</strong> {row.original.comentario || '—'}</Col>
                <Col md={6}><strong>Fecha creación:</strong> {row.original.fecha_creacion ? new Date(row.original.fecha_creacion).toLocaleString() : '—'}</Col>
                <Col md={6}><strong>Fecha modificación:</strong> {row.original.fecha_Modificacion ? new Date(row.original.fecha_Modificacion).toLocaleString() : '—'}</Col>
              </Row>
            )}
          />
            <div className="p-3 border-top">
              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="parámetros" showInfo
                previousPage={table.previousPage} canPreviousPage={table.getCanPreviousPage()}
                pageCount={table.getPageCount()} pageIndex={pageIndex}
                setPageIndex={table.setPageIndex} nextPage={table.nextPage}
                canNextPage={table.getCanNextPage()} pageSize={pageSize}
                onPageSizeChange={table.setPageSize} showPageLimit
              />
            </div>
          </div>
        </div>
      </div>

      <ParametroModal
        show={showModal}
        onHide={() => { setShowModal(false); setSelected(null); }}
        onSave={handleSave}
        parametro={selected}
        saving={saving}
        empresas={empresas}
        tiendas={tiendas}
      />

      <ConfirmModal
        show={showToggleModal}
        title="Cambiar estado"
        message={`¿Cambiar estado del parámetro ${selected?.parametroCodigo}?`}
        confirmText="Sí, cambiar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={handleToggle}
        onCancel={() => { setShowToggleModal(false); setSelected(null); }}
      />

      <ConfirmModal
        show={showDeleteModal}
        title="Eliminar parámetro"
        message={`¿Eliminar el parámetro ${selected?.parametroCodigo}? Esta acción lo desactivará.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteModal(false); setSelected(null); }}
      />
    </div>
  );
};

export default Parametros;