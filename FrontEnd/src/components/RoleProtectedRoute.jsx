import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/select-login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    if (user?.role === 'CUSTOMER') {
      return <Navigate to="/" replace />;
    } else if (user?.role === 'RESTAURANT_OWNER') {
      return <Navigate to="/restaurant/dashboard" replace />;
    }
    return <Navigate to="/select-login" replace />;
  }

  return children;
};

export default RoleProtectedRoute;