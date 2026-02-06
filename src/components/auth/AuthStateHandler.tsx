import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

const AUTH_ROUTES = new Set(['/login', '/signup']);

export function AuthStateHandler() {
  const { session, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = Boolean(session?.user);
    const isAuthRoute = AUTH_ROUTES.has(location.pathname);

    if (!isAuthenticated) {
      if (!isAuthRoute) {
        navigate('/login', { replace: true });
      }
      return;
    }

    if (isAuthRoute || location.pathname === '/') {
      navigate('/field', { replace: true });
    }
  }, [session, isLoading, location.pathname, navigate]);

  return null;
}
