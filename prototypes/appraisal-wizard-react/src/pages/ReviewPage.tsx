import { useNavigate } from 'react-router-dom';
import WizardLayout from '../components/WizardLayout';
import {
  ClipboardCheckIcon,
  ChartIcon,
  DocumentIcon,
} from '../components/icons';

export default function ReviewPage() {
  const navigate = useNavigate();

  const handleFinalize = () => {
    alert('Report finalized!');
    navigate('/template');
  };

  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Review & Finalize</h2>
      <p className="text-sm text-gray-500 mb-6">Final Checks</p>
      <nav className="space-y-1">
        <button className="w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 bg-[#0da1c7]/10 text-[#0da1c7] font-medium">
          <ClipboardCheckIcon className="w-5 h-5" />
          Completion Checklist
        </button>
        <button className="w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 text-gray-600 hover:bg-gray-100">
          <ChartIcon className="w-5 h-5" />
          Value Reconciliation
        </button>
        <button className="w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 text-gray-600 hover:bg-gray-100">
          <DocumentIcon className="w-5 h-5" />
          Report Preview
        </button>
      </nav>
    </div>
  );

  const helpSidebar = (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">Finalization</h3>
      <p className="text-sm text-gray-600 mb-4">
        Review all sections for completeness and accuracy before generating the final report.
      </p>
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-4">
        <h4 className="font-semibold text-sm text-green-900 mb-1">Ready to Finalize</h4>
        <p className="text-xs text-green-800">
          All required sections have been completed. You may proceed with report generation.
        </p>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <h4 className="font-semibold text-sm text-blue-900 mb-1">USPAP Compliance</h4>
        <p className="text-xs text-blue-800">
          Ensure all required certifications are signed and limiting conditions are properly disclosed.
        </p>
      </div>
    </div>
  );

  return (
    <WizardLayout
      title="Review & Finalize"
      subtitle="Phase 5 of 5 • Final Review & Reconciliation"
      phase={5}
      sidebar={sidebar}
      helpSidebar={helpSidebar}
    >
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Value Summary */}
        <div className="bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded-xl p-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Value Conclusions</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'As Is Value', value: '$1,140,000' },
              { label: 'As Completed', value: '$1,550,000' },
              { label: 'As Stabilized', value: '$2,000,000' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/20 backdrop-blur rounded-lg p-4 text-center"
              >
                <div className="text-sm opacity-90 mb-1">{item.label}</div>
                <div className="text-2xl font-bold">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Checklist */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
            Completion Checklist
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Template Selected', done: true },
              { label: 'Assignment Setup Complete', done: true },
              { label: 'Subject Property Data Entered', done: true },
              { label: 'Valuation Analysis Complete', done: true },
              { label: 'Reconciliation Complete', done: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  item.done ? 'bg-green-50' : 'bg-amber-50'
                }`}
              >
                {item.done ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                  </svg>
                )}
                <span
                  className={`text-sm ${
                    item.done ? 'text-green-800' : 'text-amber-800'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Finalize */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-1">Ready to Finalize</h3>
              <p className="text-sm text-green-800">
                Review your work and click "Finalize Report" to generate the final PDF.
              </p>
            </div>
            <button
              onClick={handleFinalize}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              Finalize Report
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
