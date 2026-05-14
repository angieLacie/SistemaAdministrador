import { useState, useEffect } from 'react';
import { Row, Col, Badge, Spinner, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  FaTriangleExclamation, FaClock, FaCircleXmark,
  FaHammer, FaFileInvoiceDollar, FaChartPie
} from 'react-icons/fa6';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import { proyectosService } from '@/services/proyectos.service';

const KpiCard = ({ titulo, valor, subtitulo, color = '#185FA5', bg = '#E6F1FB' }) => (
  <div className="card border-0 h-100" style={{ background: bg, borderRadius: 8 }}>
    <div className="card-body py-3">
      <p style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{titulo}</p>
      <h3 style={{ fontSize: 28, fontWeight: 500, color, marginBottom: 2 }}>{valor?.toLocaleString() ?? 0}</h3>
      {subtitulo && <p style={{ fontSize: 11, color, opacity: 0.7, marginBottom: 0 }}>{subtitulo}</p>}
    </div>
  </div>
);

const AlertaCard = ({ titulo, icono, color, bg, items, columnas, onVerDetalle }) => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-header py-2 d-flex align-items-center justify-content-between"
      style={{ background: bg, borderBottom: `1px solid ${color}33` }}>
      <div className="d-flex align-items-center gap-2">
        <span style={{ color, fontSize: 14 }}>{icono}</span>
        <span className="fw-semibold small" style={{ color }}>{titulo}</span>
        <Badge style={{ background: color, fontSize: 10 }}>{items?.length ?? 0}</Badge>
      </div>
    </div>
    <div className="card-body p-0">
      {!items?.length ? (
        <p className="text-muted text-center py-3" style={{ fontSize: 12 }}>Sin alertas</p>
      ) : (
        <table className="table table-sm table-hover mb-0" style={{ fontSize: 11 }}>
          <thead className="table-light">
            <tr>
              {columnas.map(c => <th key={c.key}>{c.label}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 5).map((item, i) => (
              <tr key={i}>
                {columnas.map(c => (
                  <td key={c.key} style={c.style ?? {}}>
                    {c.render ? c.render(item) : item[c.key] ?? '—'}
                  </td>
                ))}
                <td>
                  <Button size="sm" variant="outline-secondary" style={{ fontSize: 10, padding: '1px 6px' }}
                    onClick={() => onVerDetalle(item.codProy)}>
                    Ver →
                  </Button>
                </td>
              </tr>
            ))}
            {items.length > 5 && (
              <tr>
                <td colSpan={columnas.length + 1} className="text-center text-muted" style={{ fontSize: 11 }}>
                  +{items.length - 5} más...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

const DashboardProyectos = () => {
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await proyectosService.dashboard();
        setData(res);
      } catch (err) {
        toast.error('Error al cargar dashboard: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) return (
    <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  const { kpis, alertas } = data ?? {};

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Dashboard de Proyectos"
        subTitle1="Proyectos"
        subTitle2="Dashboard"
        subText="Resumen y alertas del estado actual de proyectos."
      />

      <div className="main-content">

        {/* KPIs */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={2}>
            <KpiCard titulo="Total proyectos" valor={kpis?.total}
              color="#185FA5" bg="#E6F1FB" />
          </Col>
          <Col xs={6} md={2}>
            <KpiCard titulo="Activos" valor={kpis?.activos}
              color="#3B6D11" bg="#EAF3DE" />
          </Col>
          <Col xs={6} md={2}>
            <KpiCard titulo="En construcción" valor={kpis?.enConstruccion}
              color="#BA7517" bg="#FAEEDA" />
          </Col>
          <Col xs={6} md={2}>
            <KpiCard titulo="Cerrados" valor={kpis?.cerrados}
              color="#5F5E5A" bg="#F1EFE8" />
          </Col>
          <Col xs={6} md={2}>
            <KpiCard titulo="Anulados" valor={kpis?.anulados}
              color="#A32D2D" bg="#FCEBEB" />
          </Col>
          <Col xs={6} md={2}>
            <KpiCard titulo="Monto total"
              valor={`S/ ${Number(kpis?.montoTotal ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 0 })}`}
              subtitulo="PEN"
              color="#3B6D11" bg="#EAF3DE" />
          </Col>
        </Row>

        {/* Resumen por estado y analista */}
        <Row className="mb-4 g-3">
          <Col md={6}>
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted fw-semibold small text-uppercase mb-3" style={{ fontSize: 11 }}>
                  <FaChartPie size={12} className="me-1" /> Proyectos por estado
                </p>
                {kpis?.porEstado?.map((e, i) => {
                  const max = kpis.porEstado[0]?.total ?? 1;
                  return (
                    <div key={i} className="d-flex align-items-center gap-2 mb-2">
                      <div style={{ fontSize: 11, color: 'var(--color-text-primary)', minWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.estado}
                      </div>
                      <div style={{ flex: 1, background: 'var(--color-background-secondary)', borderRadius: 4, height: 8 }}>
                        <div style={{ width: `${(e.total / max) * 100}%`, height: 8, background: '#185FA5', borderRadius: 4 }}></div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500, minWidth: 24, textAlign: 'right' }}>{e.total}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted fw-semibold small text-uppercase mb-3" style={{ fontSize: 11 }}>
                  Top analistas — proyectos activos
                </p>
                {kpis?.porAnalista?.map((a, i) => {
                  const max = kpis.porAnalista[0]?.total ?? 1;
                  return (
                    <div key={i} className="d-flex align-items-center gap-2 mb-2">
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: '#185FA5', flexShrink: 0 }}>
                        {a.analista[0]?.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.analista}
                      </div>
                      <div style={{ flex: 1, background: 'var(--color-background-secondary)', borderRadius: 4, height: 8 }}>
                        <div style={{ width: `${(a.total / max) * 100}%`, height: 8, background: '#3B6D11', borderRadius: 4 }}></div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500, minWidth: 24, textAlign: 'right' }}>{a.total}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>

        {/* Resumen alertas */}
        {alertas?.totalAlertas > 0 && (
          <div className="card border-0 mb-4" style={{ background: '#FCEBEB', borderRadius: 8 }}>
            <div className="card-body py-2 d-flex align-items-center gap-3">
              <FaTriangleExclamation size={18} style={{ color: '#A32D2D' }} />
              <span className="fw-semibold" style={{ color: '#A32D2D', fontSize: 13 }}>
                {alertas.totalAlertas} alerta{alertas.totalAlertas !== 1 ? 's' : ''} detectada{alertas.totalAlertas !== 1 ? 's' : ''} — revisar los proyectos indicados a continuación
              </span>
            </div>
          </div>
        )}

        {/* Alertas */}
        <Row className="g-3 mb-4">
          <Col md={6}>
            <AlertaCard
              titulo="Sin cronograma definido"
              icono={<FaClock />}
              color="#BA7517"
              bg="#FFFBEB"
              items={alertas?.sinCronograma}
              columnas={[
                { key: 'codProy', label: 'Código', style: { fontFamily: 'monospace', color: '#185FA5', fontWeight: 500 } },
                { key: 'nombreRequerimiento', label: 'Nombre', style: { fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                { key: 'analista', label: 'Analista' },
              ]}
              onVerDetalle={(id) => navigate(`/proyectos/${id}`)}
            />
          </Col>
          <Col md={6}>
            <AlertaCard
              titulo="En construcción sin horas"
              icono={<FaHammer />}
              color="#A32D2D"
              bg="#FCEBEB"
              items={alertas?.enConstrSinHoras}
              columnas={[
                { key: 'codProy', label: 'Código', style: { fontFamily: 'monospace', color: '#185FA5', fontWeight: 500 } },
                { key: 'nombreRequerimiento', label: 'Nombre', style: { fontSize: 11 } },
                { key: 'analista', label: 'Analista' },
              ]}
              onVerDetalle={(id) => navigate(`/proyectos/${id}`)}
            />
          </Col>
        </Row>

        <Row className="g-3 mb-4">
          <Col md={6}>
            <AlertaCard
              titulo="En construcción sin OC proveedor"
              icono={<FaCircleXmark />}
              color="#A32D2D"
              bg="#FCEBEB"
              items={alertas?.sinOCProveedor}
              columnas={[
                { key: 'codProy', label: 'Código', style: { fontFamily: 'monospace', color: '#185FA5', fontWeight: 500 } },
                { key: 'nombreRequerimiento', label: 'Nombre', style: { fontSize: 11 } },
                { key: 'analista', label: 'Analista' },
              ]}
              onVerDetalle={(id) => navigate(`/proyectos/${id}`)}
            />
          </Col>
          <Col md={6}>
            <AlertaCard
              titulo="Con HES pendiente de factura"
              icono={<FaFileInvoiceDollar />}
              color="#BA7517"
              bg="#FFFBEB"
              items={alertas?.conHesPendiente}
              columnas={[
                { key: 'codProy', label: 'Código', style: { fontFamily: 'monospace', color: '#185FA5', fontWeight: 500 } },
                { key: 'nombreRequerimiento', label: 'Nombre', style: { fontSize: 11 } },
                { key: 'totalHESPendientes', label: 'HES', render: (item) => (
                  <Badge style={{ background: '#BA7517', fontSize: 10 }}>{item.totalHESPendientes}</Badge>
                )},
              ]}
              onVerDetalle={(id) => navigate(`/proyectos/${id}`)}
            />
          </Col>
        </Row>

        {/* Próximos a vencer */}
        <div className="card border-0 shadow-sm">
          <div className="card-header py-2 d-flex align-items-center gap-2"
            style={{ background: '#E6F1FB', borderBottom: '1px solid #bfdbfe' }}>
            <FaClock size={12} style={{ color: '#185FA5' }} />
            <span className="fw-semibold small" style={{ color: '#185FA5' }}>
              Próximos a vencer — 30 días
            </span>
            <Badge style={{ background: '#185FA5', fontSize: 10 }}>{alertas?.proximosVencer?.length ?? 0}</Badge>
          </div>
          <div className="card-body p-0">
            {!alertas?.proximosVencer?.length ? (
              <p className="text-muted text-center py-3" style={{ fontSize: 12 }}>Sin proyectos próximos a vencer</p>
            ) : (
              <table className="table table-sm table-hover mb-0" style={{ fontSize: 11 }}>
                <thead className="table-light">
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Analista</th>
                    <th>Estado</th>
                    <th>F. Entrega</th>
                    <th>Días restantes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.proximosVencer.map((p, i) => (
                    <tr key={i}>
                      <td className="font-monospace fw-semibold" style={{ color: '#185FA5' }}>{p.codProy}</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombreRequerimiento ?? '—'}</td>
                      <td>{p.analista ?? '—'}</td>
                      <td><span style={{ fontSize: 10 }}>{p.estado ?? '—'}</span></td>
                      <td className="font-monospace">{p.fEntregaFinal ? new Date(p.fEntregaFinal).toLocaleDateString('es-PE') : '—'}</td>
                      <td>
                        <Badge style={{
                          background: p.diasRestantes <= 7 ? '#A32D2D' : p.diasRestantes <= 15 ? '#BA7517' : '#185FA5',
                          fontSize: 10
                        }}>
                          {p.diasRestantes} días
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-secondary" style={{ fontSize: 10, padding: '1px 6px' }}
                          onClick={() => navigate(`/proyectos/${p.codProy}`)}>
                          Ver →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardProyectos;