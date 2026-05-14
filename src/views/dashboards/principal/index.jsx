import { useState, useEffect, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAccesos } from '@/context/AccesosContext';
import {
  FaDatabase, FaAward, FaChartPie, FaShield,
  FaBriefcase, FaGear, FaTriangleExclamation, FaUser,
  FaStore, FaChartBar, FaServer, FaCloud, FaSliders, FaBell,
} from 'react-icons/fa6';

// Mapa de secciones: cada una agrupa varias rutas bajo un mismo módulo
const SECCIONES = [
  {
    key: 'licencias',
    label: 'Licencias',
    url: '/licencias',
    icon: FaDatabase,
    color: '#185FA5', bg: '#E6F1FB',
    rutas: ['/licencias', '/licencias/reporte'],
  },
  {
    key: 'licencias-tienda',
    label: 'Licencias Tiendas',
    url: '/licencias-tienda',
    icon: FaStore,
    color: '#1a7fd4', bg: '#dbeafe',
    rutas: ['/licencias-tienda'],
  },
  {
    key: 'membresias',
    label: 'Membresías',
    url: '/membresias',
    icon: FaAward,
    color: '#3B6D11', bg: '#EAF3DE',
    rutas: ['/membresias', '/membresias/reporte'],
  },
  {
    key: 'c4sales',
    label: 'C4 Sales',
    url: '/c4sales',
    icon: FaChartBar,
    color: '#0891b2', bg: '#cffafe',
    rutas: ['/c4sales'],
  },
  {
    key: 'proyectos',
    label: 'Proyectos',
    url: '/proyectos',
    icon: FaBriefcase,
    color: '#BA7517', bg: '#FAEEDA',
    rutas: ['/proyectos', '/proyectos/dashboard'],
  },
  {
    key: 'infraestructura',
    label: 'Infraestructura',
    url: '/infraestructura',
    icon: FaServer,
    color: '#6d28d9', bg: '#ede9fe',
    rutas: ['/infraestructura'],
  },
  {
    key: 'precio-cero',
    label: 'Precio Cero',
    url: '/monitor/precio-cero',
    icon: FaChartPie,
    color: '#185FA5', bg: '#E6F1FB',
    rutas: ['/monitor/precio-cero'],
  },
  {
    key: 'interfaz',
    label: 'Interfaces',
    url: '/monitor/interfaz',
    icon: FaTriangleExclamation,
    color: '#A32D2D', bg: '#FCEBEB',
    rutas: ['/monitor/interfaz'],
  },
  {
    key: 'tamano-bd',
    label: 'Tamaño BD',
    url: '/monitor/tamano-bd',
    icon: FaDatabase,
    color: '#5F5E5A', bg: '#F1EFE8',
    rutas: ['/monitor/tamano-bd'],
  },
  {
    key: 'integracion',
    label: 'Integración Envíos',
    url: '/monitor/integracion-envios',
    icon: FaCloud,
    color: '#0891b2', bg: '#e0f2fe',
    rutas: ['/monitor/integracion-envios'],
  },
  {
    key: 'jobs',
    label: 'Jobs',
    url: '/jobs',
    icon: FaGear,
    color: '#3B6D11', bg: '#EAF3DE',
    rutas: ['/jobs'],
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    url: '/usuarios',
    icon: FaUser,
    color: '#5F5E5A', bg: '#F1EFE8',
    rutas: ['/usuarios', '/perfiles', '/perfil-tienda', '/empleados'],
  },
  {
    key: 'accesos',
    label: 'Accesos',
    url: '/accesos/perfil',
    icon: FaShield,
    color: '#185FA5', bg: '#E6F1FB',
    rutas: ['/accesos/perfil', '/accesos/gestion'],
  },
  {
    key: 'parametros',
    label: 'Parámetros',
    url: '/parametros/llave',
    icon: FaSliders,
    color: '#BA7517', bg: '#FAEEDA',
    rutas: ['/parametros/llave'],
  },
  {
    key: 'notificaciones',
    label: 'Notificaciones',
    url: '/notificaciones',
    icon: FaBell,
    color: '#0891b2', bg: '#e0f2fe',
    rutas: ['/notificaciones'],
  },
];

const DashboardPrincipal = () => {
  const navigate  = useNavigate();
  const usuario   = authService.getUsuario();
  const { accesos } = useAccesos();
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const saludo = () => {
    const h = hora.getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Filtra las secciones según los accesos reales del usuario
  const cards = useMemo(() => {
    const rutasUsuario = new Set((accesos || []).map(a => a.ruta).filter(Boolean));
    return SECCIONES.filter(s => s.rutas.some(r => rutasUsuario.has(r)));
  }, [accesos]);

  return (
    <div className="content-wrapper">
      <div className="main-content">

        {/* Header bienvenida */}
        <div className="card border-0 mb-4" style={{
          background: 'linear-gradient(135deg, #0f2744 0%, #185FA5 100%)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div className="card-body py-4 px-4">
            <Row className="align-items-center">
              <Col>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>
                  {hora.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 4 }}>
                  {saludo()}, {usuario?.nombreUsuario ?? usuario?.usuarioId} 👋
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 0 }}>
                  Perfil: <strong style={{ color: 'white' }}>{usuario?.perfilDesc ?? '—'}</strong>
                </p>
              </Col>
              <Col xs="auto" className="d-none d-md-block">
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 }}>Hora actual</p>
                  <h2 style={{ color: 'white', fontWeight: 700, fontFamily: 'monospace', marginBottom: 0 }}>
                    {hora.toLocaleTimeString('es-PE')}
                  </h2>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Accesos del usuario */}
        {cards.length > 0 ? (
          <>
            <p className="fw-semibold small text-uppercase mb-3" style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1 }}>
              Mis accesos ({cards.length})
            </p>
            <Row className="g-3 mb-4">
              {cards.map((item) => {
                const Icon = item.icon;
                return (
                  <Col key={item.key} xs={6} sm={4} md={3}>
                    <div
                      className="card border-0 shadow-sm h-100"
                      style={{ cursor: 'pointer', borderRadius: 14, transition: 'transform 0.15s, box-shadow 0.15s' }}
                      onClick={() => navigate(item.url)}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <div className="card-body text-center py-4">
                        <div style={{
                          width: 54, height: 54, borderRadius: 16,
                          background: item.bg, color: item.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 22, margin: '0 auto 12px',
                        }}>
                          <Icon />
                        </div>
                        <p className="mb-0 fw-semibold" style={{ fontSize: 13, color: '#374151' }}>
                          {item.label}
                        </p>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </>
        ) : (
          <div className="card border-0 shadow-sm text-center py-5">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>
              No tienes módulos asignados. Contacta al administrador del sistema.
            </p>
          </div>
        )}

        {/* Footer sesión */}
        <div className="card border-0 shadow-sm">
          <div className="card-body py-3 px-4">
            <div className="d-flex align-items-center gap-3">
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: '#E6F1FB', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaShield size={16} style={{ color: '#185FA5' }} />
              </div>
              <div>
                <p className="mb-0 fw-semibold" style={{ fontSize: 13 }}>Sistema Administrativo</p>
                <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                  Usuario: <strong>{usuario?.usuarioId}</strong> — Sesión activa y segura
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPrincipal;
