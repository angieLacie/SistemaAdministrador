import { ToastContainer } from 'react-toastify';
import { LayoutProvider } from '@/context/useLayoutContext';
import WavesInitializer from '@/components/client-wrappers/WaveClient';
const AppWrapper = ({
  children
}) => {
  return <LayoutProvider>
      <WavesInitializer />
      {children}
      <ToastContainer theme="colored" />
    </LayoutProvider>;
};
export default AppWrapper;