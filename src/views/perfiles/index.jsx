import { useState, useEffect } from 'react';
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
import { FaPlus, FaPen, FaToggleOn, FaToggleOff, FaXmark } from 'react-icons/fa6';
import KpiCard from '@/components/KpiCard';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import ConfirmModal from '@/components/modals/ConfirmModal';
import { perfilesService } from '@/services/seguridad.service';
import PerfilModal from './PerfilModal';

const columnHelper = createColumnHelper();

const EstadoBadge = ({ estado }) => (
  <Badge bg={estado === 'A' ? 'success' : 'secondary'}>
    {estado === 'A' ? 'Activo' : 'Inactivo'}
  </Badge>
);

const GestionPerfiles = () => {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 });

  const [showModal, setShowModal]         = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected]           = useState(null);
  const [saving, setSaving]               = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const lista = await perfilesService.listar({ estado: filterEstado });
      setData(lista);
    } catch (err) {
      toast.error('Error al cargar perfiles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [filterEstado]);

  const handleSavePerfil = async (payload) => {
    try {
      setSaving(true);
      if (selected) {
        await perfilesService.editar(selected.perfilId, payload);
        toast.success('Perfil actualizado correctamente');
      } else {
        await perfilesService.crear(payload);
        toast.success('Perfil creado correctamente');
      }
      setShowModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleToggleEstado = async () => {
    try {
      const nuevoEstado = selected.estadoPerfil === 'A' ? 'I' : 'A';
      await perfilesService.editar(selected.perfilId, {
        estadoPerfil: nuevoEstado,
        usuarioModificacion: 'ADMIN',
      });
      toast.success(`Perfil ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente`);
      setShowDeleteModal(false);
      setSelected(null);
      await cargar();
    } catch (err) { toast.error(err.message); }
  };

  const columns = [
    columnHelper.accessor('perfilId', {
      header: 'ID',
      cell: ({ getValue }) => <span className="text-muted" style={{ fontSize: 12 }}>{getValue()}</span>,
    }),
    columnHelper.accessor('descripcion', {
      header: 'Descripción',
      cell: ({ getValue }) => <span className="fw-semibold" style={{ fontSize: 13 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('perfilRMS', {
      header: 'Perfil RMS',
      cell: ({ getValue }) => <span className="text-muted" style={{ fontSize: 12 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('flagChecklist', {
      header: 'Checklist',
      cell: ({ getValue }) => (
        <Badge bg={getValue() ? 'success' : 'secondary'}>
          {getValue() ? 'Sí' : 'No'}
        </Badge>
      ),
    }),
    columnHelper.accessor('flagTienda', {
      header: 'Tienda',
      cell: ({ getValue }) => (
        <Badge bg={getValue() ? 'success' : 'secondary'}>
          {getValue() ? 'Sí' : 'No'}
        </Badge>
      ),
    }),
    columnHelper.accessor('fechaCreacion', {
      header: 'Fecha creación',
      cell: ({ getValue }) => getValue()
        ? new Date(getValue()).toLocaleDateString('es-PE')
        : '—',
    }),
    columnHelper.accessor('estadoPerfil', {
      header: 'Estado',
      cell: ({ getValue }) => <EstadoBadge estado={getValue()} />,
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <button title="Editar" onClick={() => { setSelected(row.original); setShowModal(true); }}
            style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:7, border:'1.5px solid #bfdbfe', background:'#eff6ff', color:'#185FA5', cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#185FA5'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; e.currentTarget.style.borderColor='#bfdbfe'; }}>
            <FaPen size={13} />
          </button>
          {row.original.estadoPerfil === 'A'
            ? <button title="Desactivar" onClick={() => { setSelected(row.original); setShowDeleteModal(true); }}
                style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:7, border:'1.5px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#dc2626'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#dc2626'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='#dc2626'; e.currentTarget.style.borderColor='#fecaca'; }}>
                <FaToggleOff size={13} />
              </button>
            : <button title="Activar" onClick={() => { setSelected(row.original); setShowDeleteModal(true); }}
                style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:7, border:'1.5px solid #bbf7d0', background:'#f0fdf4', color:'#16a34a', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#16a34a'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#16a34a'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#f0fdf4'; e.currentTarget.style.color='#16a34a'; e.currentTarget.style.borderColor='#bbf7d0'; }}>
                <FaToggleOn size={13} />
              </button>
          }
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

  const kpis = {
    total:    data.length,
    activos:  data.filter(d => d.estadoPerfil === 'A').length,
    inactivos: data.filter(d => d.estadoPerfil === 'I').length,
  };

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión de Perfiles"
        subTitle1="Seguridad"
        subTitle2="Perfiles"
        subText="Registro y control de perfiles del sistema."
      />

      <div className="main-content">

        {/* KPIs */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={4}>
            <KpiCard label="Total perfiles" value={kpis.total}
              color="#185FA5" badgeBg="#dbeafe" badgeColor="#1e40af"
              badge={kpis.total} subtitle="registrados" />
          </Col>
          <Col xs={6} md={4}>
            <KpiCard label="Activos" value={kpis.activos}
              color="#16a34a" badgeBg="#dcfce7" badgeColor="#166534"
              badge={`${kpis.total > 0 ? Math.round((kpis.activos / kpis.total) * 100) : 0}%`}
              subtitle="del total" />
          </Col>
          <Col xs={6} md={4}>
            <KpiCard label="Inactivos" value={kpis.inactivos}
              color="#6b7280" badgeBg="#f3f4f6" badgeColor="#374151"
              badge={kpis.inactivos} subtitle="sin acceso" />
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
                        <i className="ri-search-line" style={{
                          position: 'absolute', left: 10, top: '50%',
                          transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14,
                        }} />
                        <input type="text" value={globalFilter ?? ''}
                          onChange={e => setGlobalFilter(e.target.value)}
                          placeholder="Buscar perfil..."
                          autoComplete="off"
                          style={{ width: '100%', padding: '7px 36px 7px 32px', border: '1.5px solid #dde1e7', borderRadius: 8, fontSize: 13, outline: 'none', background: 'white' }}
                          onFocus={e => e.target.style.borderColor = '#185FA5'}
                          onBlur={e  => e.target.style.borderColor = '#dde1e7'}
                        />
                        {globalFilter && (
                          <button onClick={() => setGlobalFilter('')}
                            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, display: 'flex' }}>
                            <FaXmark size={12} />
                          </button>
                        )}
                      </div>
                    </Col>
                    <Col xs={6} md={2}>
                      <SearchableSelect value={filterEstado} onChange={setFilterEstado}
                        options={[{value:'A',label:'Activo'},{value:'I',label:'Inactivo'}]} placeholder="Estado" />
                    </Col>
                    <Col xs="auto" className="ms-auto">
                      <button onClick={() => { setSelected(null); setShowModal(true); }}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:7, border:'1.5px solid #185FA5', background:'#eff6ff', color:'#185FA5', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#185FA5'; e.currentTarget.style.color='white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#185FA5'; }}>
                        <FaPlus size={12} /> Nuevo perfil
                      </button>
                    </Col>
                  </Row>
                </div>
              </div>

              <DataTable table={table} emptyMessage="No se encontraron perfiles" />

              <TablePagination
                totalItems={totalItems} start={start} end={end} itemsName="perfiles" showInfo
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

      <PerfilModal
        show={showModal}
        onHide={() => { setShowModal(false); setSelected(null); }}
        onSave={handleSavePerfil}
        perfil={selected}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        title={selected?.estadoPerfil === 'A' ? 'Desactivar perfil' : 'Activar perfil'}
        message={`¿Estás seguro de ${selected?.estadoPerfil === 'A' ? 'desactivar' : 'activar'} el perfil "${selected?.descripcion}"?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant={selected?.estadoPerfil === 'A' ? 'danger' : 'success'}
        onConfirm={handleToggleEstado}
        onCancel={() => { setShowDeleteModal(false); setSelected(null); }}
      />
    </div>
  );
};

export default GestionPerfiles;