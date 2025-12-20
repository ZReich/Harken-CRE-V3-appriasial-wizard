import { useContext, ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '@/pages/login/AuthProvider';
import { ReportLayout } from '@/components/layout/report-index';

interface PrivateRouteProps {
  children: ReactNode;
}

const ReportRoute = ({ children }: PrivateRouteProps) => {
  const { userRole, logout, token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      logout();
    }
  }, [token]);

  return userRole ? (
    <ReportLayout>{children}</ReportLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ReportRoute;
