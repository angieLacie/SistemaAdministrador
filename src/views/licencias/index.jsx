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

import { useNavigate } from 'react-router';
import { FaEye, FaPlus, FaUserPen, FaPen, FaTrash } from 'react-icons/fa6';
import KpiCard from '@/components/KpiCard';

import SearchableSelect from '@/components/SearchableSelect';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import ConfirmModal from '@/components/modals/ConfirmModal';

import { oficinasService, empresasService, ordenesCompraService } from '@/services/licencia.service';
import { createLicencia, createCambioUsuario } from '@/models/licencia.model';
import LicenciaModal from './LicenciaModal';
import CambioUsuarioModal from './CambioUsuarioModal';

const columnHelper = createColumnHelper();

const EstadoBadge = ({ estado }) => (
  <Badge
    bg={estado === 'Ocupado' ? 'success' : 'warning'}
    text={estado === 'Libre' ? 'dark' : undefined}
    className="px-2"
  >
    {estado}
  </Badge>
);

const EmpresaBadge = ({ empresa }) => {
  if (!empresa || empresa === '—') return <span className="text-muted">—</span>;
  
  const codigo = empresa.split(' - ')[0];
  const colores = {
    R010: { bg: '#dbeafe', color: '#1e40af' },
    S090: { bg: '#ede9fe', color: '#5b21b6' },
    R050: { bg: '#dcfce7', color: '#166534' },
    R020: { bg: '#fef3c7', color: '#92400e' },
    S010: { bg: '#fee2e2', color: '#991b1b' },
    S020: { bg: '#f3e8ff', color: '#6b21a8' },
  };

  const estilo = colores[codigo] || { bg: '#f3f4f6', color: '#374151' };

  return (
    <Badge style={{
      background: estilo.bg,
      color: estilo.color,
      fontFamily: 'monospace',
      fontSize: '11px',
    }}>
      {codigo}
    </Badge>
  );
};

