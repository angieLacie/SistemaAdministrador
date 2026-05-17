import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Spinner, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaKey, FaScissors, FaTableCells, FaTableList, FaXmark } from 'react-icons/fa6';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import SearchableSelect from '@/components/SearchableSelect';
import { tiendasApi } from '@/api/seguridad.api';

// ── Tarjeta individual ─────────────────────────────────────────────────────────
const EMPRESA_COLORS = {
  ADAMS:      { bg: '#dbeafe', color: '#1e40af' },
  EL:         { bg: '#dcfce7', color: '#166534' },
  ORIENTE:    { bg: '#fef3c7', color: '#92400e' },
  REMATE:     { bg: '#fce7f3', color: '#9d174d' },
  REMATE_ORI: { bg: '#ede9fe', color: '#5b21b6' },
};

function TiendaCard({ tienda, idx }) {
  const { descripcion, tiendaId, empresa, tiendaIP, linkLlave, linkSastreria } = tienda;
  const ec = EMPRESA_COLORS[empresa] || { bg: '#f3f4f6', color: '#374151' };

  return (
    <div style={{
      background: 'white', borderRadius: 14,
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      padding: '16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'box-shadow 0.2s, transform 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          background: ec.bg, color: ec.color,
          fontSize: 10, fontWeight: 700, padding: '2px 8px',
          borderRadius: 20, letterSpacing: 0.5, textTransform: 'uppercase',
        }}>
          {empresa}
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>#{tiendaId}</span>
      </div>

      {/* Nombre */}
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
          {descripcion || '—'}
        </p>
        {tiendaIP ? (
          <code style={{ fontSize: 11, color: '#6b7280', marginTop: 4, display: 'block' }}>{tiendaIP}</code>
        ) : (
          <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>Sin IP configurada</span>
        )}
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button
          disabled={!linkLlave}
          onClick={() => linkLlave && window.open(linkLlave, '_blank', 'noopener,noreferrer')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '7px 0', borderRadius: 8, border: 'none',
            background: linkLlave ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#f3f4f6',
            color: linkLlave ? 'white' : '#9ca3af',
            fontSize: 12, fontWeight: 700,
            cursor: linkLlave ? 'pointer' : 'not-allowed',
            boxShadow: linkLlave ? '0 3px 8px rgba(239,68,68,0.3)' : 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { if (linkLlave) e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          title={linkLlave || 'Sin IP'}
        >
          <FaKey size={11} /> Llave
        </button>
        <button
          disabled={!linkSastreria}
          onClick={() => linkSastreria && window.open(linkSastreria, '_blank', 'noopener,noreferrer')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '7px 0', borderRadius: 8, border: 'none',
            background: linkSastreria ? 'linear-gradient(135deg,#f59e0b,#d97706)' : '#f3f4f6',
            color: linkSastreria ? 'white' : '#9ca3af',
            fontSize: 12, fontWeight: 700,
            cursor: linkSastreria ? 'pointer' : 'not-allowed',
            boxShadow: linkSastreria ? '0 3px 8px rgba(245,158,11,0.3)' : 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { if (linkSastreria) e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          title={linkSastreria || 'Sin IP'}
        >
          <FaScissors size={11} /> Sastrería
        </button>
      </div>
    </div>
  );
}

// ── Vista tabla ────────────────────────────────────────────────────────────────
function TiendaRow({ tienda, idx }) {
  const { descripcion, tiendaId, empresa, tiendaIP, linkLlave, linkSastreria } = tienda;
  const ec = EMPRESA_COLORS[empresa] || { bg: '#f3f4f6', color: '#374151' };

  return (
    <tr style={{ fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
      <td style={{ padding: '10px 12px', color: '#9ca3af', width: 40 }}>{idx + 1}</td>
      <td style={{ padding: '10px 12px' }}>
        <span style={{ background: ec.bg, color: ec.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
          {empresa}
        </span>
      </td>
      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#374151' }}>{tiendaId}</td>
      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{descripcion || '—'}</td>
      <td style={{ padding: '10px 12px' }}>
        {tiendaIP
          ? <code style={{ fontSize: 12, color: '#374151' }}>{tiendaIP}</code>
          : <span style={{ fontSize: 12, color: '#ef4444' }}>Sin IP</span>}
      </td>
      <td style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button disabled={!linkLlave} onClick={() => linkLlave && window.open(linkLlave, '_blank', 'noopener,noreferrer')}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:6, border:'none',
              background: linkLlave?'#ef4444':'#e5e7eb', color: linkLlave?'white':'#9ca3af',
              fontSize:12, fontWeight:600, cursor: linkLlave?'pointer':'not-allowed' }}
            onMouseEnter={e => { if(linkLlave) e.currentTarget.style.opacity='0.8'; }}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}
          ><FaKey size={10}/> Llave</button>
          <button disabled={!linkSastreria} onClick={() => linkSastreria && window.open(linkSastreria, '_blank', 'noopener,noreferrer')}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:6, border:'none',
              background: linkSastreria?'#f59e0b':'#e5e7eb', color: linkSastreria?'white':'#9ca3af',
              fontSize:12, fontWeight:600, cursor: linkSastreria?'pointer':'not-allowed' }}
            onMouseEnter={e => { if(linkSastreria) e.currentTarget.style.opacity='0.8'; }}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}
          ><FaScissors size={10}/> Sastrería</button>
        </div>
      </td>
    </tr>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 24;

const SistemasTienda = () => {
  const [data, setData]         = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [buscar,  setBuscar]    = useState('');
  const [empresa, setEmpresa]   = useState('');
  const [vista,   setVista]     = useState('cards');
  const [page,    setPage]      = useState(0);

  useEffect(() => {
    tiendasApi.empresas().then(r => setEmpresas(Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    tiendasApi.listar({ empresa })
      .then(r => setData(Array.isArray(r) ? r : []))
      .catch(err => toast.error('Error: ' + err.message))
      .finally(() => setLoading(false));
  }, [empresa]);

  // Filtrado client-side por búsqueda
  const filtrado = useMemo(() => {
    if (!buscar.trim()) return data;
    const b = buscar.toLowerCase();
    return data.filter(t =>
      t.descripcion?.toLowerCase().includes(b) ||
      t.tiendaId?.toLowerCase().includes(b) ||
      t.tiendaIP?.toLowerCase().includes(b) ||
      t.empresa?.toLowerCase().includes(b)
    );
  }, [data, buscar]);

  // Paginación
  const totalPages = Math.ceil(filtrado.length / PAGE_SIZE);
  const pagActual  = Math.min(page, Math.max(0, totalPages - 1));
  const paginado   = filtrado.slice(pagActual * PAGE_SIZE, (pagActual + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [buscar, empresa]);

  const empresaOptions = empresas.map(e => ({ value: e.empresaId, label: `${e.razonSocial} (${e.empresaId})` }));

  return (
    <div className="content-wrapper">
      <PageBreadcrumb title="Sistemas Tienda" subTitle1="Infraestructura" subTitle2="Sistemas Tienda"
        subText="Acceso rápido a Nova (Llave) y Sastrería por tienda." />

      <div className="main-content">

        {/* KPIs */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>Total Tiendas</p>
                <h2 className="mb-1 fw-bold" style={{ color: '#185FA5', fontSize: 32 }}>{data.length}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 600 }}>{data.length}</Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>con IP activa</span>
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
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>Empresas</p>
                <h2 className="mb-1 fw-bold" style={{ color: '#7c3aed', fontSize: 32 }}>{empresas.length}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#ede9fe', color: '#5b21b6', fontSize: 10, fontWeight: 600 }}>{empresas.length}</Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>registradas</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={6} md={3}>
            <div className="card shadow-sm h-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body py-3 px-4">
                <p className="text-uppercase mb-2 fw-semibold" style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>Páginas</p>
                <h2 className="mb-1 fw-bold" style={{ color: '#16a34a', fontSize: 32 }}>{Math.ceil(filtrado.length / PAGE_SIZE) || 1}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 600 }}>{PAGE_SIZE} x pág</Badge>
                  <span className="text-muted" style={{ fontSize: 11 }}>resultados</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Toolbar */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2 px-3">
            <Row className="g-2 align-items-center">

              {/* Búsqueda libre */}
              <Col xs={12} md={4}>
                <div style={{ position: 'relative' }}>
                  <i className="ri-search-line" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:14 }} />
                  <input type="text" value={buscar}
                    onChange={e => setBuscar(e.target.value)}
                    placeholder="Buscar tienda, código, IP..."
                    style={{ width:'100%', padding:'7px 36px 7px 32px', border:'1.5px solid #dde1e7', borderRadius:8, fontSize:13, outline:'none', background:'white' }}
                    onFocus={e => e.target.style.borderColor='#185FA5'}
                    onBlur={e  => e.target.style.borderColor='#dde1e7'}
                  />
                  {buscar && (
                    <button onClick={() => setBuscar('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:2, display:'flex' }}>
                      <FaXmark size={12} />
                    </button>
                  )}
                </div>
              </Col>

              {/* Empresa */}
              <Col xs={12} md={4}>
                <SearchableSelect
                  options={empresaOptions}
                  value={empresa}
                  onChange={v => { setEmpresa(v); setPage(0); }}
                  placeholder="Filtrar por empresa..."
                />
              </Col>

              {/* Toggle vista */}
              <Col xs="auto" className="ms-auto">
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <span style={{ fontSize:12, color:'#6b7280', marginRight:4 }}>Vista:</span>
                  {[
                    { key:'cards', icon:<FaTableCells size={14}/>, label:'Tarjetas' },
                    { key:'tabla', icon:<FaTableList  size={14}/>, label:'Tabla' },
                  ].map(v => (
                    <button key={v.key} onClick={() => setVista(v.key)}
                      title={v.label}
                      style={{
                        display:'flex', alignItems:'center', gap:5,
                        padding:'6px 12px', borderRadius:7, border:'1.5px solid',
                        borderColor: vista===v.key ? '#185FA5' : '#e5e7eb',
                        background: vista===v.key ? '#eff6ff' : 'white',
                        color: vista===v.key ? '#185FA5' : '#6b7280',
                        fontSize:12, fontWeight:600, cursor:'pointer',
                        transition:'all 0.15s',
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
              <i className="ri-store-2-line" style={{ fontSize:40, opacity:0.3 }} />
              <p className="mt-2 mb-0">No se encontraron tiendas</p>
            </div>
          </div>
        ) : vista === 'cards' ? (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16 }}>
              {paginado.map((t, i) => <TiendaCard key={t.tiendaId} tienda={t} idx={pagActual * PAGE_SIZE + i} />)}
            </div>
          </>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0" style={{ fontSize:13 }}>
                  <thead style={{ background:'#f9fafb' }}>
                    <tr>
                      {['#','Empresa','Código','Tienda','IP','Acceso rápido'].map(h => (
                        <th key={h} style={{ padding:'10px 12px', fontWeight:600, fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.5, borderBottom:'1px solid #e5e7eb', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginado.map((t, i) => <TiendaRow key={t.tiendaId} tienda={t} idx={pagActual * PAGE_SIZE + i} />)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Paginación */}
        {filtrado.length > 0 && totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16, flexWrap:'wrap', gap:8 }}>
            <span style={{ fontSize:13, color:'#6b7280' }}>
              Mostrando {pagActual * PAGE_SIZE + 1}–{Math.min((pagActual+1)*PAGE_SIZE, filtrado.length)} de {filtrado.length} tiendas
            </span>
            <div style={{ display:'flex', gap:4 }}>
              <button onClick={() => setPage(0)} disabled={pagActual===0}
                style={{ padding:'5px 10px', borderRadius:6, border:'1px solid #e5e7eb', background:'white', cursor: pagActual===0?'default':'pointer', color: pagActual===0?'#d1d5db':'#374151', fontSize:12 }}>«</button>
              <button onClick={() => setPage(p => p-1)} disabled={pagActual===0}
                style={{ padding:'5px 10px', borderRadius:6, border:'1px solid #e5e7eb', background:'white', cursor: pagActual===0?'default':'pointer', color: pagActual===0?'#d1d5db':'#374151', fontSize:12 }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(i => Math.abs(i - pagActual) <= 2)
                .map(i => (
                  <button key={i} onClick={() => setPage(i)}
                    style={{ padding:'5px 11px', borderRadius:6, border:'1px solid', borderColor: i===pagActual?'#185FA5':'#e5e7eb',
                      background: i===pagActual?'#185FA5':'white', color: i===pagActual?'white':'#374151', fontWeight: i===pagActual?700:400, fontSize:12, cursor:'pointer' }}>
                    {i+1}
                  </button>
                ))}
              <button onClick={() => setPage(p => p+1)} disabled={pagActual===totalPages-1}
                style={{ padding:'5px 10px', borderRadius:6, border:'1px solid #e5e7eb', background:'white', cursor: pagActual===totalPages-1?'default':'pointer', color: pagActual===totalPages-1?'#d1d5db':'#374151', fontSize:12 }}>›</button>
              <button onClick={() => setPage(totalPages-1)} disabled={pagActual===totalPages-1}
                style={{ padding:'5px 10px', borderRadius:6, border:'1px solid #e5e7eb', background:'white', cursor: pagActual===totalPages-1?'default':'pointer', color: pagActual===totalPages-1?'#d1d5db':'#374151', fontSize:12 }}>»</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SistemasTienda;
