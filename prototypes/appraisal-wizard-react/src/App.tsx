import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { WizardProvider } from './context/WizardContext';
import { ToastProvider } from './context/ToastContext';

// Pages are imported synchronously to avoid route-level Suspense/lazy edge-cases
// where the URL updates but the rendered page does not.
import TemplatePage from './pages/TemplatePage';
import DocumentIntakePage from './pages/DocumentIntakePage';
import SetupPage from './pages/SetupPage';
import SubjectDataPage from './pages/SubjectDataPage';
import AnalysisPage from './pages/AnalysisPage';
import ReviewPage from './pages/ReviewPage';

// Wrapper component that uses location key for proper re-rendering
function AppRoutes() {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Navigate to="/template" replace />} />
      <Route path="/template" element={<TemplatePage />} />
      <Route path="/document-intake" element={<DocumentIntakePage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/subject-data" element={<SubjectDataPage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
      <Route path="/review" element={<ReviewPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <WizardProvider>
        <AppRoutes />
      </WizardProvider>
    </ToastProvider>
  );
}

export default App;
