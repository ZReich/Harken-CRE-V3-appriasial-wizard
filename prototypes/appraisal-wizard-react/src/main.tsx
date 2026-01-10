import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WizardProvider } from './context/WizardContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { GuidanceProvider } from './components/guidance'
import './index.css'

import TemplatePage from './pages/TemplatePage'
import DocumentIntakePage from './pages/DocumentIntakePage'
import SetupPage from './pages/SetupPage'
import SubjectDataPage from './pages/SubjectDataPage'
import AnalysisPage from './pages/AnalysisPage'
import ReviewPage from './pages/ReviewPage'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system">
    <BrowserRouter>
      <ToastProvider>
        <WizardProvider>
          <GuidanceProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/template" replace />} />
              <Route path="/template" element={<TemplatePage />} />
              <Route path="/document-intake" element={<DocumentIntakePage />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/subject-data" element={<SubjectDataPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/review" element={<ReviewPage />} />
            </Routes>
          </GuidanceProvider>
        </WizardProvider>
      </ToastProvider>
    </BrowserRouter>
  </ThemeProvider>,
)

