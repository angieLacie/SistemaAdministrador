import { useAccesos } from '@/context/AccesosContext';
import { useLocation } from 'react-router-dom';

export const usePermisos = (rutaOverride = null) => {
  const { getPermisos } = useAccesos();
  const location = useLocation();
  const ruta     = rutaOverride ?? location.pathname;
  const permisos = getPermisos(ruta);

  return {
    puedeInsertar:  permisos?.i === 1,
    puedeModificar: permisos?.m === 1,
    puedeGrabar:    permisos?.g === 1,
    puedeConsultar: permisos?.c === 1,
    puedeEliminar:  permisos?.e === 1,
    puedeReporte:   permisos?.r === 1,
    puedeBuscar:    permisos?.b === 1,
    puedeImprimir:  permisos?.p === 1,
  };
};