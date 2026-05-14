import { useState, useEffect, useMemo } from 'react';
import {
  createColumnHelper, getCoreRowModel,
  getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table';
import { Row, Col, Button, Badge, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  FaTriangleExclamation, FaFileInvoice, FaBan, FaArrowLeft, FaCalendar, FaScaleUnbalanced
} from 'react-icons/fa6';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import DataTable from '@/components/table/DataTable';
import TablePagination from '@/components/table/TablePagination';
import { facturacionService } from '@/services/monitor.service';

const columnHelper = createColumnHelper();
const periodoActual = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// ── KPI Card ──────────────────────────────────────
const KpiCard = ({ titulo, valor, subtitulo, color = '#185FA5', icon: Icon, onClick, activo }) => (
  <div className="card border-0 shadow-sm" style={{
    cursor: onClick ? 'pointer' : 'default',
    borderLeft: activo ? `3px solid ${color}` : '3px solid transparent',
    transition: 'all 0.2s'
  }} onClick={onClick}>
    <div className="card-body py-3">
      <div className="d-flex justify-content-between align-items-start mb-1">
        <p className="text-muted small text-uppercase mb-0" style={{ fontSize: 10 }}>{titulo}</p>
        {Icon && <Icon size={14} style={{ color }} />}
      </div>
      <h3 className="fw-bold mb-0" style={{ color }}>{valor?.toLocaleString() ?? 0}</h3>
      {subtitulo && <small className="text-muted">{subtitulo}</small>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="card border-0 shadow-sm p-2" style={{ fontSize: 12 }}>
      <p className="fw-semibold mb-1" style={{ color: '#185FA5' }}>{data?.empresa}</p>
      <p className="mb-0">Total: <strong>{data?.total?.toLocaleString()}</strong></p>
      <p className="mb-0 text-muted">Monto: S/ {data?.monto?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
    </div>
  );
};

// ── Configuración de columnas por vista ───────────
const buildColumns = (vista) => {
  if (vista === 'errores') {
    return [
      columnHelper.accessor('empresa', {
        header: 'Empresa',
        cell: ({ getValue }) => <span className="fw-semibold" style={{ color: '#185FA5', fontSize: 12 }}>{getValue()}</span>,
      }),
      columnHelper.accessor('comprobante', {
        header: 'Comprobante',
        cell: ({ getValue }) => <span className="font-monospace fw-semibold">{getValue()}</span>,
      }),
      columnHelper.accessor('tipo_Documento', {
        header: 'Tipo',
        cell: ({ getValue }) => <span style={{ fontSize: 11 }}>{getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('ruc', {
        header: 'RUC',
        cell: ({ getValue }) => <span className="font-monospace" style={{ fontSize: 11 }}>{getValue()}</span>,
      }),
      columnHelper.accessor('razon_Social', {
        header: 'Razón Social',
        cell: ({ getValue }) => <span style={{ fontSize: 12 }}>{getValue()}</span>,
      }),
      columnHelper.accessor('importeTotal', {
        header: 'Importe',
        cell: ({ getValue }) => (
          <span className="fw-semibold">S/ {Number(getValue() ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        ),
      }),
      columnHelper.accessor('fechaEmisionTexto', {
        header: 'Emisión',
        cell: ({ getValue }) => <span style={{ fontSize: 11 }}>{getValue()}</span>,
      }),
      columnHelper.accessor('estado_Factus', {
        header: 'Estado',
        cell: ({ getValue }) => <Badge bg="danger" style={{ fontSize: 10 }}>{getValue()}</Badge>,
      }),
    ];
  }

  if (vista === 'diferencias') {
    return [
      columnHelper.accessor('empresa', {
        header: 'Empresa',
        cell: ({ getValue }) => <span className="fw-semibold" style={{ color: '#185FA5', fontSize: 12 }}>{getValue()}</span>,
      }),
      columnHelper.accessor('tipoDocVenta', {
        header: 'Tipo',
        cell: ({ getValue }) => <span style={{ fontSize: 11 }}>{getValue()}</span>,
      }),
      columnHelper.accessor('documentoVenta', {
        header: 'Documento',
        cell: ({ getValue }) => <span className="font-monospace fw-semibold">{getValue()}</span>,
      }),
      columnHelper.accessor('clienteNro', {
        header: 'Cliente',
        cell: ({ getValue }) => <span className="font-monospace" style={{ fontSize: 11 }}>{getValue()}</span>,
      }),
      columnHelper.accessor('nombreCliente', {
        header: 'Razón Social',
        cell: ({ getValue }) => <span style={{ fontSize: 12 }}>{getValue()}</span>,
      }),
      columnHelper.accessor('fechaVentaTexto', {
        header: 'Fecha',
        cell: ({ getValue }) => <span style={{ fontSize: 11 }}>{getValue()}</span>,
      }),
      columnHelper.accessor('totalPagar', {
        header: 'Total',
        cell: ({ getValue }) => (
          <span className="fw-semibold">S/ {Number(getValue() ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        ),
      }),
      columnHelper.accessor('estado_RMS', {
        header: 'Estado RMS',
        cell: ({ getValue }) => <Badge bg="secondary" style={{ fontSize: 10 }}>{getValue()}</Badge>,
      }),
      columnHelper.accessor('estado_Sunat', {
        header: 'Estado SUNAT',
        cell: ({ getValue }) => {
          const v = getValue();
          return !v
            ? <Badge bg="warning" text="dark" style={{ fontSize: 10 }}>Pendiente</Badge>
            : <Badge bg="info" style={{ fontSize: 10 }}>{v}</Badge>;
        },
      }),
    ];
  }

  // pendientes / anulados
  return [
    columnHelper.accessor('empresa', {
      header: 'Empresa',
      cell: ({ getValue }) => <span className="fw-semibold" style={{ color: '#185FA5', fontSize: 12 }}>{getValue()}</span>,
    }),
    columnHelper.accessor('tipoDocVenta', {
      header: 'Tipo Doc',
      cell: ({ getValue }) => <span style={{ fontSize: 11 }}>{getValue()}</span>,
    }),
    columnHelper.accessor('documentoVenta', {
      header: 'Documento',
      cell: ({ getValue }) => <span className="font-monospace fw-semibold">{getValue()}</span>,
    }),
    columnHelper.accessor('fechaVentaTexto', {
      header: 'Fecha',
      cell: ({ getValue }) => <span style={{ fontSize: 11 }}>{getValue()}</span>,
    }),
    columnHelper.accessor('totalPagar', {
      header: 'Total',
      cell: ({ getValue }) => (
        <span className="fw-semibold">S/ {Number(getValue() ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    }),
    columnHelper.accessor('estado_RMS', {
      header: 'Estado RMS',
      cell: ({ getValue }) => {
        const v = getValue();
        return v === 'C'
          ? <Badge bg="danger" style={{ fontSize: 10 }}>Anulado</Badge>
          : <Badge bg="success" style={{ fontSize: 10 }}>{v || 'Activo'}</Badge>;
      },
    }),
    columnHelper.accessor('estado_Sunat', {
      header: 'Estado SUNAT',
      cell: ({ getValue }) => {
        const v = getValue();
        return !v
          ? <Badge bg="warning" text="dark" style={{ fontSize: 10 }}>Pendiente</Badge>
          : <Badge bg="info" style={{ fontSize: 10 }}>{v}</Badge>;
      },
    }),
  ];
};

// ── COMPONENTE PRINCIPAL ──────────────────────────
const DashboardFacturacion = () => {
  const [resumen, setResumen]     = useState(null);
  const [detalle, setDetalle]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [periodo, setPeriodo]           = useState(periodoActual());
  const [periodoInput, setPeriodoInput] = useState(periodoActual());
  const [vista, setVista]               = useState('dashboard');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText]   = useState('');
  const [pagination, setPagination]   = useState({ pageIndex: 0, pageSize: 15 });

  // ── Cargar resumen ──
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await facturacionService.resumen(periodo);
        setResumen(res);
      } catch (err) {
        toast.error('Error al cargar resumen: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [periodo]);

  // ── Recargar detalle cuando cambia búsqueda ──
  useEffect(() => {
    if (vista === 'dashboard') return;
    const cargar = async () => {
      try {
        setLoadingDetalle(true);
        const filtros = {
          empresa: empresaSeleccionada?.empresa,
          search: searchText || undefined,
        };
        const map = {
          pendientes:  () => facturacionService.pendientes(periodo, filtros),
          anulados:    () => facturacionService.anulados(periodo, filtros),
          errores:     () => facturacionService.errores(periodo, filtros),
          diferencias: () => facturacionService.diferencias(periodo, filtros),
        };
        setDetalle(await map[vista]());
      } catch (err) {
        toast.error('Error: ' + err.message);
      } finally {
        setLoadingDetalle(false);
      }
    };
    cargar();
  }, [searchText]);

  // ── Ver detalle ──
  const verDetalle = async (tipo, empresa = null) => {
    try {
      setLoadingDetalle(true);
      setVista(tipo);
      setEmpresaSeleccionada(empresa);
      setSearchInput('');
      setSearchText('');
      setPagination({ pageIndex: 0, pageSize: 15 });

      const filtros = { empresa: empresa?.empresa };
      const map = {
        pendientes:  () => facturacionService.pendientes(periodo, filtros),
        anulados:    () => facturacionService.anulados(periodo, filtros),
        errores:     () => facturacionService.errores(periodo, filtros),
        diferencias: () => facturacionService.diferencias(periodo, filtros),
      };
      const data = await map[tipo]();
      setDetalle(data);
    } catch (err) {
      toast.error('Error al cargar detalle: ' + err.message);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // ── Tabla ──
  const columns = useMemo(() => buildColumns(vista), [vista]);
  const table = useReactTable({
    data: detalle,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalItems = detalle.length;
  const start = pagination.pageIndex * pagination.pageSize + 1;
  const end   = Math.min(start + pagination.pageSize - 1, totalItems);

  const empresasUnicas = useMemo(() => {
    if (vista === 'errores')     return resumen?.porEmpresaErrores ?? [];
    if (vista === 'diferencias') return resumen?.porEmpresaDiferencias ?? [];
    return resumen?.porEmpresaPendientes ?? [];
  }, [vista, resumen]);

  const tituloDetalle = {
    pendientes:  'Documentos pendientes en SUNAT',
    anulados:    'Documentos anulados en RMS',
    errores:     'Documentos con error en Factus',
    diferencias: 'Diferencias entre Factus y RMS',
  };

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Facturación Electrónica"
        subTitle1="Monitor"
        subTitle2="Dashboard"
        subText="Documentos pendientes, anulados, errores y diferencias entre Factus y RMS."
      />

      <div className="main-content">

        {/* ── DASHBOARD ─────────────────────────── */}
        {vista === 'dashboard' && (
          <>
            <Row className="mb-3">
              <Col xs={12} sm={6} md={4}>
                <div className="input-group flex-nowrap">
                  <span className="input-group-text px-2"><FaCalendar size={12} /></span>
                  <input type="text" className="form-control"
                    placeholder="Periodo (YYYYMM)"
                    value={periodoInput}
                    onChange={e => setPeriodoInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setPeriodo(periodoInput)}
                    maxLength={6}
                    autoComplete="off" />
                  <button className="btn btn-primary" type="button"
                    onClick={() => setPeriodo(periodoInput)}>Buscar</button>
                </div>
              </Col>
            </Row>

            {/* KPIs */}
            <Row className="mb-4 g-3">
              <Col xs={12} md={6} lg={3}>
                <KpiCard titulo="Pendientes SUNAT" valor={resumen?.totalPendientesSunat}
                  subtitulo={`S/ ${(resumen?.montoPendientesSunat ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  color="#d97706" icon={FaFileInvoice}
                  onClick={() => verDetalle('pendientes')} />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <KpiCard titulo="Anulados RMS" valor={resumen?.totalAnuladosRms}
                  subtitulo={`S/ ${(resumen?.montoAnuladosRms ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  color="#2563eb" icon={FaBan}
                  onClick={() => verDetalle('anulados')} />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <KpiCard titulo="Errores Factus" valor={resumen?.totalErroresFactus}
                  subtitulo={`S/ ${(resumen?.montoErroresFactus ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  color="#dc2626" icon={FaTriangleExclamation}
                  onClick={() => verDetalle('errores')} />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <KpiCard titulo="Diferencias Factus-RMS" valor={resumen?.totalDiferencias}
                  subtitulo={`S/ ${(resumen?.montoDiferencias ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  color="#7c3aed" icon={FaScaleUnbalanced}
                  onClick={() => verDetalle('diferencias')} />
              </Col>
            </Row>

            {/* Gráficos */}
            <Row className="g-3 mb-4">
              <Col md={6}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2 d-flex align-items-center justify-content-between"
                    style={{ background: '#fffbeb', borderBottom: '1px solid #fcd34d' }}>
                    <span className="fw-semibold small" style={{ color: '#92400e' }}>
                      <FaFileInvoice size={12} className="me-1" />
                      Pendientes SUNAT — Por empresa
                    </span>
                    <Button size="sm" variant="outline-warning" style={{ fontSize: 11 }}
                      onClick={() => verDetalle('pendientes')}>
                      Ver detalle
                    </Button>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={resumen?.porEmpresaPendientes?.slice(0, 10)}
                        margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="empresa" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" name="Pendientes" radius={[4, 4, 0, 0]}
                          onClick={(data) => verDetalle('pendientes', data)}>
                          {resumen?.porEmpresaPendientes?.slice(0, 10).map((_, i) => (
                            <Cell key={i} fill={i === 0 ? '#d97706' : i < 3 ? '#f59e0b' : '#fcd34d'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2 d-flex align-items-center justify-content-between"
                    style={{ background: '#fff1f1', borderBottom: '1px solid #fca5a5' }}>
                    <span className="fw-semibold small" style={{ color: '#991b1b' }}>
                      <FaTriangleExclamation size={12} className="me-1" />
                      Errores Factus — Por empresa
                    </span>
                    <Button size="sm" variant="outline-danger" style={{ fontSize: 11 }}
                      onClick={() => verDetalle('errores')}>
                      Ver detalle
                    </Button>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={resumen?.porEmpresaErrores?.slice(0, 10)}
                        margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="empresa" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" name="Errores" radius={[4, 4, 0, 0]}
                          onClick={(data) => verDetalle('errores', data)}>
                          {resumen?.porEmpresaErrores?.slice(0, 10).map((_, i) => (
                            <Cell key={i} fill={i === 0 ? '#dc2626' : i < 3 ? '#ef4444' : '#fca5a5'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Tablas resumen por empresa */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2" style={{ background: '#fffbeb', borderBottom: '1px solid #fcd34d' }}>
                    <span className="fw-semibold small" style={{ color: '#92400e' }}>Pendientes SUNAT por empresa</span>
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-sm table-hover mb-0" style={{ fontSize: 12 }}>
                      <thead className="table-light">
                        <tr>
                          <th>Empresa</th>
                          <th className="text-center">Total</th>
                          <th className="text-end">Monto</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen?.porEmpresaPendientes?.map(e => (
                          <tr key={e.empresa} style={{ cursor: 'pointer' }}
                            onClick={() => verDetalle('pendientes', e)}>
                            <td className="fw-semibold" style={{ color: '#185FA5' }}>{e.empresa}</td>
                            <td className="text-center">
                              <Badge bg="warning" text="dark" style={{ fontSize: 10 }}>{e.total}</Badge>
                            </td>
                            <td className="text-end text-muted">
                              S/ {e.monto?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
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
                  <div className="card-header py-2" style={{ background: '#fff1f1', borderBottom: '1px solid #fca5a5' }}>
                    <span className="fw-semibold small" style={{ color: '#991b1b' }}>Errores Factus por empresa</span>
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-sm table-hover mb-0" style={{ fontSize: 12 }}>
                      <thead className="table-light">
                        <tr>
                          <th>Empresa</th>
                          <th className="text-center">Total</th>
                          <th className="text-end">Monto</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen?.porEmpresaErrores?.map(e => (
                          <tr key={e.empresa} style={{ cursor: 'pointer' }}
                            onClick={() => verDetalle('errores', e)}>
                            <td className="fw-semibold" style={{ color: '#185FA5' }}>{e.empresa}</td>
                            <td className="text-center">
                              <Badge bg="danger" style={{ fontSize: 10 }}>{e.total}</Badge>
                            </td>
                            <td className="text-end text-muted">
                              S/ {e.monto?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
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

            {/* Diferencias por empresa */}
            <Row className="g-3">
              <Col md={12}>
                <div className="card border-0 shadow-sm">
                  <div className="card-header py-2 d-flex align-items-center justify-content-between"
                    style={{ background: '#f5f3ff', borderBottom: '1px solid #c4b5fd' }}>
                    <span className="fw-semibold small" style={{ color: '#5b21b6' }}>
                      <FaScaleUnbalanced size={12} className="me-1" />
                      Diferencias Factus-RMS por empresa
                    </span>
                    <Button size="sm" variant="outline-primary" style={{ fontSize: 11, color: '#7c3aed', borderColor: '#7c3aed' }}
                      onClick={() => verDetalle('diferencias')}>
                      Ver detalle
                    </Button>
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-sm table-hover mb-0" style={{ fontSize: 12 }}>
                      <thead className="table-light">
                        <tr>
                          <th>Empresa</th>
                          <th className="text-center">Total</th>
                          <th className="text-end">Monto</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen?.porEmpresaDiferencias?.map(e => (
                          <tr key={e.empresa} style={{ cursor: 'pointer' }}
                            onClick={() => verDetalle('diferencias', e)}>
                            <td className="fw-semibold" style={{ color: '#185FA5' }}>{e.empresa}</td>
                            <td className="text-center">
                              <Badge style={{ fontSize: 10, background: '#7c3aed' }}>{e.total}</Badge>
                            </td>
                            <td className="text-end text-muted">
                              S/ {e.monto?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
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

        {/* ── DETALLE ───────────────────────────── */}
        {vista !== 'dashboard' && (
          <>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Button variant="outline-secondary" size="sm" onClick={() => setVista('dashboard')}>
                <FaArrowLeft size={11} className="me-1" /> Volver
              </Button>
              <div>
                <h6 className="mb-0 fw-semibold">
                  {tituloDetalle[vista]}
                  {empresaSeleccionada && (
                    <Badge className="ms-2" bg="primary">{empresaSeleccionada.empresa}</Badge>
                  )}
                </h6>
                <small className="text-muted">{detalle.length} registros encontrados</small>
              </div>
            </div>

            <div className="st-wrapper">
              <div className="st-toolbar row mb-3 g-2 align-items-center">
                <Col xs={12} sm={6} lg={3}>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text px-2">🔍</span>
                    <input type="text" className="form-control"
                      placeholder="Buscar documento, RUC, razón social..."
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && setSearchText(searchInput)}
                      autoComplete="off" />
                    <button className="btn btn-primary" type="button"
                      onClick={() => setSearchText(searchInput)}>Buscar</button>
                    {searchInput && (
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => { setSearchInput(''); setSearchText(''); }}>✕</button>
                    )}
                  </div>
                </Col>
                {!empresaSeleccionada && (
                  <Col xs={6} sm={4} lg={2}>
                    <Form.Select size="sm"
                      onChange={e => verDetalle(vista, empresasUnicas.find(emp => emp.empresa === e.target.value) || null)}>
                      <option value="">Todas las empresas</option>
                      {empresasUnicas.map(emp => (
                        <option key={emp.empresa} value={emp.empresa}>{emp.empresa}</option>
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

export default DashboardFacturacion;