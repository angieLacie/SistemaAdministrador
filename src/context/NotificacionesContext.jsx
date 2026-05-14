import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { tamanoBaseDatosApi } from '@/api/monitor.api';

const WARN_GB = 7;
const CRIT_GB = 9;
const POLL_MS = 5 * 60 * 1000; // 5 minutos

const NotificacionesContext = createContext(null);

export const NotificacionesProvider = ({ children }) => {
  const [alertasBD, setAlertasBD] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const timerRef = useRef(null);

  const fetchAlertas = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await tamanoBaseDatosApi.ultimos();
      if (!Array.isArray(datos)) return;

      const alertas = datos
        .filter(r => r.tamanoTotalGB >= WARN_GB)
        .sort((a, b) => b.tamanoTotalGB - a.tamanoTotalGB)
        .map(r => ({
          id: r.id,
          tiendaId: r.tiendaId,
          tiendaNombre: r.tiendaNombre,
          nombreBaseDatos: r.nombreBaseDatos,
          tamanoTotalGB: r.tamanoTotalGB,
          nivel: r.tamanoTotalGB >= CRIT_GB ? 'CRÍTICO' : 'ALERTA',
          fechaRegistro: r.fechaRegistro,
        }));

      setAlertasBD(alertas);
      setUltimaActualizacion(new Date());
    } catch (_) {
      // sin conexión — mantener datos anteriores
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    fetchAlertas();
    timerRef.current = setInterval(fetchAlertas, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchAlertas]);

  const totalCriticas = alertasBD.filter(a => a.nivel === 'CRÍTICO').length;
  const totalAlertas  = alertasBD.length;

  return (
    <NotificacionesContext.Provider value={{ alertasBD, totalCriticas, totalAlertas, ultimaActualizacion, cargando, refetch: fetchAlertas }}>
      {children}
    </NotificacionesContext.Provider>
  );
};

export const useNotificaciones = () => {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider');
  return ctx;
};
