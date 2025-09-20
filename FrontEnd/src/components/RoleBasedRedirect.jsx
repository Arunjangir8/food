import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'CUSTOMER') {
    return <Navigate to="/customer/home" replace />;
  } else if (user?.role === 'RESTAURANT_OWNER') {
    return <Navigate to="/restaurant/dashboard" replace />;
  }

  return <Navigate to="/select-login" replace />;
};

export default RoleBasedRedirect;