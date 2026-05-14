import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAccesos } from '@/context/AccesosContext';
import { authService } from '@/services/auth.service';

const rutasLibres = [
  '/',
  '/dashboards/control-center',
  '/user-profile',
  '/404',
  '/blank-page',
  '/monitor/tamano-bd',
  '/monitor/integracion-envios',
];

const RouteGuard = ({ children }) => {
  const location = useLocation();
  const { tieneAcceso, loading } = useAccesos();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Timeout de seguridad: si loading tarda más de 5s, forzar redirección
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoadingTimeout(true), 5000);
    return () => clearTimeout(t);
  }, [loading]);

  // Si no está autenticado → login
  if (!authService.isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  // Loading con timeout de seguridad
  if (loading) {
    if (loadingTimeout) return <Navigate to="/auth/login" replace />;
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  // Si está autenticado pero no tiene acceso → 404
  if (!rutasLibres.includes(location.pathname) && !tieneAcceso(location.pathname)) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default RouteGuard;