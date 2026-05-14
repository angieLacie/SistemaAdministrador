import { Navigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';

const PrivateRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

export default PrivateRoute;