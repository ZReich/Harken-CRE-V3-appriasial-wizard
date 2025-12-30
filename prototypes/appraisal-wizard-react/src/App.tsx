import { Outlet } from 'react-router-dom';
import { WizardProvider } from './context/WizardContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <WizardProvider>
        <Outlet />
      </WizardProvider>
    </ToastProvider>
  );
}

export default App;
