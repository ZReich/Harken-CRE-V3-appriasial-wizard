import { createContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGet } from '@/hook/useGet';
import { globalRouter } from '@/utils/commonFunctions';

interface AuthContextType {
  userRole: string;
  login: (role: string, token: string) => void;
  logout: () => void;
  token: string;
}

export const AuthContext = createContext<AuthContextType>({
  userRole: '',
  login: () => {},
  logout: () => {},
  token: '',
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const tokenGet = localStorage.getItem('accessToken');
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || '');
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');
  const navigate = useNavigate();

  useEffect(() => {
    globalRouter.navigate = navigate;
  }, []);
  useEffect(() => {
    window.addEventListener(
      'storage',
      () => {
        setToken(localStorage.getItem('accessToken') || '');
      },
      false
    );
  }, []);

  const login = (role: string, token: string) => {
    setUserRole(role);
    setToken(token);
    localStorage.setItem('role', role);
  };

  const logout = () => {
    setUserRole('');
    setToken('');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('refresh');
  };

  const { data } = useGet<any>({
    queryKey: '',
    endPoint: 'user/get',
    config: { enabled: Boolean(tokenGet), refetchOnWindowFocus: false },
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !userRole) {
      const fetchUserRole = async () => {
        try {
          const response = await data;
          const role = response?.data?.data?.user?.role ?? '';
          setUserRole(role);
          localStorage.setItem('role', role);
        } catch (error) {
          logout();
          navigate('/login');
        }
      };

      fetchUserRole();
    }
  }, [userRole]);

  return (
    <AuthContext.Provider value={{ userRole, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};
