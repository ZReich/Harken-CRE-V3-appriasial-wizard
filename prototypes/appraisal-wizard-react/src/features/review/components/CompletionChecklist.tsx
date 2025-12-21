import { useMemo } from 'react';
import { useWizard } from '../../../context/WizardContext';

interface ChecklistItem {
  label: string;
  done: boolean;
  description?: string;
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function CompletionChecklist() {
  const { state, getIncomeApproachData } = useWizard();
  const { template, improvementsInventory } = state;
  // Add fallback for arrays that might be undefined from old localStorage
  const scenarios = state.scenarios || [];
  const uploadedDocuments = state.uploadedDocuments || [];

  // Dynamic checklist items based on actual wizard state
  const checklistItems = useMemo<ChecklistItem[]>(() => {
    const items: ChecklistItem[] = [];

    // Template Selected
    items.push({
      label: 'Template Selected',
      done: !!template,
      description: template ? `Using ${template} template` : undefined,
    });

    // Assignment Setup Complete
    items.push({
      label: 'Assignment Setup Complete',
      done: scenarios.length > 0 && scenarios.every((s) => s.effectiveDate),
      description: `${scenarios.length} scenario${scenarios.length !== 1 ? 's' : ''} configured`,
    });

    // Subject Property Data Entered
    const hasPropertyData =
      (improvementsInventory?.parcels?.length || 0) > 0 ||
      Object.keys(state.extractedData).length > 0;
    items.push({
      label: 'Subject Property Data Entered',
      done: hasPropertyData,
      description: hasPropertyData ? 'Property information captured' : undefined,
    });

    // Documents Uploaded
    const docsUploaded = uploadedDocuments.length > 0;
    items.push({
      label: 'Documents Uploaded',
      done: docsUploaded,
      description: docsUploaded ? `${uploadedDocuments.length} document${uploadedDocuments.length !== 1 ? 's' : ''} uploaded` : undefined,
    });

    // Valuation Analysis Complete (check if at least one approach has data)
    const incomeData = getIncomeApproachData();
    const hasValuation = !!incomeData?.valuation?.directCapValue;
    items.push({
      label: 'Valuation Analysis Complete',
      done: hasValuation,
      description: hasValuation ? 'Value conclusions calculated' : undefined,
    });

    // Reconciliation Complete
    items.push({
      label: 'Reconciliation Complete',
      done: false, // Would check if reconciliation data is filled
      description: 'Complete in Value Reconciliation tab',
    });

    return items;
  }, [template, scenarios, improvementsInventory, state.extractedData, uploadedDocuments, getIncomeApproachData]);

  // Calculate concluded values for display
  const concludedValues = useMemo(() => {
    return scenarios.map((s) => {
      // Mock value calculation - would use actual approach data
      const incomeData = getIncomeApproachData();
      let value = incomeData?.valuation?.directCapValue || null;
      
      // Adjust for different scenarios (mock logic)
      if (s.name === 'As Completed' && value) {
        value = Math.round(value * 1.35);
      } else if (s.name === 'As Stabilized' && value) {
        value = Math.round(value * 1.75);
      }
      
      return {
        name: s.name,
        value,
      };
    });
  }, [scenarios, getIncomeApproachData]);

  const completedCount = checklistItems.filter((item) => item.done).length;
  const totalCount = checklistItems.length;
  const isReadyToFinalize = completedCount >= totalCount - 1; // Allow one incomplete item

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Value Summary */}
      <div className="bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Value Conclusions</h2>
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${Math.min(scenarios.length, 3)}, 1fr)` }}
        >
          {concludedValues.map((item) => (
            <div
              key={item.name}
              className="bg-white/20 backdrop-blur rounded-lg p-4 text-center"
            >
              <div className="text-sm opacity-90 mb-1">{item.name}</div>
              <div className="text-2xl font-bold">{formatCurrency(item.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Checklist */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3 mb-4">
          <h3 className="text-lg font-bold text-[#1c3643]">Completion Checklist</h3>
          <span className="text-sm text-gray-500">
            {completedCount} of {totalCount} complete
          </span>
        </div>
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                item.done ? 'bg-green-50' : 'bg-amber-50'
              }`}
            >
              {item.done ? (
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                </svg>
              )}
              <div className="flex-1">
                <span className={`text-sm font-medium ${item.done ? 'text-green-800' : 'text-amber-800'}`}>
                  {item.label}
                </span>
                {item.description && (
                  <p className={`text-xs mt-0.5 ${item.done ? 'text-green-600' : 'text-amber-600'}`}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Finalize Section */}
      <div className={`border-2 rounded-xl p-6 ${isReadyToFinalize ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center gap-4">
          <svg
            className={`w-12 h-12 ${isReadyToFinalize ? 'text-green-600' : 'text-amber-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isReadyToFinalize ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <div className="flex-1">
            <h3 className={`text-lg font-bold mb-1 ${isReadyToFinalize ? 'text-green-900' : 'text-amber-900'}`}>
              {isReadyToFinalize ? 'Ready to Finalize' : 'Complete Remaining Items'}
            </h3>
            <p className={`text-sm ${isReadyToFinalize ? 'text-green-800' : 'text-amber-800'}`}>
              {isReadyToFinalize
                ? 'Review your work and click "Finalize Report" to generate the final PDF.'
                : 'Please complete the remaining checklist items before finalizing.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

