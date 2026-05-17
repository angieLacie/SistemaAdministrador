import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Row, Col, Spinner } from 'react-bootstrap';
import { FaEye, FaPlus, FaPen, FaTrash, FaXmark } from 'react-icons/fa6';
import { toast } from 'react-toastify';

import MembresiaModal from './MembresiaModal';
import DataTable from '@/components/table/DataTable';
import KpiCard from '@/components/KpiCard';
import TablePagination from '@/components/table/TablePagination';
import ConfirmModal from '@/components/modals/ConfirmModal';

import SearchableSelect from '@/components/SearchableSelect';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { membresiasService } from '@/services/membresia.service';

const columnHelper = createColumnHelper();

const GestionMembresias = () => {
  const navigate = useNavigate();

  const [data, setData]                   = useState([]);
  const [resumen, setResumen]             = useState({ total: 0, conOC: 0, conFact: 0 });
  const [loading, setLoading]             = useState(true);
  const [globalFilter, setGlobalFilter]   = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState('');
  const [pagination, setPagination]       = useState({ pageIndex: 0, pageSize: 10 });

  const [showModal, setShowModal]             = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMem, setSelectedMem]         = useState(null);
  const [formData, setFormData]               = useState({});
  const [saving, setSaving]                   = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [lista, res] = await Promise.all([
        membresiasService.listar({ periodo: filterPeriodo }),
        membresiasService.resumen(),
      ]);
      setData(lista);
      setResumen(res);
    } catch (err) {
      toast.error('Error al cargar membresías: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [filterPeriodo]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openModal = (mem = null) => {
    setSelectedMem(mem);
    setFormData(mem ? {
      codigoProyecto:      mem.codigoProyecto      ?? '',
      nombreRequerimiento: mem.nombreRequerimiento ?? '',
      periodo:             mem.periodo             ?? '',
    } : { codigoProyecto: '', nombreRequerimiento: '', periodo: '' });
    setShowModal(true);
  };

  const handleSaveMembresia = async (payload) => {
    try {
      setSaving(true);
      if (selectedMem) {
        await membresiasService.editar(selectedMem.idMembresia, payload);
        toast.success('Membresía actualizada correctamente');
      } else {
        await membresiasService.crear(payload);
        toast.success('Membresía registrada correctamente');
      }
      setShowModal(false);
      setSelectedMem(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const eliminar = async () => {
    try {
      await membresiasService.eliminar(selectedMem.idMembresia);
      toast.success('Membresía eliminada');
      setShowDeleteModal(false);
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  const periodos = useMemo(() => {
    const set = new Set(data.map(d => d.periodo).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [data]);

  const columns = [
    columnHelper.accessor('codigoProyecto', {
      header: 'Código Proyecto',
      cell: ({ row }) => (
        <span className="fw-semibold" style={{ color: '#185FA5', cursor: 'pointer' }}
          onClick={() => navigate(`/membresias/${row.original.idMembresia}`)}>
          {row.original.codigoProyecto}
        </span>
      ),
    }),
    columnHelper.accessor('nombreRequerimiento', {
      header: 'Nombre Requerimiento',
      cell: ({ getValue }) => <span className="text-muted">{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('periodo', {
      header: 'Período',
      cell: ({ getValue }) => <span className="text-muted" style={{ fontSize: 12 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('fechaCreacion', {
      header: 'Fecha creación',
      cell: ({ getValue }) => getValue()
        ? new Date(getValue()).toLocaleDateString('es-PE') : '—',
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          {[
            { icon: <FaEye size={13}/>, title: 'Ver detalle', color: '#0891b2', bg: '#ecfeff', bd: '#a5f3fc', onClick: () => navigate(`/membresias/${row.original.idMembresia}`) },
            { icon: <FaPen size={13}/>, title: 'Editar', color: '#185FA5', bg: '#eff6ff', bd: '#bfdbfe', onClick: () => { setSelectedMem(row.original); setShowModal(true); } },
            { icon: <FaTrash size={13}/>, title: 'Eliminar', color: '#dc2626', bg: '#fef2f2', bd: '#fecaca', onClick: () => { setSelectedMem(row.original); setShowDeleteModal(true); } },
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
    state: { globalFilter , pagination },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const pageIndex  = table.getState().pagination.pageIndex;
  const pageSize   = table.getState().pagination.pageSize;
  const totalItems = table.getFilteredRowModel().rows.length;
  const start      = pageIndex * pageSize + 1;
  const end        = Math.min(start + pageSize - 1, totalItems);


  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión de Membresías"
        subTitle1="Administración"
        subTitle2="Membresías"
        subText="Registro y control de membresías por proyecto."
      />

      <div className="main-content">

        {/* KPIs */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={4}>
            <KpiCard label="Total membresías" value={resumen.total}
              color="#185FA5" badge={`${resumen.total}`} badgeBg="#dbeafe" badgeColor="#1e40af" subtitle="registradas" />
          </Col>
          <Col xs={6} md={4}>
            <KpiCard label="Con OC registrada" value={resumen.conOC}
              color="#16a34a" badgeBg="#dcfce7" badgeColor="#166534"
              badge={`${resumen.total > 0 ? Math.round((resumen.conOC / resumen.total) * 100) : 0}%`}
              subtitle="del total" />
          </Col>
          <Col xs={6} md={4}>
            <KpiCard label="Facturadas" value={resumen.conFact}
              color="#d97706" badgeBg="#fef3c7" badgeColor="#92400e"
              badge={`${resumen.total > 0 ? Math.round((resumen.conFact / resumen.total) * 100) : 0}%`}
              subtitle="del total" />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <div className="st-wrapper">

              {/* Toolbar */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body py-2 px-3">
                  <Row className="g-2 align-items-center">
                    <Col xs={12} md={4}>
                      <div style={{ position: 'relative' }}>
                        <i className="ri-search-line" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:14 }} />
                        <input type="text" value={globalFilter ?? ''}
                          onChange={e => setGlobalFilter(e.target.value)}
                          placeholder="Buscar proyecto, requerimiento..."
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
                      <SearchableSelect value={filterPeriodo} onChange={setFilterPeriodo} options={periodos} placeholder="Periodo" />
                    </Col>
                    <Col xs="auto" className="ms-auto">
                      <button onClick={() => { setSelectedMem(null); setShowModal(true); }}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
                        <FaPlus size={12} /> Nueva membresía
                      </button>
                    </Col>
                  </Row>
                </div>
              </div>

              <DataTable table={table} emptyMessage="No se encontraron membresías" />

                <TablePagination
                  totalItems={totalItems} start={start} end={end} itemsName="membresías" showInfo
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

      {/* MODAL CREAR / EDITAR */}
    <MembresiaModal
      show={showModal}
      onHide={() => { setShowModal(false); setSelectedMem(null); }}
      onSave={handleSaveMembresia}
      membresia={selectedMem}
      saving={saving}
    />

      <ConfirmModal
        show={showDeleteModal}
        title="Eliminar membresía"
        message={`¿Estás seguro de eliminar la membresía "${selectedMem?.codigoProyecto}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={eliminar}
        onCancel={() => { setShowDeleteModal(false); setSelectedMem(null); }}
      />

    </div>
  );
};

export default GestionMembresias;
