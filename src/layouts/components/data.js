export const menuItems = [{
  key: 'insights',
  label: 'Dashboards',
  isTitle: true
},  {
  key: 'dashboards',
  label: 'Dashboards',
  icon: '/icons/sprite.svg#trello',
  children: [{
    key: 'principal',
    label: 'Principal',
    url: '/dashboards/principal'
  },{
    key: 'sincronizacion',
    label: 'Sincronización',
    url: '/dashboards/sincronizacion'
  }]
}, {
  key: 'monitor-reportes',
  label: 'Reportes',
  icon: '/icons/sprite.svg#trello',
  children: [{
    key: 'precio-cero',
    label: 'Precio / Costo Cero',
    url: '/monitor/precio-cero'
  },{
  key: 'interfaz',
  label: 'Interfaces',
  url: '/monitor/interfaz'
},{
  key: 'facturacion',
  label: 'Facturación',
  url: '/monitor/facturacion'
},{
  key: 'tamano-bd',
  label: 'Tamaño BD',
  url: '/monitor/tamano-bd'
},{
  key: 'integracion-envios',
  label: 'Integración Envíos',
  url: '/monitor/integracion-envios'
}]
},    {
  key: 'gestion',
  label: 'Gestión',
  isTitle: true
}, {
  key: 'licencias',
  label: 'Licencias',
  icon: '/icons/sprite.svg#database',
  children: [{
    key: 'licencias-lista',
    label: 'Control de licencias',
    url: '/licencias'
  }, {
    key: 'licencias-reporte',
    label: 'Reporte de pagos',
    url: '/licencias/reporte'
  },
{
  key: 'licencias-tienda',
  label: 'Licencias Tiendas',
  url: '/licencias-tienda'
}]
},{
  key: 'membresias',
  label: 'Membresías',
  icon: '/icons/sprite.svg#award',
  children: [{
    key: 'membresias-lista',
    label: 'Control de membresías',
    url: '/membresias'
  }, {
    key: 'membresias-reporte',        // ← agregar
    label: 'Reporte de pagos',
    url: '/membresias/reporte'
  }]
}, {
  key: 'c4sales',
  label: 'C4 Sales',
  icon: '/icons/sprite.svg#user',
  children: [{
    key: 'c4sales-lista',
    label: 'Control C4 Sales',
    url: '/c4sales'
  }]
},
{
  key: 'proyectos',
  label: 'Proyectos',
  icon: '/icons/sprite.svg#briefcase',
  children: [{
    key: 'proyectos-lista',
    label: 'Control de proyectos',
    url: '/proyectos'
  },{
  key: 'proyectos-dashboard',
  label: 'Dashboard',
  url: '/proyectos/dashboard'
}]
}, 
{
  key: 'infraestructura',
  label: 'Infraestructura',
  icon: '/icons/sprite.svg#briefcase',
  children: [ {
  key: 'lineas-bd',
  label: 'Líneas Corporativas',
  url: '/infraestructura'
}]
},
, {
  key: 'data-visualization',
  label: 'Accesos y Seguridad',
  isTitle: true
}, 
{
  key: 'jobs',
  label: 'Jobs',
  icon: '/icons/sprite.svg#settings',
  children: [{
    key: 'jobs-lista',
    label: 'Control de Jobs',
    url: '/jobs'
  }]
},{ 
  key: 'accesos',
  label: 'Accesos',
  icon: '/icons/sprite.svg#shield',
  children: [{
    key: 'accesos-perfil',
    label: 'Configurar por perfil',
    url: '/accesos/perfil'
  },{
  key: 'accesos-gestion',
  label: 'Mantenimiento',
  url: '/accesos/gestion'
}]
},{
  key: 'seguridad',
  label: 'Seguridad',
  icon: '/icons/sprite.svg#shield',
  children: [{
    key: 'usuarios',
    label: 'Usuarios',
    url: '/usuarios'
    },{
    key: 'perfiles',
    label: 'Perfiles',
    url: '/perfiles'
    },{
      key: 'perfil-tienda',
      label: 'Perfil Tiendas',
      url: '/perfil-tienda'
    },{
      key: 'empleados',
      label: 'Empleados',
      url: '/empleados'
    },{
      key: 'perfil-vista',
      label: 'Perfil Vistas',
      url: '/perfil-vista'
    }]
},{
  key: 'parametros',
  label: 'Parámetros',
  isTitle: true
},
{
  key: 'parametros-grupo',
  label: 'Parámetros',
  icon: '/icons/sprite.svg#sliders',
  children: [
    {
      key: 'parametros-llave',
      label: 'Parámetros Llave',
      url: '/parametros/llave',
      parentKey: 'parametros-grupo'
    }
  ]
},
{
  key: 'notificaciones',
  label: 'Notificaciones',
  icon: '/icons/sprite.svg#bell',
  children: [{
    key: 'notificaciones-lista',
    label: 'Gestión de Notificaciones',
    url: '/notificaciones'
  }]
}



];
