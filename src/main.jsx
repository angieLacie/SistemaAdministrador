import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'node-waves/dist/waves.css';
import '@/assets/webfonts/smartadmin/scss/sa-icons.scss';
import '@/assets/sass/smartapp.scss';
import { BrowserRouter } from 'react-router';
import AppWrapper from '@/components/AppWrapper';
import { basePath } from '@/helpers';
import { AccesosProvider } from '@/context/AccesosContext';
import { NotificacionesProvider } from '@/context/NotificacionesContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basePath}>
      <AppWrapper>
        <AccesosProvider>
          <NotificacionesProvider>
            <App />
          </NotificacionesProvider>
        </AccesosProvider>
      </AppWrapper>
    </BrowserRouter>
  </StrictMode>
);