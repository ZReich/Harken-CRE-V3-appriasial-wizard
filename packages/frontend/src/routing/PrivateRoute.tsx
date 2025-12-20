import { useContext, ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '@/pages/login/AuthProvider';
import { Layout } from '@/components/layout';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { userRole, logout, token } = useContext(AuthContext);

  useEffect(() => { 
    if (!token) {
      logout()
    }
  }, [token])
  
  return userRole ? (
    <Layout>
      {children}
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
