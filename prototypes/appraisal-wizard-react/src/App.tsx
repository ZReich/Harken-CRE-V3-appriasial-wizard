import { Outlet, useLocation } from 'react-router-dom';
import { WizardProvider } from './context/WizardContext';
import { ToastProvider } from './context/ToastContext';
import { useEffect, useState } from 'react';

function App() {
  const location = useLocation();
  const [renderKey, setRenderKey] = useState(0);
  
  // Debug: log route changes and force re-render
  useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
    setRenderKey(k => k + 1);
  }, [location.pathname]);
  
  // Also log on every render
  console.log('[App] Rendering with pathname:', location.pathname, 'key:', renderKey);
  
  return (
    <ToastProvider>
      <WizardProvider>
        {/* Force full remount on route change */}
        <div key={`${location.pathname}-${renderKey}`}>
          <Outlet />
        </div>
      </WizardProvider>
    </ToastProvider>
  );
}

export default App;
