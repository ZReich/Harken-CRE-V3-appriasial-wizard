import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import TemplatePage from './pages/TemplatePage'
import DocumentIntakePage from './pages/DocumentIntakePage'
import SetupPage from './pages/SetupPage'
import SubjectDataPage from './pages/SubjectDataPage'
import AnalysisPage from './pages/AnalysisPage'
import ReviewPage from './pages/ReviewPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/template" replace /> },
      { path: 'template', element: <TemplatePage /> },
      { path: 'document-intake', element: <DocumentIntakePage /> },
      { path: 'setup', element: <SetupPage /> },
      { path: 'subject-data', element: <SubjectDataPage /> },
      { path: 'analysis', element: <AnalysisPage /> },
      { path: 'review', element: <ReviewPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
)

