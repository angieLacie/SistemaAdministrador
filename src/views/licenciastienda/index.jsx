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
import { licenciasTiendaService } from '@/services/licenciasTienda.service';
import LicenciaTiendaModal from './LicenciaTiendaModal';

const columnHelper = createColumnHelper();

const TipoLicenciaBadge = ({ tipo }) => {
  const map = {
    'A': { bg: '#E6F1FB', color: '#185FA5', label: 'A — Punto venta' },
    'B': { bg: '#EAF3DE', color: '#3B6D11', label: 'B — Est. trabajo' },
    'C': { bg: '#FAEEDA', color: '#BA7517', label: 'C — Tipo C BD' },
  };
  const e = map[tipo] || { bg: '#F1EFE8', color: '#5F5E5A', label: tipo };
  return <Badge style={{ background: e.bg, color: e.color, fontSize: 10 }}>{e.label}</Badge>;
};

const GestionLicenciasTienda = () => {
  const navigate = useNavigate();
  const [data, setData]         = useState([]);
  const [resumen, setResumen]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState('');
  const [filterEstado, setFilterEstado]   = useState('');
  const [pagination, setPagination]       = useState({ pageIndex: 0, pageSize: 10 });

  const [showModal, setShowModal]           = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected]             = useState(null);
  const [saving, setSaving]                 = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [lista, res] = await Promise.all([
        licenciasTiendaService.listar({
          empresa: filterEmpresa,
          periodo: filterPeriodo,
          estado:  filterEstado,
        }),
        licenciasTiendaService.resumen(),
      ]);
      setData(lista);
      setResumen(res);
    } catch (err) {
      toast.error('Error al cargar licencias: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [filterEmpresa, filterPeriodo, filterEstado]);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      if (selected) {
        await licenciasTiendaService.editar(selected.id, payload);
        toast.success('Licencia actualizada correctamente');
      } else {
        await licenciasTiendaService.crear(payload);
        toast.success('Licencia creada correctamente');
      }
      setShowModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await licenciasTiendaService.eliminar(selected.id);
      toast.success(`Licencia ${selected.codigo} anulada`);
      setShowDeleteModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  // Filtros únicos
  const empresas = [...new Set(data.map(d => d.empresa).filter(Boolean))].sort();
  const periodos  = [...new Set(data.map(d => d.periodo).filter(Boolean))].sort().reverse();

  const columns = [
    columnHelper.accessor('codigo', {
      header: 'Código',
      cell: ({ getValue }) => (
        <span className="fw-bold" style={{ color: '#185FA5', fontSize: 13 }}>{getValue()}</span>
      ),
    }),
    columnHelper.accessor('tienda', {
      header: 'Tienda',
      cell: ({ getValue }) => <span style={{ fontSize: 12 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('empresa', {
      header: 'Empresa',
      cell: ({ getValue }) => <span className="text-muted" style={{ fontSize: 12 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('periodo', {
      header: 'Periodo',
      cell: ({ getValue }) => <span className="text-muted" style={{ fontSize: 12 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('totalCajas', {
      header: 'Cajas',
      cell: ({ getValue }) => (
        <Badge bg="light" text="dark" style={{ border: '1px solid #d1d5db', fontSize: 10 }}>
          {getValue() ?? 0}
        </Badge>
      ),
    }),
    columnHelper.accessor('cajas', {
      header: 'Tipos licencia',
      cell: ({ getValue }) => {
        const cajas = getValue() ?? [];
        const tipos = [...new Set(cajas.map(c => c.tipoLicencia).filter(Boolean))];
        return (
          <div className="d-flex gap-1 flex-wrap">
            {tipos.map(t => <TipoLicenciaBadge key={t} tipo={t} />)}
            {tipos.length === 0 && <span className="text-muted">—</span>}
          </div>
        );
      },
    }),
    columnHelper.accessor('estadoTienda', {
      header: 'Estado',
      cell: ({ getValue }) => (
        <Badge bg={getValue() === 'Anulado' ? 'danger' : 'success'} style={{ fontSize: 10 }}>
          {getValue() ?? 'Activo'}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          {[
            { icon: <FaEye size={13}/>, title: 'Ver detalle', color: '#0891b2', bg: '#ecfeff', bd: '#a5f3fc', onClick: () => navigate(`/licencias-tienda/${row.original.id}`) },
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
        title="Licencias de Tiendas"
        subTitle1="Licencias"
        subTitle2="Tiendas"
        subText="Registro y control de licencias por tienda."
      />

      <div className="main-content">
        {/* KPIs */} 
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Total tiendas
                </p>
                <h2 className="mb-1 fw-bold" style={{ color: '#185FA5', fontSize: 32 }}>{resumen.total}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 600 }}>
                    {resumen.total} tiendas
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
                  Total Cajas
                </p>
                <h2 className="mb-1 fw-bold text-success" style={{ fontSize: 32 }}>{resumen.totalCajas}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#f3f4f6', color: '#073f02c2', fontSize: 10, fontWeight: 600 }}>
                    {resumen.totalCajas} cajas
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>habilitadas</span>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                  Cajas tipo A
                </p>
                <h2 className="mb-1 fw-bold text-success" style={{ fontSize: 32 }}> {resumen?.cajasPorTipo?.find(c => c.tipo === 'A')?.total ?? 0} </h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 600 }}>
                     cajas A
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
                <h2 className="mb-1 fw-bold text-secondary" style={{ fontSize: 32 }}>{(resumen?.cajasPorTipo?.find(c => c.tipo === 'B')?.total ?? 0) +
                   (resumen?.cajasPorTipo?.find(c => c.tipo === 'C')?.total ?? 0)}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#f3f4f6', color: '#374151', fontSize: 10, fontWeight: 600 }}>
                     cajas B/C
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>del total</span>
                </div>
              </div>
            </div>
          </Col> 
        </Row>
        {/* KPIs */}
      
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
                          placeholder="Buscar código, tienda..."
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
                      <SearchableSelect value={filterEmpresa} onChange={setFilterEmpresa} options={empresas} placeholder="Empresa" />
                    </Col>
                    <Col xs={6} md={2}>
                      <SearchableSelect value={filterPeriodo} onChange={setFilterPeriodo} options={periodos} placeholder="Periodo" />
                    </Col>
                    <Col xs="auto" className="ms-auto">
                      <button onClick={() => { setSelected(null); setShowModal(true); }}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
                        <FaPlus size={12} /> Nueva licencia
                      </button>
                    </Col>
                  </Row>
                </div>
              </div>

              <DataTable table={table} emptyMessage="No se encontraron licencias" />

              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="licencias" showInfo
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

      <LicenciaTiendaModal
        show={showModal}
        onHide={() => { setShowModal(false); setSelected(null); }}
        onSave={handleSave}
        licencia={selected}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        title="Anular licencia"
        message={`¿Estás seguro de anular la licencia "${selected?.codigo} — ${selected?.tienda}"?`}
        confirmText="Sí, anular"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteModal(false); setSelected(null); }}
      />
    </div>
  );
};

export default GestionLicenciasTienda;