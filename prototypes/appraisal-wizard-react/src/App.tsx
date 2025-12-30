import { Outlet, useLocation } from 'react-router-dom';
import { WizardProvider } from './context/WizardContext';
import { ToastProvider } from './context/ToastContext';
import { useEffect } from 'react';

function App() {
  const location = useLocation();
  
  // Debug: log route changes
  useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location.pathname]);
  
  return (
    <ToastProvider>
      <WizardProvider>
        {/* Force full remount on route change */}
        <div key={location.pathname}>
          <Outlet />
        </div>
      </WizardProvider>
    </ToastProvider>
  );
}

export default App;