const GestionLicencias = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const [data, setData]         = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [ocs, setOcs]           = useState([]);
  const [kpis, setKpis]         = useState({ totalOficinas: 0, ocupadas: 0, libres: 0, ocsActivas: 0 });
  const [loading, setLoading]   = useState(true);

  const [globalFilter, setGlobalFilter]   = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterEstado, setFilterEstado]   = useState('');
  const [filterOC, setFilterOC]           = useState('');
  const [pagination, setPagination]       = useState({ pageIndex: 0, pageSize: 10 });

  const [showLicModal, setShowLicModal]       = useState(false);
  const [showCambioModal, setShowCambioModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLic, setSelectedLic]         = useState(null);
  const [saving, setSaving]                   = useState(false);

  // =====================
  // Carga inicial
  // =====================
  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [licencias, resumen, listaEmpresas, listaOcs] = await Promise.all([
        oficinasService.listar(),
        oficinasService.resumen(),
        empresasService.listar(),
        ordenesCompraService.listar(),
      ]);
      setData(licencias);
      setKpis(resumen);
      setEmpresas(listaEmpresas);
      setOcs(listaOcs);
    } catch (err) {
      toast.error('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarTodo(); }, []);

  // =====================
  // Filtros locales
  // =====================
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchEmpresa = !filterEmpresa || row.empresaUsuario?.includes(filterEmpresa);
      const matchEstado  = !filterEstado  || row.estado === filterEstado;
      const matchOC      = !filterOC      || row.numeroOc === filterOC;
      return matchEmpresa && matchEstado && matchOC;
    });
  }, [data, filterEmpresa, filterEstado, filterOC]);

  // =====================
  // Columnas
  // =====================
  const columns = [
    columnHelper.accessor('codigoOfi', {
      header: 'Oficina',
      cell: ({ row }) => (
        <span className="fw-semibold text-primary">{row.original.codigoOfi}</span>
      ),
    }),
    columnHelper.accessor('usuarioActual', {
      header: 'Usuario actual',
      cell: ({ row }) =>
        row.original.usuarioActual === '—' ? (
          <span className="text-muted">Sin asignar</span>
        ) : (
          row.original.usuarioActual
        ),
    }),
    columnHelper.accessor('usuarioAnterior', {
      header: 'Usuario anterior',
      cell: ({ row }) => (
        <span className="text-muted">{row.original.usuarioAnterior}</span>
      ),
    }),
    columnHelper.accessor('estado', {
      header: 'Estado',
      cell: ({ row }) => <EstadoBadge estado={row.original.estado} />,
    }),
    columnHelper.accessor('empresaUsuario', {
      header: 'Empresa',
      cell: ({ row }) => <EmpresaBadge empresa={row.original.empresaUsuario} />,
    }),
    columnHelper.accessor('numeroOc', {
      header: 'Orden de Compra',
      cell: ({ row }) =>
        row.original.numeroOc === '—' ? (
          <span className="text-muted">—</span>
        ) : (
          <span
            className="badge"
            style={{
              background: '#fffbeb',
              color: '#d97706',
              fontFamily: 'monospace',
              border: '1px solid #fde68a',
            }}
          >
            {row.original.numeroOc}
          </span>
        ),
    }),
    columnHelper.accessor('puesto', {
      header: 'Puesto',
      cell: ({ row }) => (
        <span className="text-truncate d-inline-block" style={{ maxWidth: 160 }}>
          {row.original.puesto}
        </span>
      ),
    }),
    columnHelper.accessor('periodo', {
      header: 'Período',
      cell: ({ row }) => (
        <span className="text-muted">{row.original.periodo}</span>
      ),
    }),
    columnHelper.display({
  id: 'acciones',
  header: 'Acciones',
  cell: ({ row }) => (
    <div className="d-flex gap-1">
      <Button
        size="sm"
        variant="outline-info"
        title="Ver detalle"
        onClick={() => navigate(`/licencias/${row.original.idOficina}`)}
      >
        <FaEye size={12} />
      </Button>
      <Button
        size="sm"
        variant="outline-primary"
        title="Cambiar usuario"
        onClick={() => { setSelectedLic(row.original); setShowCambioModal(true); }}
      >
        <FaUserPen size={12} />
      </Button>
      <Button
        size="sm"
        variant="outline-secondary"
        title="Editar"
        onClick={() => { setSelectedLic(row.original); setShowLicModal(true); }}
      >
        <FaPen size={12} />
      </Button>
      <Button
        size="sm"
        variant="outline-danger"
        title="Eliminar"
        onClick={() => { setSelectedLic(row.original); setShowDeleteModal(true); }}
      >
        <FaTrash size={12} />
      </Button>
    </div>
  ),
}),
  ];

  const table = useReactTable({
    data: filteredData,
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
  const start      = pageIndex * pageSize + 1;
  const end        = Math.min(start + pageSize - 1, totalItems);

  // =====================
  // CRUD
  // =====================
  const handleSaveLicencia = async (formData) => {
    try {
      setSaving(true);
      if (selectedLic) {
        await oficinasService.editar(selectedLic.idOficina, formData);
        toast.success(`Licencia ${formData.codigoOfi} actualizada correctamente`);
      } else {
        await oficinasService.crear(formData);
        toast.success(`Licencia ${formData.codigoOfi} registrada correctamente`);
      }
      setShowLicModal(false);
      setSelectedLic(null);
      await cargarTodo();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCambioUsuario = async (cambioData) => {
    try {
      setSaving(true);
      await oficinasService.cambiarUsuario(selectedLic.idOficina, cambioData);
      toast.success(`Usuario cambiado en ${selectedLic.codigoOfi} correctamente`);
      setShowCambioModal(false);
      setSelectedLic(null);
      await cargarTodo();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await oficinasService.eliminar(selectedLic.idOficina);
      toast.success(`Licencia ${selectedLic.codigoOfi} eliminada`);
      setShowDeleteModal(false);
      setSelectedLic(null);
      await cargarTodo();
    } catch (err) {
      toast.error(err.message);
    }
  };


  // =====================
  // RENDER
  // =====================
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
        title="Gestión de Licencias"
        subTitle1="Administración"
        subTitle2="Licencias"
        subText="Registro, asignación y control de licencias por oficina y orden de compra."
      />

      <div className="main-content">
        {/* KPI Cards */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <KpiCard label="Total oficinas" value={kpis.totalOficinas}
              color="#185FA5" badge={`${kpis.totalOficinas}`} badgeBg="#dbeafe" badgeColor="#1e40af" subtitle="registradas" />
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="Ocupadas" value={kpis.ocupadas}
              color="#16a34a" badgeBg="#dcfce7" badgeColor="#166534"
              badge={`${kpis.totalOficinas > 0 ? Math.round((kpis.ocupadas / kpis.totalOficinas) * 100) : 0}%`}
              subtitle="ocupación" />
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="Libres" value={kpis.libres}
              color="#d97706" badge={`${kpis.libres}`} badgeBg="#fef3c7" badgeColor="#92400e" subtitle="disponibles" />
          </Col>
          <Col xs={6} md={3}>
            <KpiCard label="OCs activas" value={kpis.ocsActivas}
              color="#a855f7" badge={`${kpis.ocsActivas}`} badgeBg="#f3e8ff" badgeColor="#7e22ce" subtitle="órdenes de compra" />
          </Col>
        </Row>

        {/* Table */}
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
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar usuario, oficina..."
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setGlobalFilter(e.target.value);
                      }}
                      autoComplete="off"
                    />
                    {searchText && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => {
                          setSearchText('');
                          setGlobalFilter('');
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </Col>
                <Col xs={6} sm={4} lg={2}>
                  <SearchableSelect
                    value={filterEmpresa}
                    onChange={setFilterEmpresa}
                    options={empresas.map(e => ({ value: e.codigo, label: `${e.codigo} - ${e.nombre}` }))}
                    placeholder="Empresa"
                  />
                </Col>
                <Col xs={6} sm={4} lg={2}>
                  <SearchableSelect
                    value={filterEstado}
                    onChange={setFilterEstado}
                    options={['Ocupado', 'Libre']}
                    placeholder="Estado"
                  />
                </Col>
                <Col xs={6} sm={4} lg={2}>
                  <SearchableSelect
                    value={filterOC}
                    onChange={setFilterOC}
                    options={ocs.map(o => o.numeroOc)}
                    placeholder="Orden de compra"
                  />
                </Col>
                <Col className="d-flex justify-content-end gap-2">
                  <Button variant="primary" size="sm" onClick={() => { setSelectedLic(null); setShowLicModal(true); }}>
                    <FaPlus size={12} className="me-1" /> Nueva licencia
                  </Button>
                </Col>
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

      <LicenciaModal
        show={showLicModal}
        onHide={() => { setShowLicModal(false); setSelectedLic(null); }}
        onSave={handleSaveLicencia}
        licencia={selectedLic}
        empresas={empresas}
        ocs={ocs}
        saving={saving}
      />

      <CambioUsuarioModal
        show={showCambioModal}
        onHide={() => { setShowCambioModal(false); setSelectedLic(null); }}
        onSave={handleCambioUsuario}
        licencia={selectedLic}
        ocs={ocs}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        title="Eliminar licencia"
        message={`¿Estás seguro de eliminar la licencia ${selectedLic?.codigoOfi}? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteModal(false); setSelectedLic(null); }}
      />
    </div>
  );
};

export default GestionLicencias;
