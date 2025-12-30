import { Outlet, useLocation } from 'react-router-dom';
import { WizardProvider } from './context/WizardContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  const location = useLocation();
  
  return (
    <ToastProvider>
      <WizardProvider>
        <Outlet key={location.pathname} />
      </WizardProvider>
    </ToastProvider>
  );
}

export default App;
