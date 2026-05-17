import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { accesosPerfilService } from '@/services/seguridad.service';

const SISTEMA_ID = import.meta.env.VITE_SISTEMA_ID || "ADM000";

const rutas_validas = [
  '/licencias', '/licencias/reporte',
  '/membresias', '/membresias/reporte',
  '/c4sales', '/jobs',
  '/usuarios', '/perfiles', '/perfil-tienda', '/empleados',
  '/accesos/perfil', '/accesos/gestion',
  '/monitor/precio-cero', '/monitor/interfaz',
  '/proyectos', '/proyectos/dashboard',
  '/licencias-tienda',
  '/dashboards/principal',
  '/notificaciones',
  '/sistemas-tienda',
  '/sistemas-central',
  '/infraestructura',
  '/parametros/llave',
  '/perfil-vista',
  '/monitor/tamano-bd',
  '/monitor/facturacion',
  '/monitor/integracion-envios',
  '/monitor/indicadores',
  '/dashboards/sincronizacion',
];

const AccesosContext = createContext(null);

export const AccesosProvider = ({ children }) => {
  const [accesos, setAccesos]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [rutaInicial, setRutaInicial] = useState('/dashboards/principal');

  useEffect(() => {
    const cargar = async () => {
      try {
        const usuario = authService.getUsuario();
        if (!usuario?.perfilId) { setLoading(false); return; }
        const data = await accesosPerfilService.misAccesos(usuario.perfilId, SISTEMA_ID);
        const lista = Array.isArray(data) ? data : [];
        setAccesos(lista);
        const primera = lista.find(a => a.ruta && rutas_validas.includes(a.ruta))?.ruta ?? '/dashboards/principal';
        setRutaInicial(primera);
      } catch (err) {
        console.error('Error cargando accesos:', err);
        // Si fue un 401, handleUnauthorized ya redirigió; si fue otro error,
        // dejamos accesos vacío para que RouteGuard redirija al login
        if (!authService.isAuthenticated()) {
          window.location.replace('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const recargarAccesos = async () => {
    try {
      const usuario = authService.getUsuario();
      if (!usuario?.perfilId) return '/dashboards/principal';
      const data = await accesosPerfilService.misAccesos(usuario.perfilId, SISTEMA_ID);
      setAccesos(data);
      const primera = data.find(a => a.ruta && rutas_validas.includes(a.ruta))?.ruta;
      setRutaInicial(primera ?? '/dashboards/principal');
      return primera ?? '/dashboards/principal';
    } catch (err) {
      console.error('Error recargando accesos:', err);
      return '/dashboards/principal';
    }
  };

  const tieneAcceso = (ruta) => {
    // Ruta exacta
    if (accesos.some(a => a.ruta === ruta)) return true;

    // Ruta con parámetros dinámicos /:id
    return accesos.some(a => {
      if (!a.ruta) return false;
      const partes     = a.ruta.split('/');
      const partesRuta = ruta.split('/');
      if (partes.length !== partesRuta.length) return false;
      return partes.every((p, i) => p.startsWith(':') || p === partesRuta[i]);
    });
  };

  const getPermisos = (ruta) => accesos.find(a => a.ruta === ruta) ?? null;

  return (
    <AccesosContext.Provider value={{
      accesos, loading, rutaInicial,
      tieneAcceso, getPermisos, recargarAccesos
    }}>
      {children}
    </AccesosContext.Provider>
  );
};

export const useAccesos = () => useContext(AccesosContext);