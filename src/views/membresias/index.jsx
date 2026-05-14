import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { Row, Col, Button, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Spinner } from 'react-bootstrap';
import { FaEye, FaPlus, FaPen, FaTrash } from 'react-icons/fa6';
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
  const [searchText, setSearchText]       = useState('');
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
      cell: ({ getValue }) => <span className="font-monospace">{getValue() ?? '—'}</span>,
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
          <Button size="sm" variant="outline-info" title="Ver detalle"
            onClick={() => navigate(`/membresias/${row.original.idMembresia}`)}>
            <FaEye size={12} />
          </Button>
          <Button size="sm" variant="outline-secondary" title="Editar"
            onClick={() => { setSelectedMem(row.original); setShowModal(true); }}>
            <FaPen size={12} />
          </Button>
          <Button size="sm" variant="outline-danger" title="Eliminar"
            onClick={() => { setSelectedMem(row.original); setShowDeleteModal(true); }}>
            <FaTrash size={12} />
          </Button>
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
              <div className="st-toolbar row mb-3 g-2 align-items-center">
                <Col xs={12} sm={6} lg={4}>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text px-2">
                      <svg width={14} height={14}><use href="/icons/sprite.svg#search"></use></svg>
                    </span>
                    <input type="text" className="form-control"
                      placeholder="Buscar proyecto, requerimiento..."
                      value={searchText}
                      onChange={e => { setSearchText(e.target.value); setGlobalFilter(e.target.value); }}
                      autoComplete="off"/>
                    {searchText && (
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => { setSearchText(''); setGlobalFilter(''); }}>✕</button>
                    )}
                  </div>
                </Col>
                <Col xs={6} sm={4} lg={2}>
                  <SearchableSelect value={filterPeriodo} onChange={setFilterPeriodo} options={periodos} placeholder="Periodo" />
                </Col>
                <Col className="d-flex justify-content-end gap-2">
                   
                  <Button variant="primary" size="sm" onClick={() => { setSelectedMem(null); setShowModal(true); }}>
                    <FaPlus size={12} className="me-1" /> Nueva membresía
                  </Button>
                </Col>
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

      {/* MODAL ELIMINAR */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <ModalHeader closeButton><ModalTitle>Confirmar eliminación</ModalTitle></ModalHeader>
        <ModalBody>
          <p className="mb-0">¿Eliminar la membresía <strong>{selectedMem?.codigoProyecto}</strong>?</p>
          <small className="text-muted">Esta acción no se puede deshacer.</small>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={eliminar}>Eliminar</Button>
        </ModalFooter>
      </Modal>

    </div>
  );
};

export default GestionMembresias;
