import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { FaFileExport, FaFileCsv } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import { basePath } from '@/helpers';
import { oficinasApi } from '@/api/licencia.api';
import { empresasService } from '@/services/licencia.service';

const ReportePagos = () => {
  const [data, setData]         = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading]   = useState(true);

  const [search, setSearch]           = useState('');
  const [searchText, setSearchText]   = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterEstado, setFilterEstado]   = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const [reporte, listaEmpresas] = await Promise.all([
          oficinasApi.reporte(),
          empresasService.listar(),
        ]);
        setData(reporte);
        setEmpresas(listaEmpresas);
      } catch (err) {
        toast.error('Error al cargar reporte: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // ── Aplanar datos para la tabla ───────────────────────
  // Cada fila = una combinación de OFI + HES Proveedor + OC Cliente + HES Cliente + Facturación
  const filas = useMemo(() => {
    const resultado = [];

    data.forEach(ofi => {
      const baseOfi = {
        codigoOfi:       ofi.codigoOfi,
        estado:          ofi.estado,
        usuarioActual:   ofi.usuarioActual,
        usuarioAnterior: ofi.usuarioAnterior,
        empresaUsuario:  ofi.empresaUsuario,
        empresaLicencia: ofi.empresaLicencia,
        puesto:          ofi.puesto,
        periodo:         ofi.periodo,
        // OC Proveedor
        numeroOc:        ofi.numeroOc    ?? '—',
        estadoOc:        ofi.estadoOc    ?? '—',
        ordenCo:         ofi.ordenCo     ?? '—',
        solpedCompra:    ofi.solpedCompra ?? '—',
        importeUsd:      ofi.importeUsd  ?? '—',
        importePen:      ofi.importePen  ?? '—',
      };

      // Si tiene HES Proveedor
      if (ofi.hesProveedor?.length > 0) {
        ofi.hesProveedor.forEach(hes => {
          const baseHes = {
            ...baseOfi,
            hesNumero:    hes.numeroHes,
            hesUsd:       hes.importeUsd ?? '—',
            hesPen:       hes.importePen ?? '—',
            hesFecha:     hes.fechaHes   ?? '—',
            hesDesc:      hes.descripcion ?? '—',
          };

          // Si tiene OC Cliente
          if (ofi.ocClientes?.length > 0) {
            ofi.ocClientes.forEach(occ => {
              if (occ.hesClientes?.length > 0) {
                occ.hesClientes.forEach(hc => {
                  if (hc.facturaciones?.length > 0) {
                    hc.facturaciones.forEach(f => {
                      resultado.push({
                        ...baseHes,
                        codSapCliente:     occ.codSapCliente     ?? '—',
                        empresaFacturable: occ.empresaFacturable  ?? '—',
                        importeRefPen:     occ.importeRefPen     ?? '—',
                        importeRefUsd:     occ.importeRefUsd     ?? '—',
                        hesClienteNumero:  hc.numeroHes,
                        hesClienteUsd:     hc.importeUsd ?? '—',
                        hesClientePen:     hc.importePen ?? '—',
                        hesClienteFecha:   hc.fechaHes   ?? '—',
                        estadoCsc:         f.estadoCsc     ?? '—',
                        anioMesFac:        f.anioMesFac    ?? '—',
                        nroFacturaSap:     f.nroFacturaSap ?? '—',
                        montoFactPen:      f.montoFactPen  ?? '—',
                        montoFactUsd:      f.montoFactUsd  ?? '—',
                      });
                    });
                  } else {
                    resultado.push({
                      ...baseHes,
                      codSapCliente:     occ.codSapCliente     ?? '—',
                      empresaFacturable: occ.empresaFacturable  ?? '—',
                      importeRefPen:     occ.importeRefPen     ?? '—',
                      importeRefUsd:     occ.importeRefUsd     ?? '—',
                      hesClienteNumero:  hc.numeroHes,
                      hesClienteUsd:     hc.importeUsd ?? '—',
                      hesClientePen:     hc.importePen ?? '—',
                      hesClienteFecha:   hc.fechaHes   ?? '—',
                      estadoCsc: '—', anioMesFac: '—', nroFacturaSap: '—', montoFactPen: '—', montoFactUsd: '—',
                    });
                  }
                });
              } else {
                resultado.push({
                  ...baseHes,
                  codSapCliente:     occ.codSapCliente     ?? '—',
                  empresaFacturable: occ.empresaFacturable  ?? '—',
                  importeRefPen:     occ.importeRefPen     ?? '—',
                  importeRefUsd:     occ.importeRefUsd     ?? '—',
                  hesClienteNumero: '—', hesClienteUsd: '—', hesClientePen: '—', hesClienteFecha: '—',
                  estadoCsc: '—', anioMesFac: '—', nroFacturaSap: '—', montoFactPen: '—', montoFactUsd: '—',
                });
              }
            });
          } else {
            resultado.push({
              ...baseHes,
              codSapCliente: '—', empresaFacturable: '—', importeRefPen: '—', importeRefUsd: '—',
              hesClienteNumero: '—', hesClienteUsd: '—', hesClientePen: '—', hesClienteFecha: '—',
              estadoCsc: '—', anioMesFac: '—', nroFacturaSap: '—', montoFactPen: '—', montoFactUsd: '—',
            });
          }
        });
      } else {
        // Sin HES Proveedor
        if (ofi.ocClientes?.length > 0) {
          ofi.ocClientes.forEach(occ => {
            if (occ.hesClientes?.length > 0) {
              occ.hesClientes.forEach(hc => {
                if (hc.facturaciones?.length > 0) {
                  hc.facturaciones.forEach(f => {
                    resultado.push({
                      ...baseOfi,
                      hesNumero: '—', hesUsd: '—', hesPen: '—', hesFecha: '—', hesDesc: '—',
                      codSapCliente:     occ.codSapCliente     ?? '—',
                      empresaFacturable: occ.empresaFacturable  ?? '—',
                      importeRefPen:     occ.importeRefPen     ?? '—',
                      importeRefUsd:     occ.importeRefUsd     ?? '—',
                      hesClienteNumero:  hc.numeroHes,
                      hesClienteUsd:     hc.importeUsd ?? '—',
                      hesClientePen:     hc.importePen ?? '—',
                      hesClienteFecha:   hc.fechaHes   ?? '—',
                      estadoCsc:         f.estadoCsc     ?? '—',
                      anioMesFac:        f.anioMesFac    ?? '—',
                      nroFacturaSap:     f.nroFacturaSap ?? '—',
                      montoFactPen:      f.montoFactPen  ?? '—',
                      montoFactUsd:      f.montoFactUsd  ?? '—',
                    });
                  });
                } else {
                  resultado.push({
                    ...baseOfi,
                    hesNumero: '—', hesUsd: '—', hesPen: '—', hesFecha: '—', hesDesc: '—',
                    codSapCliente:     occ.codSapCliente     ?? '—',
                    empresaFacturable: occ.empresaFacturable  ?? '—',
                    importeRefPen:     occ.importeRefPen     ?? '—',
                    importeRefUsd:     occ.importeRefUsd     ?? '—',
                    hesClienteNumero: hc.numeroHes,
                    hesClienteUsd: hc.importeUsd ?? '—', hesClientePen: hc.importePen ?? '—', hesClienteFecha: hc.fechaHes ?? '—',
                    estadoCsc: '—', anioMesFac: '—', nroFacturaSap: '—', montoFactPen: '—', montoFactUsd: '—',
                  });
                }
              });
            } else {
              resultado.push({
                ...baseOfi,
                hesNumero: '—', hesUsd: '—', hesPen: '—', hesFecha: '—', hesDesc: '—',
                codSapCliente: occ.codSapCliente ?? '—', empresaFacturable: occ.empresaFacturable ?? '—',
                importeRefPen: occ.importeRefPen ?? '—', importeRefUsd: occ.importeRefUsd ?? '—',
                hesClienteNumero: '—', hesClienteUsd: '—', hesClientePen: '—', hesClienteFecha: '—',
                estadoCsc: '—', anioMesFac: '—', nroFacturaSap: '—', montoFactPen: '—', montoFactUsd: '—',
              });
            }
          });
        } else {
          resultado.push({
            ...baseOfi,
            hesNumero: '—', hesUsd: '—', hesPen: '—', hesFecha: '—', hesDesc: '—',
            codSapCliente: '—', empresaFacturable: '—', importeRefPen: '—', importeRefUsd: '—',
            hesClienteNumero: '—', hesClienteUsd: '—', hesClientePen: '—', hesClienteFecha: '—',
            estadoCsc: '—', anioMesFac: '—', nroFacturaSap: '—', montoFactPen: '—', montoFactUsd: '—',
          });
        }
      }
    });

    return resultado;
  }, [data]);

  // ── Filtros ───────────────────────────────────────────
  const filteredFilas = useMemo(() => {
    return filas.filter(f => {
      const matchSearch  = !search || Object.values(f).join(' ').toLowerCase().includes(search.toLowerCase());
      const matchEmpresa = !filterEmpresa || f.empresaUsuario?.includes(filterEmpresa);
      const matchEstado  = !filterEstado  || f.estado === filterEstado;
      return matchSearch && matchEmpresa && matchEstado;
    });
  }, [filas, search, filterEmpresa, filterEstado]);

  // ── Headers comunes ───────────────────────────────────
  const HEADERS = [
    'Oficina','Usuario actual','Usuario anterior','Estado','Empresa usuario','Empresa licencia','Puesto','Período',
    'N° OC Proveedor','Estado OC','Orden CO','Solped','Imp. USD Prov.','Imp. PEN Prov.',
    'N° HES Prov.','HES Imp. USD','HES Imp. PEN','HES Fecha',
    'Cod. SAP Cliente','Emp. Facturable','Ref. PEN','Ref. USD',
    'N° HES Cliente','HES CLI USD','HES CLI PEN','HES CLI Fecha',
    'Estado CSC','Año/Mes Fac','Nro. Factura SAP','Monto Fact PEN','Monto Fact USD',
  ];

  const filaToArray = (f) => [
    f.codigoOfi, f.usuarioActual, f.usuarioAnterior, f.estado, f.empresaUsuario, f.empresaLicencia, f.puesto, f.periodo,
    f.numeroOc, f.estadoOc, f.ordenCo, f.solpedCompra, f.importeUsd, f.importePen,
    f.hesNumero, f.hesUsd, f.hesPen, f.hesFecha,
    f.codSapCliente, f.empresaFacturable, f.importeRefPen, f.importeRefUsd,
    f.hesClienteNumero, f.hesClienteUsd, f.hesClientePen, f.hesClienteFecha,
    f.estadoCsc, f.anioMesFac, f.nroFacturaSap, f.montoFactPen, f.montoFactUsd,
  ];

  // ── Exportar CSV ──────────────────────────────────────
  const exportCSV = () => {
    const csv = [HEADERS, ...filteredFilas.map(filaToArray)]
      .map(r => r.map(v => `"${v ?? ''}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `reporte_licencias_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.info('CSV exportado correctamente');
  };

  // ── Exportar Excel ────────────────────────────────────
  const exportExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...filteredFilas.map(filaToArray)]);
    ws['!cols'] = HEADERS.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `reporte_licencias_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.info('Excel exportado correctamente');
  };

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Reporte de pagos"
        subTitle1="Gestión"
        subTitle2="Licencias"
        subText="Vista consolidada de OC proveedor, HES, OC cliente y facturación."
      />

      <div className="main-content">
        <Row>
          <Col lg={12}>
            <div className="st-wrapper">

              {/* Toolbar */}
              <div className="st-toolbar row mb-3 g-2 align-items-center">
                <Col xs={12} sm={6} lg={3}>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text px-2">
                      <svg className="sa-icon sa-bold" width={14} height={14}>
                        <use href={`${basePath}/icons/sprite.svg#search`}></use>
                      </svg>
                    </span>
                    <input type="text" className="form-control"
                      placeholder="Buscar..."
                      value={searchText}
                      onChange={e => { setSearchText(e.target.value); setSearch(e.target.value); }}
                      autoComplete="off"/>
                    {searchText && (
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => { setSearchText(''); setSearch(''); }}>✕</button>
                    )}
                  </div>
                </Col>
                <Col xs={6} sm={4} lg={2}>
                  <Form.Select size="sm" value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)}>
                    <option value="">Todas las empresas</option>
                    {empresas.map(e => <option key={e.idEmpresa} value={e.codigo}>{e.codigo} - {e.nombre}</option>)}
                  </Form.Select>
                </Col>
                <Col xs={6} sm={4} lg={2}>
                  <Form.Select size="sm" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="Ocupado">Ocupado</option>
                    <option value="Libre">Libre</option>
                  </Form.Select>
                </Col>
                <Col className="d-flex justify-content-end gap-2">
                  <small className="text-muted d-flex align-items-center me-2">{filteredFilas.length} filas</small>
                  <Button variant="outline-secondary" size="sm" onClick={exportCSV}>
                    <FaFileCsv size={12} className="me-1"/> CSV
                  </Button>
                  <Button variant="outline-success" size="sm" onClick={exportExcel}>
                    <FaFileExport size={12} className="me-1"/> Excel
                  </Button>
                </Col>
              </div>

              {/* Tabla */}
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-sm table-hover table-bordered" style={{ fontSize: 11, minWidth: 2400 }}>
                  <thead>
                    <tr>
                      <th colSpan={8} className="text-center" style={{ background: '#f3f4f6', color: '#374151', borderRight: '2px solid #d1d5db' }}>DATOS GENERALES</th>
                      <th colSpan={6} className="text-center" style={{ background: '#fff1f1', color: '#991b1b', borderRight: '2px solid #fca5a5' }}>OC PROVEEDOR</th>
                      <th colSpan={4} className="text-center" style={{ background: '#fee2e2', color: '#991b1b', borderRight: '2px solid #fca5a5' }}>HES PROVEEDOR</th>
                      <th colSpan={4} className="text-center" style={{ background: '#f3f4f6', color: '#374151', borderRight: '2px solid #d1d5db' }}>OC CLIENTE</th>
                      <th colSpan={4} className="text-center" style={{ background: '#dbeafe', color: '#1e40af', borderRight: '2px solid #93c5fd' }}>HES CLIENTE</th>
                      <th colSpan={5} className="text-center" style={{ background: '#eff6ff', color: '#1e40af' }}>FACTURACIÓN</th>
                    </tr>
                    <tr style={{ fontSize: 10 }}>
                      <th>Oficina</th><th>Usuario actual</th><th>Usuario anterior</th><th>Estado</th>
                      <th>Empresa usuario</th><th>Empresa licencia</th><th>Puesto</th><th style={{ borderRight: '2px solid #d1d5db' }}>Período</th>
                      <th>N° OC</th><th>Estado OC</th><th>Orden CO</th><th>Solped</th><th>Imp. USD</th><th style={{ borderRight: '2px solid #fca5a5' }}>Imp. PEN</th>
                      <th>N° HES</th><th>USD</th><th>PEN</th><th style={{ borderRight: '2px solid #fca5a5' }}>Fecha</th>
                      <th>Cod. SAP</th><th>Emp. Facturable</th><th>Ref. PEN</th><th style={{ borderRight: '2px solid #d1d5db' }}>Ref. USD</th>
                      <th>N° HES</th><th>USD</th><th>PEN</th><th style={{ borderRight: '2px solid #93c5fd' }}>Fecha</th>
                      <th>Estado CSC</th><th>Año/Mes</th><th>Nro. Factura SAP</th><th>Monto PEN</th><th>Monto USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFilas.length === 0 ? (
                      <tr><td colSpan={31} className="text-center text-muted py-4">No se encontraron registros</td></tr>
                    ) : filteredFilas.map((f, i) => (
                      <tr key={i}>
                        <td className="fw-semibold" style={{ color: '#185FA5' }}>{f.codigoOfi}</td>
                        <td>{f.usuarioActual}</td>
                        <td className="text-muted">{f.usuarioAnterior}</td>
                        <td><span className={`badge bg-${f.estado === 'Ocupado' ? 'success' : 'warning'}`}>{f.estado}</span></td>
                        <td className="text-muted" style={{ fontSize: 10 }}>{f.empresaUsuario}</td>
                        <td className="text-muted" style={{ fontSize: 10 }}>{f.empresaLicencia}</td>
                        <td>{f.puesto}</td>
                        <td style={{ borderRight: '2px solid #d1d5db' }}>{f.periodo}</td>
                        {/* OC Proveedor */}
                        <td><span className="badge" style={{ background: '#fee2e2', color: '#991b1b', fontFamily: 'monospace' }}>{f.numeroOc}</span></td>
                        <td><span className={`badge bg-${f.estadoOc === 'Activa' ? 'success' : 'secondary'}`}>{f.estadoOc}</span></td>
                        <td className="font-monospace" style={{ fontSize: 10 }}>{f.ordenCo}</td>
                        <td className="font-monospace" style={{ fontSize: 10 }}>{f.solpedCompra}</td>
                        <td>$ {f.importeUsd}</td>
                        <td style={{ borderRight: '2px solid #fca5a5' }}>S/ {f.importePen}</td>
                        {/* HES Proveedor */}
                        <td className="font-monospace" style={{ color: '#991b1b' }}>{f.hesNumero}</td>
                        <td>$ {f.hesUsd}</td>
                        <td>S/ {f.hesPen}</td>
                        <td style={{ borderRight: '2px solid #fca5a5' }} className="text-muted">{f.hesFecha}</td>
                        {/* OC Cliente */}
                        <td className="font-monospace" style={{ fontSize: 10 }}>{f.codSapCliente}</td>
                        <td className="text-muted" style={{ fontSize: 10 }}>{f.empresaFacturable}</td>
                        <td>S/ {f.importeRefPen}</td>
                        <td style={{ borderRight: '2px solid #d1d5db' }}>$ {f.importeRefUsd}</td>
                        {/* HES Cliente */}
                        <td className="font-monospace" style={{ color: '#1e40af' }}>{f.hesClienteNumero}</td>
                        <td>$ {f.hesClienteUsd}</td>
                        <td>S/ {f.hesClientePen}</td>
                        <td style={{ borderRight: '2px solid #93c5fd' }} className="text-muted">{f.hesClienteFecha}</td>
                        {/* Facturación */}
                        <td>{f.estadoCsc !== '—' ? <span className="badge bg-info text-dark">{f.estadoCsc}</span> : '—'}</td>
                        <td className="font-monospace">{f.anioMesFac}</td>
                        <td className="font-monospace fw-semibold">{f.nroFacturaSap}</td>
                        <td>S/ {f.montoFactPen}</td>
                        <td>$ {f.montoFactUsd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ReportePagos;
