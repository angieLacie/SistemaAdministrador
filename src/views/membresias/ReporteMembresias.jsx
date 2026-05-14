import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { FaFileExport, FaFileCsv } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import { membresiasService } from '@/services/membresia.service';

const ReporteMembresias = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch]           = useState('');
  const [searchText, setSearchText]   = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const reporte = await membresiasService.reporte({ periodo: filterPeriodo });
        setData(reporte);
      } catch (err) {
        toast.error('Error al cargar reporte: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [filterPeriodo]);

  // Períodos únicos
  const periodos = useMemo(() => {
    const set = new Set(data.map(d => d.periodo).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [data]);

  // ── Aplanar datos ─────────────────────────────────────
  const filas = useMemo(() => {
    const resultado = [];

    data.forEach(mem => {
      const baseMem = {
        codigoProyecto:      mem.codigoProyecto,
        nombreRequerimiento: mem.nombreRequerimiento ?? '—',
        periodo:             mem.periodo             ?? '—',
        // OC Proveedor
        numeroOc:     mem.numeroOc     ?? '—',
        estadoOc:     mem.estadoOc     ?? '—',
        ordenCo:      mem.ordenCo      ?? '—',
        solpedCompra: mem.solpedCompra ?? '—',
        importeUsd:   mem.importeUsd   ?? '—',
        importePen:   mem.importePen   ?? '—',
      };

      // HES Proveedor
      const hesItems = mem.hesProveedor?.length > 0
        ? mem.hesProveedor
        : [{ numeroHes: '—', importeUsd: '—', importePen: '—', fechaHes: '—' }];

      hesItems.forEach(hes => {
        const baseHes = {
          ...baseMem,
          hesNumero: hes.numeroHes  ?? '—',
          hesUsd:    hes.importeUsd ?? '—',
          hesPen:    hes.importePen ?? '—',
          hesFecha:  hes.fechaHes   ?? '—',
        };

        // OC Clientes
        if (mem.ocClientes?.length > 0) {
          mem.ocClientes.forEach(occ => {
            const baseOcc = {
              ...baseHes,
              codSapCliente:       occ.codSapCliente       ?? '—',
              empresaRefacturable: occ.empresaRefacturable  ?? '—',
              importeRefPen:       occ.importeRefPen        ?? '—',
              importeRefUsd:       occ.importeRefUsd        ?? '—',
            };

            // HES Cliente
            if (occ.hesClientes?.length > 0) {
              occ.hesClientes.forEach(hc => {
                const baseHc = {
                  ...baseOcc,
                  osClienteCsc:  hc.osClienteCsc  ?? '—',
                  hesClienteCsc: hc.hesClienteCsc ?? '—',
                  hesCliUsd:     hc.importeUsd    ?? '—',
                  hesCliPen:     hc.importePen    ?? '—',
                  hesCliFecha:   hc.fechaHes      ?? '—',
                };

                // Facturación
                if (hc.facturaciones?.length > 0) {
                  hc.facturaciones.forEach(f => {
                    resultado.push({
                      ...baseHc,
                      estadoCsc:     f.estadoCsc     ?? '—',
                      anioMesFac:    f.anioMesFac    ?? '—',
                      nroFacturaSap: f.nroFacturaSap ?? '—',
                      montoFactPen:  f.montoFactPen  ?? '—',
                      montoFactUsd:  f.montoFactUsd  ?? '—',
                    });
                  });
                } else {
                  resultado.push({
                    ...baseHc,
                    estadoCsc: '—', anioMesFac: '—', nroFacturaSap: '—',
                    montoFactPen: '—', montoFactUsd: '—',
                  });
                }
              });
            } else {
              resultado.push({
                ...baseOcc,
                osClienteCsc: '—', hesClienteCsc: '—',
                hesCliUsd: '—', hesCliPen: '—', hesCliFecha: '—',
                estadoCsc: '—', anioMesFac: '—', nroFacturaSap: '—',
                montoFactPen: '—', montoFactUsd: '—',
              });
            }
          });
        } else {
          resultado.push({
            ...baseHes,
            codSapCliente: '—', empresaRefacturable: '—',
            importeRefPen: '—', importeRefUsd: '—',
            osClienteCsc: '—', hesClienteCsc: '—',
            hesCliUsd: '—', hesCliPen: '—', hesCliFecha: '—',
            estadoCsc: '—', anioMesFac: '—', nroFacturaSap: '—',
            montoFactPen: '—', montoFactUsd: '—',
          });
        }
      });
    });

    return resultado;
  }, [data]);

  // ── Filtro búsqueda ───────────────────────────────────
  const filteredFilas = useMemo(() => {
    return filas.filter(f => {
      const matchSearch = !search || Object.values(f).join(' ').toLowerCase().includes(search.toLowerCase());
      const matchPeriodo = !filterPeriodo || f.periodo === filterPeriodo;
      return matchSearch && matchPeriodo;
    });
  }, [filas, search, filterPeriodo]);

  // ── Headers ───────────────────────────────────────────
  const HEADERS = [
    'Código Proyecto', 'Nombre Requerimiento', 'Período',
    'N° OC Prov.', 'Estado OC', 'Orden CO', 'Solped', 'Imp. USD Prov.', 'Imp. PEN Prov.',
    'N° HES Prov.', 'HES USD', 'HES PEN', 'HES Fecha',
    'Cod. SAP Cliente', 'Emp. Refacturable', 'Ref. PEN', 'Ref. USD',
    'OS Cliente CSC', 'HES Cliente CSC', 'HES CLI USD', 'HES CLI PEN', 'HES CLI Fecha',
    'Estado CSC', 'Año/Mes Fac', 'Nro. Factura SAP', 'Monto Fact PEN', 'Monto Fact USD',
  ];

  const filaToArray = (f) => [
    f.codigoProyecto, f.nombreRequerimiento, f.periodo,
    f.numeroOc, f.estadoOc, f.ordenCo, f.solpedCompra, f.importeUsd, f.importePen,
    f.hesNumero, f.hesUsd, f.hesPen, f.hesFecha,
    f.codSapCliente, f.empresaRefacturable, f.importeRefPen, f.importeRefUsd,
    f.osClienteCsc, f.hesClienteCsc, f.hesCliUsd, f.hesCliPen, f.hesCliFecha,
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
    a.download = `reporte_membresias_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.info('CSV exportado correctamente');
  };

  // ── Exportar Excel ────────────────────────────────────
  const exportExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...filteredFilas.map(filaToArray)]);
    ws['!cols'] = HEADERS.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Membresías');
    XLSX.writeFile(wb, `reporte_membresias_${new Date().toISOString().slice(0,10)}.xlsx`);
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
        title="Reporte de pagos — Membresías"
        subTitle1="Gestión"
        subTitle2="Membresías"
        subText="Vista consolidada de OC proveedor, HES, OC cliente y facturación por membresía."
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
                      <svg width={14} height={14}><use href="/icons/sprite.svg#search"></use></svg>
                    </span>
                    <input type="text" className="form-control"
                      placeholder="Buscar proyecto, OC..."
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
                  <Form.Select size="sm" value={filterPeriodo} onChange={e => setFilterPeriodo(e.target.value)}>
                    <option value="">Todos los períodos</option>
                    {periodos.map(p => <option key={p} value={p}>{p}</option>)}
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
                <table className="table table-sm table-hover table-bordered" style={{ fontSize: 11, minWidth: 2800 }}>
                  <thead>
                    <tr>
                      <th colSpan={3} className="text-center" style={{ background: '#f3f4f6', color: '#374151', borderRight: '2px solid #d1d5db' }}>DATOS GENERALES</th>
                      <th colSpan={6} className="text-center" style={{ background: '#fff1f1', color: '#991b1b', borderRight: '2px solid #fca5a5' }}>OC PROVEEDOR</th>
                      <th colSpan={4} className="text-center" style={{ background: '#fee2e2', color: '#991b1b', borderRight: '2px solid #fca5a5' }}>HES PROVEEDOR</th>
                      <th colSpan={4} className="text-center" style={{ background: '#f3f4f6', color: '#374151', borderRight: '2px solid #d1d5db' }}>OC CLIENTE</th>
                      <th colSpan={5} className="text-center" style={{ background: '#dbeafe', color: '#1e40af', borderRight: '2px solid #93c5fd' }}>HES CLIENTE</th>
                      <th colSpan={5} className="text-center" style={{ background: '#eff6ff', color: '#1e40af' }}>FACTURACIÓN</th>
                    </tr>
                    <tr style={{ fontSize: 10 }}>
                      <th>Código Proyecto</th><th>Nombre Requerimiento</th><th style={{ borderRight: '2px solid #d1d5db' }}>Período</th>
                      <th>N° OC</th><th>Estado</th><th>Orden CO</th><th>Solped</th><th>Imp. USD</th><th style={{ borderRight: '2px solid #fca5a5' }}>Imp. PEN</th>
                      <th>N° HES</th><th>USD</th><th>PEN</th><th style={{ borderRight: '2px solid #fca5a5' }}>Fecha</th>
                      <th>Cod. SAP</th><th>Emp. Refacturable</th><th>Ref. PEN</th><th style={{ borderRight: '2px solid #d1d5db' }}>Ref. USD</th>
                      <th>OS Cliente CSC</th><th>HES Cliente CSC</th><th>USD</th><th>PEN</th><th style={{ borderRight: '2px solid #93c5fd' }}>Fecha</th>
                      <th>Estado CSC</th><th>Año/Mes</th><th>Nro. Factura SAP</th><th>Monto PEN</th><th>Monto USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFilas.length === 0 ? (
                      <tr><td colSpan={28} className="text-center text-muted py-4">No se encontraron registros</td></tr>
                    ) : filteredFilas.map((f, i) => (
                      <tr key={i}>
                        <td className="fw-semibold" style={{ color: '#185FA5' }}>{f.codigoProyecto}</td>
                        <td className="text-muted" style={{ fontSize: 10 }}>{f.nombreRequerimiento}</td>
                        <td className="font-monospace" style={{ borderRight: '2px solid #d1d5db' }}>{f.periodo}</td>
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
                        <td className="text-muted" style={{ borderRight: '2px solid #fca5a5' }}>{f.hesFecha}</td>
                        {/* OC Cliente */}
                        <td className="font-monospace" style={{ fontSize: 10 }}>{f.codSapCliente}</td>
                        <td className="text-muted" style={{ fontSize: 10 }}>{f.empresaRefacturable}</td>
                        <td>S/ {f.importeRefPen}</td>
                        <td style={{ borderRight: '2px solid #d1d5db' }}>$ {f.importeRefUsd}</td>
                        {/* HES Cliente */}
                        <td className="font-monospace" style={{ color: '#1e40af' }}>{f.osClienteCsc}</td>
                        <td className="font-monospace" style={{ color: '#1e40af' }}>{f.hesClienteCsc}</td>
                        <td>$ {f.hesCliUsd}</td>
                        <td>S/ {f.hesCliPen}</td>
                        <td className="text-muted" style={{ borderRight: '2px solid #93c5fd' }}>{f.hesCliFecha}</td>
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

export default ReporteMembresias;
