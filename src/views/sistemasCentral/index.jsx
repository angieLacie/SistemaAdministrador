import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Spinner, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaArrowUpRightFromSquare, FaTableCells, FaTableList, FaXmark } from 'react-icons/fa6';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import SearchableSelect from '@/components/SearchableSelect';
import { sistemasSatelitesApi } from '@/api/monitor.api';

// ── Colores por tipo ─────────────────────────────────────────────────────────
const TIPO_COLORS = {
  RETAIL:     { bg: '#dbeafe', color: '#1e40af' },
  INDUSTRIAL: { bg: '#dcfce7', color: '#166534' },
  SAP:        { bg: '#fef3c7', color: '#92400e' },
  CORPORATIVO:{ bg: '#ede9fe', color: '#5b21b6' },
};
const getTipoColor = (tipo) =>
  TIPO_COLORS[tipo?.toUpperCase()] || { bg: '#f3f4f6', color: '#374151' };

// ── Tarjeta ──────────────────────────────────────────────────────────────────
function SistemaCard({ sistema }) {
  const { descripcion, link, tipo_Sistema } = sistema;
  const ec = getTipoColor(tipo_Sistema);
  const hasLink = link && link.trim() !== '';

  return (
    <div style={{
      background: 'white', borderRadius: 14,
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      padding: '18px 16px',
      display: 'flex', flexDirection: 'column', gap: 12,
      transition: 'box-shadow 0.2s, transform 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Tipo badge */}
      <span style={{
        display: 'inline-block', alignSelf: 'flex-start',
        background: ec.bg, color: ec.color,
        fontSize: 10, fontWeight: 700, padding: '2px 8px',
        borderRadius: 20, letterSpacing: 0.5, textTransform: 'uppercase',
      }}>
        {tipo_Sistema || 'GENERAL'}
      </span>

      {/* Nombre */}
      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4, flex: 1 }}>
        {descripcion || '—'}
      </p>

      {/* Link preview */}
      {hasLink && (
        <code style={{ fontSize: 10, color: '#6b7280', wordBreak: 'break-all', lineHeight: 1.4 }}>
          {link}
        </code>
      )}

      {/* Botón */}
      <button
        disabled={!hasLink}
        onClick={() => hasLink && window.open(link, '_blank', 'noopener,noreferrer')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px 0', borderRadius: 8, border: 'none',
          background: hasLink ? 'linear-gradient(135deg,#185FA5,#1a6cbf)' : '#f3f4f6',
          color: hasLink ? 'white' : '#9ca3af',
          fontSize: 13, fontWeight: 700,
          cursor: hasLink ? 'pointer' : 'not-allowed',
          boxShadow: hasLink ? '0 3px 8px rgba(24,95,165,0.3)' : 'none',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { if (hasLink) e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        title={link || 'Sin enlace'}
      >
        <FaArrowUpRightFromSquare size={11} /> Abrir
      </button>
    </div>
  );
}

// ── Fila tabla ───────────────────────────────────────────────────────────────
function SistemaRow({ sistema, idx }) {
  const { descripcion, link, tipo_Sistema } = sistema;
  const ec = getTipoColor(tipo_Sistema);
  const hasLink = link && link.trim() !== '';

  return (
    <tr style={{ fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
      <td style={{ padding: '10px 12px', color: '#9ca3af', width: 40 }}>{idx + 1}</td>
      <td style={{ padding: '10px 12px' }}>
        <span style={{ background: ec.bg, color: ec.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
          {tipo_Sistema || 'GENERAL'}
        </span>
      </td>
      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#374151' }}>{descripcion || '—'}</td>
      <td style={{ padding: '10px 12px', maxWidth: 360 }}>
        {hasLink
          ? <code style={{ fontSize: 11, color: '#6b7280', wordBreak: 'break-all' }}>{link}</code>
          : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
      </td>
      <td style={{ padding: '10px 12px' }}>
        <button
          disabled={!hasLink}
          onClick={() => hasLink && window.open(link, '_blank', 'noopener,noreferrer')}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 14px', borderRadius: 6, border: 'none',
            background: hasLink ? '#185FA5' : '#e5e7eb',
            color: hasLink ? 'white' : '#9ca3af',
            fontSize: 12, fontWeight: 600,
            cursor: hasLink ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => { if (hasLink) e.currentTarget.style.opacity = '0.8'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          <FaArrowUpRightFromSquare size={10} /> Abrir
        </button>
      </td>
    </tr>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 24;

const SistemasCentral = () => {
  const [data,    setData]    = useState([]);
  const [tipos,   setTipos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar,  setBuscar]  = useState('');
  const [tipo,    setTipo]    = useState('');
  const [vista,   setVista]   = useState('cards');
  const [page,    setPage]    = useState(0);

  // Cargar tipos al montar
  useEffect(() => {
    sistemasSatelitesApi.tipos().then(r => setTipos(Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  // Cargar sistemas cuando cambia tipo
  useEffect(() => {
    setLoading(true);
    sistemasSatelitesApi.listar({ tipo })
      .then(r => setData(Array.isArray(r) ? r : []))
      .catch(err => toast.error('Error cargando sistemas: ' + err.message))
      .finally(() => setLoading(false));
  }, [tipo]);

  // Filtrado client-side por búsqueda
  const filtrado = useMemo(() => {
    if (!buscar.trim()) return data;
    const b = buscar.toLowerCase();
    return data.filter(s =>
      s.descripcion?.toLowerCase().includes(b) ||
      s.tipo_Sistema?.toLowerCase().includes(b) ||
      s.link?.toLowerCase().includes(b)
    );
  }, [data, buscar]);

  // Paginación
  const totalPages = Math.ceil(filtrado.length / PAGE_SIZE);
  const pagActual  = Math.min(page, Math.max(0, totalPages - 1));
  const paginado   = filtrado.slice(pagActual * PAGE_SIZE, (pagActual + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [buscar, tipo]);

  const tipoOptions = tipos.map(t => ({ value: t, label: t }));

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Sistemas Central"
        subTitle1="Infraestructura"
        subTitle2="Sistemas Central"
        subText="Acceso rápido a los sistemas satélites de la empresa."
      />

      <div className="main-content">

        {/* KPIs */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>Total Sistemas</p>
                <h2 className="mb-1 fw-bold" style={{ color: '#185FA5', fontSize: 32 }}>{data.length}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 600 }}>{data.length}</Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>registrados</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>Mostrando</p>
                <h2 className="mb-1 fw-bold" style={{ color: '#0891b2', fontSize: 32 }}>{filtrado.length}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: 10, fontWeight: 600 }}>
                    {data.length > 0 ? Math.round((filtrado.length / data.length) * 100) : 0}%
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>del total</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>Tipos</p>
                <h2 className="mb-1 fw-bold" style={{ color: '#7c3aed', fontSize: 32 }}>{tipos.length}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#ede9fe', color: '#5b21b6', fontSize: 10, fontWeight: 600 }}>{tipos.length}</Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>categorías</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>Con Enlace</p>
                <h2 className="mb-1 fw-bold" style={{ color: '#16a34a', fontSize: 32 }}>{data.filter(s => s.link?.trim()).length}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 600 }}>
                    {data.length > 0 ? Math.round((data.filter(s => s.link?.trim()).length / data.length) * 100) : 0}%
                  </Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>disponibles</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Toolbar */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2 px-3">
            <Row className="g-2 align-items-center">

              {/* Búsqueda */}
              <Col xs={12} md={4}>
                <div style={{ position: 'relative' }}>
                  <i className="ri-search-line" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }} />
                  <input
                    type="text" value={buscar}
                    onChange={e => setBuscar(e.target.value)}
                    placeholder="Buscar sistema, enlace..."
                    style={{ width: '100%', padding: '7px 36px 7px 32px', border: '1.5px solid #dde1e7', borderRadius: 8, fontSize: 13, outline: 'none', background: 'white' }}
                    onFocus={e => e.target.style.borderColor = '#185FA5'}
                    onBlur={e  => e.target.style.borderColor = '#dde1e7'}
                  />
                  {buscar && (
                    <button onClick={() => setBuscar('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, display: 'flex' }}>
                      <FaXmark size={12} />
                    </button>
                  )}
                </div>
              </Col>

              {/* Tipo */}
              <Col xs={12} md={4}>
                <SearchableSelect
                  options={tipoOptions}
                  value={tipo}
                  onChange={v => { setTipo(v); setPage(0); }}
                  placeholder="Filtrar por tipo..."
                />
              </Col>

              {/* Toggle vista */}
              <Col xs="auto" className="ms-auto">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#6b7280', marginRight: 4 }}>Vista:</span>
                  {[
                    { key: 'cards', icon: <FaTableCells size={14} />, label: 'Tarjetas' },
                    { key: 'tabla', icon: <FaTableList  size={14} />, label: 'Tabla' },
                  ].map(v => (
                    <button key={v.key} onClick={() => setVista(v.key)} title={v.label}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 7, border: '1.5px solid',
                        borderColor: vista === v.key ? '#185FA5' : '#e5e7eb',
                        background: vista === v.key ? '#eff6ff' : 'white',
                        color: vista === v.key ? '#185FA5' : '#6b7280',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}>
                      {v.icon} {v.label}
                    </button>
                  ))}
                </div>
              </Col>

            </Row>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : filtrado.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5 text-muted">
              <i className="ri-global-line" style={{ fontSize: 40, opacity: 0.3 }} />
              <p className="mt-2 mb-0">No se encontraron sistemas</p>
            </div>
          </div>
        ) : vista === 'cards' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {paginado.map(s => <SistemaCard key={s.id} sistema={s} />)}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ background: '#f9fafb' }}>
                    <tr>
                      {['#', 'Tipo', 'Sistema', 'Enlace', 'Acción'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginado.map((s, i) => <SistemaRow key={s.id} sistema={s} idx={pagActual * PAGE_SIZE + i} />)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Paginación */}
        {filtrado.length > 0 && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Mostrando {pagActual * PAGE_SIZE + 1}–{Math.min((pagActual + 1) * PAGE_SIZE, filtrado.length)} de {filtrado.length} sistemas
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPage(0)} disabled={pagActual === 0}
                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: pagActual === 0 ? 'default' : 'pointer', color: pagActual === 0 ? '#d1d5db' : '#374151', fontSize: 12 }}>«</button>
              <button onClick={() => setPage(p => p - 1)} disabled={pagActual === 0}
                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: pagActual === 0 ? 'default' : 'pointer', color: pagActual === 0 ? '#d1d5db' : '#374151', fontSize: 12 }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(i => Math.abs(i - pagActual) <= 2)
                .map(i => (
                  <button key={i} onClick={() => setPage(i)}
                    style={{ padding: '5px 11px', borderRadius: 6, border: '1px solid', borderColor: i === pagActual ? '#185FA5' : '#e5e7eb', background: i === pagActual ? '#185FA5' : 'white', color: i === pagActual ? 'white' : '#374151', fontWeight: i === pagActual ? 700 : 400, fontSize: 12, cursor: 'pointer' }}>
                    {i + 1}
                  </button>
                ))}
              <button onClick={() => setPage(p => p + 1)} disabled={pagActual === totalPages - 1}
                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: pagActual === totalPages - 1 ? 'default' : 'pointer', color: pagActual === totalPages - 1 ? '#d1d5db' : '#374151', fontSize: 12 }}>›</button>
              <button onClick={() => setPage(totalPages - 1)} disabled={pagActual === totalPages - 1}
                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: pagActual === totalPages - 1 ? 'default' : 'pointer', color: pagActual === totalPages - 1 ? '#d1d5db' : '#374151', fontSize: 12 }}>»</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SistemasCentral;
