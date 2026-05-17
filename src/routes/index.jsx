import { lazy } from 'react';
import { Navigate } from 'react-router';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PrivateRoute from '@/components/PrivateRoute';
import RouteGuard from '@/components/RouteGuard';
import path from 'node:path';

// Dashboards
const DashboardControl           = lazy(() => import('@/views/dashboards/control-center'));
const DashboardMarketing         = lazy(() => import('@/views/dashboards/marketing'));
const DashboardProjectManagement = lazy(() => import('@/views/dashboards/project-management'));
const DashboardSubscription      = lazy(() => import('@/views/dashboards/subscription'));
const DashboardSync = lazy(() => import('@/views/dashboards/sincronizacion')); 
// user profile
const UserProfile = lazy(() => import('@/views/user-profile'));

// auth pages
const LoginPage      = lazy(() => import('@/views/auth/Login'));
const Register       = lazy(() => import('@/views/auth/register'));
const ForgotPassword = lazy(() => import('@/views/auth/forgot-password'));
const LockScreen     = lazy(() => import('@/views/auth/lockscreen'));
const TwoFactor      = lazy(() => import('@/views/auth/two-factor'));

// landing Page
const LandingPage = lazy(() => import('@/views/landing'));

// icons
const SystemIcons     = lazy(() => import('@/views/icons/system'));
const FontAwesomeIcons= lazy(() => import('@/views/icons/font-awesome'));
const SmartAdminIcons = lazy(() => import('@/views/icons/smart-admin'));

// ── Licencias ──────────────────────────────────────────
const GestionLicencias = lazy(() => import('@/views/licencias'));
const DetalleLicencia  = lazy(() => import('@/views/licencias/DetalleLicencia'));
const ReportePagos     = lazy(() => import('@/views/licencias/ReportePagos'));

// ── Membresías ─────────────────────────────────────────
const GestionMembresias = lazy(() => import('@/views/membresias'));
const DetalleMembresia  = lazy(() => import('@/views/membresias/DetalleMembresia'));
const ReporteMembresias = lazy(() => import('@/views/membresias/ReporteMembresias'));

// ── C4 Sales / Jobs ────────────────────────────────────
const GestionC4Sales = lazy(() => import('@/views/c4sales'));
const GestionJobs    = lazy(() => import('@/views/jobs'));

// ── Seguridad ──────────────────────────────────────────
const GestionUsuarios     = lazy(() => import('@/views/usuarios'));
const GestionPerfiles     = lazy(() => import('@/views/perfiles'));
const GestionPerfilTienda = lazy(() => import('@/views/perfiltienda'));
const GestionEmpleados    = lazy(() => import('@/views/empleados'));

// ── Notificaciones ─────────────────────────────────────
const GestionNotificaciones = lazy(() => import('@/views/notificaciones'));

// ── Sistemas Tienda ────────────────────────────────────
const SistemasTienda   = lazy(() => import('@/views/sistemasTienda'));
const SistemasCentral    = lazy(() => import('@/views/sistemasCentral'));
const GestionIndicadores = lazy(() => import('@/views/indicadores'));

// ── Accesos ────────────────────────────────────────────
const AccesosPerfil  = lazy(() => import('@/views/accesos/perfil'));
const GestionAccesos = lazy(() => import('@/views/accesos/gestion'));
const ParametrosView = lazy(() => import('@/views/parametros'));

// ── Monitor ────────────────────────────────────────────
const DashboardPrecioCero  = lazy(() => import('@/views/dashboards/preciocero'));
const DashboardInterfaz    = lazy(() => import('@/views/dashboards/interfaz'));
const DashboardFacturacion = lazy(() => import('@/views/dashboards/facturacion'));
const DashboardTamanoBD         = lazy(() => import('@/views/dashboards/tamanobd'));
const DashboardIntegracionEnvios = lazy(() => import('@/views/dashboards/integracionenvios'));

// ── Proyectos ──────────────────────────────────────────
const GestionProyectos   = lazy(() => import('@/views/proyectos'));
const DetalleProyecto    = lazy(() => import('@/views/proyectos/DetalleProyecto'));
const DashboardProyectos = lazy(() => import('@/views/proyectos/DashboardProyectos'));
const DashboardPrincipal = lazy(() => import('@/views/dashboards/principal'));
const GestionVistaPerfil = lazy(() => import('@/views/vistaperfil'));
const GestionLicenciasTienda = lazy(() => import('@/views/licenciastienda'));
const DetalleLicenciaTienda = lazy(() => import('@/views/licenciastienda/DetalleLicenciaTienda'));
const GestionInfraestructura = lazy(() => import('@/views/infraestructura'));

// ── Tables ─────────────────────────────────────────────
const BasicTables         = lazy(() => import('@/views/tables/basic'));
const TableStyleGenerator = lazy(() => import('@/views/tables/style-generator'));

// ── TanStack Tables ────────────────────────────────────
const TableWithSearch         = lazy(() => import('@/views/tanstack-tables/search'));
const TableWithFilters        = lazy(() => import('@/views/tanstack-tables/filters'));
const TableSorting            = lazy(() => import('@/views/tanstack-tables/sorting'));
const TableWithCheckboxSelect = lazy(() => import('@/views/tanstack-tables/checkbox-select'));
const TableWithDeleteButton   = lazy(() => import('@/views/tanstack-tables/delete-buttons'));

