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
import { FaTriangleExclamation, FaStore, FaBoxOpen, FaArrowLeft } from 'react-icons/fa6';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import { precioCeroService } from '@/services/monitor.service';

const columnHelper = createColumnHelper();

const KpiCard = ({ titulo, valor, subtitulo, color = '#185FA5', onClick, activo }) => (
  <div className="card border-0 shadow-sm" style={{
    cursor: onClick ? 'pointer' : 'default',
    borderLeft: activo ? `3px solid ${color}` : '3px solid transparent',
    transition: 'all 0.2s'
  }} onClick={onClick}>
    <div className="card-body py-3">
      <p className="text-muted small text-uppercase mb-1" style={{ fontSize: 10 }}>{titulo}</p>
      <h3 className="fw-bold mb-0" style={{ color }}>{valor?.toLocaleString()}</h3>
      {subtitulo && <small className="text-muted">{subtitulo}</small>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="card border-0 shadow-sm p-2" style={{ fontSize: 12 }}>
      <p className="fw-semibold mb-1" style={{ color: '#185FA5' }}>{data?.storeCode} — {data?.storeName}</p>
      {payload.map((p, i) => (
        <p key={i} className="mb-0" style={{ color: p.color }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};


const DashboardPrecioCero = () => {
  const [resumen, setResumen]     = useState(null);
  const [detalle, setDetalle]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Vista activa: 'dashboard' | 'precio' | 'costo'
  const [vista, setVista]         = useState('dashboard');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchText, setSearchText]     = useState('');
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 15 });

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await precioCeroService.resumen();
        setResumen(res);
      } catch (err) {
        toast.error('Error al cargar resumen: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const verDetalle = async (tipo, tienda = null) => {
    try {
      setLoadingDetalle(true);
      setVista(tipo);
      setTiendaSeleccionada(tienda);
      setSearchText('');
      setGlobalFilter('');
      const data = tipo === 'precio'
        ? await precioCeroService.precio({ tienda: tienda?.storeCode })
        : await precioCeroService.costo({ tienda: tienda?.storeCode });
      setDetalle(data);
    } catch (err) {
      toast.error('Error al cargar detalle: ' + err.message);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const columns = [
    columnHelper.accessor('storeCode', {
      header: 'Tienda',
      cell: ({ row }) => (
        <div>
          <span className="fw-semibold font-monospace" style={{ color: '#185FA5', fontSize: 12 }}>{row.original.storeCode}</span>
          <div className="text-muted" style={{ fontSize: 10 }}>{row.original.storeName}</div>
        </div>
      ),
    }),
    columnHelper.accessor('sku', {
      header: 'SKU',
      cell: ({ getValue }) => <span className="font-monospace">{getValue()}</span>,
    }),
    columnHelper.accessor('codigoSAP', {
      header: 'Código SAP',
      cell: ({ getValue }) => <span className="font-monospace text-muted" style={{ fontSize: 11 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('descripcion', {
      header: 'Descripción',
      cell: ({ getValue }) => <span style={{ fontSize: 12 }}>{getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('talla', {
      header: 'Talla',
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor('color', {
      header: 'Color',
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor('costo', {
      header: 'Costo',
      cell: ({ getValue }) => {
        const v = getValue();
        return v ? (
          <span className="fw-semibold" style={{ color: v === 0 ? '#dc2626' : 'inherit' }}>
            S/ {v.toLocaleString()}
          </span>
        ) : <Badge bg="danger" style={{ fontSize: 10 }}>Sin costo</Badge>;
      },
    }),
    columnHelper.accessor('precioVenta', {
      header: 'Precio venta',
      cell: ({ getValue }) => {
        const v = getValue();
        return v ? (
          <span className="fw-semibold" style={{ color: v === 0 ? '#dc2626' : 'inherit' }}>
            S/ {v.toLocaleString()}
          </span>
        ) : <Badge bg="danger" style={{ fontSize: 10 }}>Sin precio</Badge>;
      },
    }),
    columnHelper.accessor('stock', {
      header: 'Stock',
      cell: ({ getValue }) => (
        <span className="fw-semibold">{getValue()?.toLocaleString() ?? '0'}</span>
      ),
    }),
  ];

  const table = useReactTable({
    data: detalle,
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

  // Tiendas únicas para filtro
  const tiendas = useMemo(() => {
    const key = vista === 'precio' ? resumen?.porTiendaPrecio : resumen?.porTiendaCosto;
    return key ?? [];
  }, [vista, resumen]);

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Control de Materiales — Precio y Costo Cero"
        subTitle1="Monitor"
        subTitle2="Dashboard"
        subText="Materiales con precio de venta o costo igual a cero por tienda."
      />

      <div className="main-content">

        {/* ── DASHBOARD ── */}
        {vista === 'dashboard' && (
          <>
            {/* KPIs */}
            <Row className="mb-4 g-3">
              <Col xs={6} md={3}>
                <KpiCard titulo="SKUs sin precio" valor={resumen?.totalSkuSinPrecio}
                  subtitulo={`${resumen?.totalTiendasSinPrecio} tiendas afectadas`}
                  color="#dc2626"
                  onClick={() => verDetalle('precio')} />
              </Col>
              <Col xs={6} md={3}>
                <KpiCard titulo="Stock sin precio" valor={resumen?.stockTotalSinPrecio}
                  subtitulo="unidades afectadas" color="#dc2626" />
              </Col>
              <Col xs={6} md={3}>
                <KpiCard titulo="SKUs sin costo" valor={resumen?.totalSkuSinCosto}
                  subtitulo={`${resumen?.totalTiendasSinCosto} tiendas afectadas`}
                  color="#d97706"
                  onClick={() => verDetalle('costo')} />
              </Col>
              <Col xs={6} md={3}>
                <KpiCard titulo="Stock sin costo" valor={resumen?.stockTotalSinCosto}
                  subtitulo="unidades afectadas" color="#d97706" />
              </Col>
            </Row>

            {/* Gráficos */}
            <Row className="g-3 mb-4">
              {/* Precio cero por tienda */}
              <Col md={6}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2 d-flex align-items-center justify-content-between"
                    style={{ background: '#fff1f1', borderBottom: '1px solid #fca5a5' }}>
                    <span className="fw-semibold small" style={{ color: '#991b1b' }}>
                      <FaTriangleExclamation size={12} className="me-1" />
                      Sin precio — Top tiendas
                    </span>
                    <Button size="sm" variant="outline-danger" style={{ fontSize: 11 }}
                      onClick={() => verDetalle('precio')}>
                      Ver detalle
                    </Button>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={resumen?.porTiendaPrecio?.slice(0, 10)}
                        margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="storeName" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" interval={0}/>
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="totalSku" name="SKUs sin precio" radius={[4, 4, 0, 0]}
                          onClick={(data) => verDetalle('precio', data)}>
                          {resumen?.porTiendaPrecio?.slice(0, 10).map((_, i) => (
                            <Cell key={i} fill={i === 0 ? '#dc2626' : i < 3 ? '#ef4444' : '#fca5a5'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>

              {/* Costo cero por tienda */}
              <Col md={6}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2 d-flex align-items-center justify-content-between"
                    style={{ background: '#fffbeb', borderBottom: '1px solid #fcd34d' }}>
                    <span className="fw-semibold small" style={{ color: '#92400e' }}>
                      <FaTriangleExclamation size={12} className="me-1" />
                      Sin costo — Top tiendas
                    </span>
                    <Button size="sm" variant="outline-warning" style={{ fontSize: 11 }}
                      onClick={() => verDetalle('costo')}>
                      Ver detalle
                    </Button>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={resumen?.porTiendaCosto?.slice(0, 10)}
                        margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="storeCode" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="totalSku" name="SKUs sin costo" radius={[4, 4, 0, 0]}
                          onClick={(data) => verDetalle('costo', data)}>
                          {resumen?.porTiendaCosto?.slice(0, 10).map((_, i) => (
                            <Cell key={i} fill={i === 0 ? '#d97706' : i < 3 ? '#f59e0b' : '#fcd34d'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Tabla resumen por tienda */}
            <Row className="g-3">
              <Col md={6}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2" style={{ background: '#fff1f1', borderBottom: '1px solid #fca5a5' }}>
                    <span className="fw-semibold small" style={{ color: '#991b1b' }}>Detalle por tienda — Sin precio</span>
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-sm table-hover mb-0" style={{ fontSize: 12 }}>
                      <thead className="table-light">
                        <tr>
                          <th>Tienda</th>
                          <th className="text-center">SKUs</th>
                          <th className="text-center">Stock</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen?.porTiendaPrecio?.map(t => (
                          <tr key={t.storeCode} style={{ cursor: 'pointer' }}
                            onClick={() => verDetalle('precio', t)}>
                            <td>
                              <div className="fw-semibold font-monospace" style={{ color: '#185FA5' }}>{t.storeCode}</div>
                              <div className="text-muted" style={{ fontSize: 10 }}>{t.storeName}</div>
                            </td>
                            <td className="text-center">
                              <Badge bg="danger" style={{ fontSize: 10 }}>{t.totalSku}</Badge>
                            </td>
                            <td className="text-center text-muted">{t.totalStock?.toLocaleString()}</td>
                            <td className="text-end">
                              <span style={{ fontSize: 10, color: '#185FA5' }}>Ver →</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2" style={{ background: '#fffbeb', borderBottom: '1px solid #fcd34d' }}>
                    <span className="fw-semibold small" style={{ color: '#92400e' }}>Detalle por tienda — Sin costo</span>
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-sm table-hover mb-0" style={{ fontSize: 12 }}>
                      <thead className="table-light">
                        <tr>
                          <th>Tienda</th>
                          <th className="text-center">SKUs</th>
                          <th className="text-center">Stock</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen?.porTiendaCosto?.map(t => (
                          <tr key={t.storeCode} style={{ cursor: 'pointer' }}
                            onClick={() => verDetalle('costo', t)}>
                            <td>
                              <div className="fw-semibold font-monospace" style={{ color: '#185FA5' }}>{t.storeCode}</div>
                              <div className="text-muted" style={{ fontSize: 10 }}>{t.storeName}</div>
                            </td>
                            <td className="text-center">
                              <Badge bg="warning" text="dark" style={{ fontSize: 10 }}>{t.totalSku}</Badge>
                            </td>
                            <td className="text-center text-muted">{t.totalStock?.toLocaleString()}</td>
                            <td className="text-end">
                              <span style={{ fontSize: 10, color: '#185FA5' }}>Ver →</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}

        {/* ── DETALLE ── */}
        {(vista === 'precio' || vista === 'costo') && (
          <>
            {/* Header detalle */}
            <div className="d-flex align-items-center gap-3 mb-3">
              <Button variant="outline-secondary" size="sm" onClick={() => setVista('dashboard')}>
                <FaArrowLeft size={11} className="me-1" /> Volver
              </Button>
              <div>
                <h6 className="mb-0 fw-semibold">
                  Materiales sin {vista === 'precio' ? 'precio' : 'costo'}
                  {tiendaSeleccionada && (
                    <Badge className="ms-2"
                      bg={vista === 'precio' ? 'danger' : 'warning'}
                      text={vista === 'costo' ? 'dark' : undefined}>
                      {tiendaSeleccionada.storeCode} — {tiendaSeleccionada.storeName}
                    </Badge>
                  )}
                </h6>
                <small className="text-muted">{detalle.length} registros encontrados</small>
              </div>
            </div>

            {/* Filtros detalle */}
            <div className="st-wrapper">
              <div className="st-toolbar row mb-3 g-2 align-items-center">
                <Col xs={12} sm={6} lg={3}>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text px-2">
                      <svg className="sa-icon" width={14} height={14}>
                        <use href="/icons/sprite.svg#search"></use>
                      </svg>
                    </span>
                    <input type="text" className="form-control"
                      placeholder="Buscar SKU, descripción, código..."
                      value={searchText}
                      onChange={e => { setSearchText(e.target.value); setGlobalFilter(e.target.value); }}
                      autoComplete="off"/>
                    {searchText && (
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => { setSearchText(''); setGlobalFilter(''); }}>✕</button>
                    )}
                  </div>
                </Col>
                {!tiendaSeleccionada && (
                  <Col xs={6} sm={4} lg={2}>
                    <Form.Select size="sm"
                      onChange={e => verDetalle(vista, tiendas.find(t => t.storeCode === e.target.value) || null)}>
                      <option value="">Todas las tiendas</option>
                      {tiendas.map(t => (
                        <option key={t.storeCode} value={t.storeCode}>{t.storeCode} — {t.storeName}</option>
                      ))}
                    </Form.Select>
                  </Col>
                )}
              </div>

              {loadingDetalle ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
              ) : (
                <>
                  <DataTable table={table} emptyMessage="No se encontraron registros" />
                  <TablePagination
                    totalItems={totalItems} start={start} end={end} itemsName="registros" showInfo
                    previousPage={table.previousPage} canPreviousPage={table.getCanPreviousPage()}
                    pageCount={table.getPageCount()} pageIndex={table.getState().pagination.pageIndex}
                    setPageIndex={table.setPageIndex} nextPage={table.nextPage}
                    canNextPage={table.getCanNextPage()} pageSize={table.getState().pagination.pageSize}
                    onPageSizeChange={table.setPageSize} showPageLimit
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPrecioCero;