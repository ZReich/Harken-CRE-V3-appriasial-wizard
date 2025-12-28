import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WizardProvider } from './context/WizardContext';
import { ToastProvider } from './context/ToastContext';

// Lazy-loaded Pages for code-splitting
const TemplatePage = lazy(() => import('./pages/TemplatePage'));
const DocumentIntakePage = lazy(() => import('./pages/DocumentIntakePage'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const SubjectDataPage = lazy(() => import('./pages/SubjectDataPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#0da1c7]/20 border-t-[#0da1c7] rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <WizardProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/template" replace />} />
            <Route path="/template" element={<TemplatePage />} />
            <Route path="/document-intake" element={<DocumentIntakePage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/subject-data" element={<SubjectDataPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/review" element={<ReviewPage />} />
          </Routes>
        </Suspense>
      </WizardProvider>
    </ToastProvider>
  );
}

export default App;