// ── Other pages ────────────────────────────────────────
const Page404    = lazy(() => import('@/views/other-pages/404'));
const BlankPage  = lazy(() => import('@/views/other-pages/blank-page'));
const Page404Alt = lazy(() => import('@/views/error/404-2'));
const Page500    = lazy(() => import('@/views/error/500'));
// Helper para envolver con RouteGuard
const G = (element) => <RouteGuard>{element}</RouteGuard>;

// ── Auth pages — públicas, sin guard ──────────────────
const authPages = [{
  element: <AuthLayout />,
  children: [{
    path: '/auth/login',
    element: <LoginPage />
  },
   {
    path: '/auth/register',
    element: <Register />
  }, {
    path: '/auth/forgot-password',
    element: <ForgotPassword />
  }, {
    path: '/auth/two-factor',
    element: <TwoFactor />
  }, {
    path: '/auth/lockscreen',
    element: <LockScreen />
  }]
}];

// ── App pages — privadas, con guard ───────────────────
const appPages = [{
  element: (
    <PrivateRoute>
      <MainLayout />
    </PrivateRoute>
  ),
  children: [
     
    { path: '/', element: <Navigate to="/auth/login" replace /> },

    { path: '/dashboards/principal',          element: <DashboardPrincipal /> },
    // Dashboards — libres
    { path: '/dashboards/control-center',     element: <DashboardControl /> },
    { path: '/dashboards/marketing',          element: <DashboardMarketing /> },
    { path: '/dashboards/project-management', element: <DashboardProjectManagement /> },
    { path: '/dashboards/subscription',       element: <DashboardSubscription /> },
    { path: '/dashboards/sincronizacion', element: G(<DashboardSync />) },
    
    // Licencias
    { path: '/licencias',         element: G(<GestionLicencias />) },
    { path: '/licencias/:id',     element: G(<DetalleLicencia />) },
    { path: '/licencias/reporte', element: G(<ReportePagos />) },
    { path: '/licencias-tienda', element: G(<GestionLicenciasTienda />) },
    { path: '/licencias-tienda/:id', element: G(<DetalleLicenciaTienda />) },
    // Membresías
    { path: '/membresias',         element: G(<GestionMembresias />) },
    { path: '/membresias/:id',     element: G(<DetalleMembresia />) },
    { path: '/membresias/reporte', element: G(<ReporteMembresias />) },

    // C4 Sales / Jobs
    { path: '/c4sales', element: G(<GestionC4Sales />) },
    { path: '/jobs',    element: G(<GestionJobs />) },

    // Seguridad
    { path: '/usuarios',      element: G(<GestionUsuarios />) },
    { path: '/perfiles',      element: G(<GestionPerfiles />) },
    { path: '/perfil-tienda', element: G(<GestionPerfilTienda />) },
    { path: '/empleados',     element: G(<GestionEmpleados />) },
    { path: '/perfil-vista', element: G(<GestionVistaPerfil />) },
    // Accesos
    { path: '/accesos/perfil',  element: G(<AccesosPerfil />) },
    { path: '/accesos/gestion', element: G(<GestionAccesos />) },
    { path: '/parametros/llave', element: G(<ParametrosView />) },
    { path: '/notificaciones',   element: G(<GestionNotificaciones />) },
    { path: '/sistemas-tienda',   element: G(<SistemasTienda />) },
    { path: '/sistemas-central',   element: G(<SistemasCentral />) },
    { path: '/monitor/indicadores', element: G(<GestionIndicadores />) },
    // Monitor
    { path: '/monitor/precio-cero', element: G(<DashboardPrecioCero />) },
    { path: '/monitor/interfaz',    element: G(<DashboardInterfaz />) },
    { path: '/monitor/facturacion',    element: G(<DashboardFacturacion />) },
    { path: '/monitor/tamano-bd',           element: G(<DashboardTamanoBD />) },
    { path: '/monitor/integracion-envios',  element: G(<DashboardIntegracionEnvios />) },
    { path: '/infraestructura',       element: G(<GestionInfraestructura />) }, 
    // Proyectos
    { path: '/proyectos',           element: G(<GestionProyectos />) },
    { path: '/proyectos/dashboard', element: G(<DashboardProyectos />) },
    { path: '/proyectos/:id',       element: G(<DetalleProyecto />) },



    // User profile — libre
    { path: '/user-profile', element: <UserProfile /> },

    // Tables — libre
    { path: '/tables/basic',           element: <BasicTables /> },
    { path: '/tables/style-generator', element: <TableStyleGenerator /> },

    // TanStack Tables — libre
    { path: '/tanstack-tables/search',          element: <TableWithSearch /> },
    { path: '/tanstack-tables/filters',         element: <TableWithFilters /> },
    { path: '/tanstack-tables/sorting',         element: <TableSorting /> },
    { path: '/tanstack-tables/checkbox-select', element: <TableWithCheckboxSelect /> },
    { path: '/tanstack-tables/delete-buttons',  element: <TableWithDeleteButton /> },

    // Icons — libre
    { path: '/icons/system',       element: <SystemIcons /> },
    { path: '/icons/font-awesome', element: <FontAwesomeIcons /> },
    { path: '/icons/smart-admin',  element: <SmartAdminIcons /> },

    // Other — libre
    { path: '/404',        element: <Page404 /> },
    { path: '/blank-page', element: <BlankPage /> },
  ]
}];

const otherPages = [{
  path: '/error/404-2',
  element: <Page404Alt />
}, {
  path: '/error/500',
  element: <Page500 />
}, {
  path: '/landing',
  element: <LandingPage />
}];

export const routes = [...appPages, ...authPages, ...otherPages];