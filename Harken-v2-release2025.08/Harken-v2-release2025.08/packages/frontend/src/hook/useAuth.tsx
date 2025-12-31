import { getLocalStorage, removeLocalStorage, setLocalStorage } from '@/utils';
import { createContext, useContext, useEffect, useState } from 'react';

type Auth = {
  token: null | string;
  setToken: (token: string | null) => void;
};
const AuthContext = createContext<Auth>({
  token: null,
  setToken: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [userToken, setUser] = useState<string | null>(null);

  useEffect(() => {
    const userToken = getLocalStorage('token');
    if (userToken) {
      console.log("TOKEN EXISTS");
      
      setUser(userToken);
    }
  }, []);


  const setToken = (token: string | null) => {
    if (token) {
      setLocalStorage('token', token);
    } else {
      removeLocalStorage('token');
    }

    setUser(token);
  };

  return (
    <AuthContext.Provider value={{ token: userToken, setToken: setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
