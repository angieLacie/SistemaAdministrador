// Filtra el menú según los accesos del perfil
export const filtrarMenu = (menuItems, accesos) => {
  // URLs que siempre se muestran sin validar accesos
  const urlsLibres = [
    /*'/dashboards/control-center',
    '/dashboards/subscription',
    '/dashboards/marketing',
    '/dashboards/project-management',
    '/user-profile',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/two-factor',
    '/auth/lockscreen',
    '/404',
    '/error/404-2',
    '/error/500',
    '/landing',
    '/blank-page',
    '/icons/system',
    '/icons/font-awesome',
    '/icons/smart-admin',
    '/tables/basic',
    '/tables/style-generator',
    '/tanstack-tables/search',
    '/tanstack-tables/checkbox-select',
    '/tanstack-tables/delete-buttons',
    '/tanstack-tables/filters',
    '/tanstack-tables/sorting',*/
  ];

  const tieneAcceso = (url) => {
    if (!url) return true;
    if (urlsLibres.includes(url)) return true;
    return accesos.some(a => a.ruta === url);
  };

  const filtrarItems = (items) => {
    return items.reduce((acc, item) => {
      // Es título — incluir siempre
      if (item.isTitle) {
        acc.push(item);
        return acc;
      }

      // Tiene hijos — filtrar hijos
      if (item.children) {
        const hijosFiltrados = item.children.filter(hijo => tieneAcceso(hijo.url));
        if (hijosFiltrados.length > 0) {
          acc.push({ ...item, children: hijosFiltrados });
        }
        return acc;
      }

      // Item simple con URL
      if (tieneAcceso(item.url)) {
        acc.push(item);
      }

      return acc;
    }, []);
  };

  return filtrarItems(menuItems);
};