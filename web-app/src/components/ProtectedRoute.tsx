import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Temporary: Bypass auth for debugging
const FORCE_BYPASS_AUTH = true;
// const FORCE_BYPASS_AUTH = false;

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  console.log('ProtectedRoute:', { isAuthenticated, loading });

  if (FORCE_BYPASS_AUTH) {
    console.log('ProtectedRoute: AUTH BYPASSED FOR DEBUGGING');
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading... (checking authentication)</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Rendering protected content');
  return <>{children}</>;
}
