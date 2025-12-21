import { useState, useMemo } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { APPROACH_COLORS, ALL_APPROACHES } from '../constants';
import { DEFAULT_CERTIFICATIONS } from '../types';
import type { ScenarioReconciliation } from '../types';

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getApproachIcon(approachName: string) {
  if (approachName.includes('Sales')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  }
  if (approachName.includes('Income')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

// =================================================================
// VALUE RECONCILIATION COMPONENT
// =================================================================

export function ValueReconciliation() {
  const { state, getIncomeApproachData } = useWizard();
  const { scenarios, improvementsInventory, extractedData } = state;

  // Local state for reconciliation data
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [reconciliations, setReconciliations] = useState<ScenarioReconciliation[]>(() =>
    scenarios.map((s) => ({
      scenarioId: s.id,
      weights: s.approaches.reduce((acc, approach) => {
        acc[approach] = Math.floor(100 / s.approaches.length);
        return acc;
      }, {} as Record<string, number>),
      comments: '',
    }))
  );
  const [exposurePeriod, setExposurePeriod] = useState<string>('');
  const [marketingTime, setMarketingTime] = useState<string>('');
  const [exposureRationale, setExposureRationale] = useState('');
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);

  // Get property info from state
  const propertyName = useMemo(() => {
    // Try to get from improvements inventory first
    if (improvementsInventory?.parcels?.[0]?.buildings?.[0]?.name) {
      return improvementsInventory.parcels[0].buildings[0].name;
    }
    // Try extracted data
    if (extractedData?.cadastral?.propertyName?.value) {
      return extractedData.cadastral.propertyName.value;
    }
    return 'Subject Property';
  }, [improvementsInventory, extractedData]);

  const propertyLocation = useMemo(() => {
    if (extractedData?.cadastral?.address?.value) {
      return extractedData.cadastral.address.value;
    }
    if (improvementsInventory?.parcels?.[0]?.address) {
      return improvementsInventory.parcels[0].address;
    }
    return 'Location Not Specified';
  }, [extractedData, improvementsInventory]);

  // Get all unique approaches used across scenarios
  const allUsedApproaches = useMemo(() => {
    const approaches = new Set<string>();
    scenarios.forEach((s) => s.approaches.forEach((a) => approaches.add(a)));
    return ALL_APPROACHES.filter((a) => approaches.has(a));
  }, [scenarios]);

  // Get approach value for a scenario (mock values for now - would come from actual approach data)
  const getApproachValue = (scenarioId: number, approachName: string): number | null => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario?.approaches.includes(approachName)) return null;

    // Get income approach data if available
    const incomeData = getIncomeApproachData();
    if (approachName.includes('Income') && incomeData?.valuationData?.marketCapRate) {
      // In production, calculate NOI / Cap Rate
      return 1250000; // Mock value
    }

    // Mock values for demo - in production these would come from actual approach data
    const mockValues: Record<string, Record<string, number>> = {
      'As Is': { 'Sales Comparison': 1130000, 'Income Approach': 1140000, 'Cost Approach': 1052000 },
      'As Completed': { 'Sales Comparison': 1550000, 'Income Approach': 1583000, 'Cost Approach': 1310000 },
      'As Stabilized': { 'Sales Comparison': 0, 'Income Approach': 2036000, 'Cost Approach': 0 },
    };

    return mockValues[scenario.name]?.[approachName] || null;
  };

  // Calculate concluded value for a scenario
  const getConcludedValue = (scenarioId: number): number => {
    const recon = reconciliations.find((r) => r.scenarioId === scenarioId);
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!recon || !scenario) return 0;

    let totalWeight = 0;
    let weightedSum = 0;

    scenario.approaches.forEach((approach) => {
      const weight = recon.weights[approach] || 0;
      const value = getApproachValue(scenarioId, approach);
      if (value) {
        totalWeight += weight;
        weightedSum += (value * weight) / 100;
      }
    });

    return Math.round(weightedSum);
  };

  // Handle weight change
  const handleWeightChange = (scenarioId: number, approach: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setReconciliations((prev) =>
      prev.map((r) =>
        r.scenarioId === scenarioId
          ? { ...r, weights: { ...r.weights, [approach]: Math.min(100, Math.max(0, numValue)) } }
          : r
      )
    );
  };

  // Handle comments change
  const handleCommentsChange = (scenarioId: number, comments: string) => {
    setReconciliations((prev) =>
      prev.map((r) => (r.scenarioId === scenarioId ? { ...r, comments } : r))
    );
  };

  // Toggle certification
  const toggleCertification = (certId: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(certId) ? prev.filter((id) => id !== certId) : [...prev, certId]
    );
  };

  const activeScenario = scenarios[activeScenarioIndex];
  const activeReconciliation = reconciliations.find((r) => r.scenarioId === activeScenario?.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{propertyName}</h2>
            <p className="text-blue-100">{propertyLocation}</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90 mb-2">Valuation Scenarios</div>
            <div className="flex gap-2">
              {scenarios.map((s) => (
                <span
                  key={s.id}
                  className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(scenarios.length + 1, 4)}, 1fr)` }}>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs opacity-75 mb-1">Property Type</div>
            <div className="font-semibold">{state.propertyType || 'Commercial'}</div>
          </div>
          {scenarios.map((s) => (
            <div key={s.id} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
              <div className="text-xs opacity-75 mb-1">{s.name}</div>
              <div className="font-bold text-lg">{formatCurrency(getConcludedValue(s.id))}</div>
              <div className="text-xs opacity-75">{s.effectiveDate || 'TBD'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Value Conclusions Summary Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
          Value Conclusions Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b-2 border-gray-200"></th>
                {scenarios.map((s, idx) => (
                  <th
                    key={s.id}
                    className="text-center px-4 py-3 font-semibold text-gray-900 border-b-2 border-gray-200"
                  >
                    <span className={idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-green-600' : 'text-purple-600'}>
                      {s.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Effective Date Row */}
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-700">Effective Date</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="px-4 py-3 text-center text-sm text-gray-600">
                    {s.effectiveDate || 'TBD'}
                  </td>
                ))}
              </tr>

              {/* Approach Rows */}
              {allUsedApproaches.map((approach) => {
                const colors = APPROACH_COLORS[approach] || { text: 'text-gray-600' };
                return (
                  <tr key={approach} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className={colors.text}>{getApproachIcon(approach)}</span>
                        {approach}
                      </div>
                    </td>
                    {scenarios.map((s) => {
                      const value = getApproachValue(s.id, approach);
                      const isApplicable = s.approaches.includes(approach);
                      return (
                        <td key={s.id} className="px-4 py-3 text-center">
                          {isApplicable ? (
                            <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Concluded Value Row */}
              <tr className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <td className="px-4 py-4 font-bold text-gray-900 uppercase text-sm">Concluded Value</td>
                {scenarios.map((s, idx) => (
                  <td key={s.id} className="px-4 py-4 text-center">
                    <span
                      className={`text-xl font-bold ${
                        idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-green-600' : 'text-purple-600'
                      }`}
                    >
                      {formatCurrency(getConcludedValue(s.id))}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconciliation by Scenario */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
          Reconciliation by Scenario
        </h3>

        {/* Scenario Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {scenarios.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveScenarioIndex(idx)}
              className={`px-4 py-2 text-sm font-medium -mb-px transition-colors ${
                idx === activeScenarioIndex
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Active Scenario Panel */}
        {activeScenario && activeReconciliation && (
          <div className="space-y-6">
            {/* Approach Value Boxes */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${allUsedApproaches.length}, 1fr)` }}>
              {allUsedApproaches.map((approach) => {
                const isApplicable = activeScenario.approaches.includes(approach);
                const value = getApproachValue(activeScenario.id, approach);
                const colors = APPROACH_COLORS[approach] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };

                return (
                  <div
                    key={approach}
                    className={`rounded-xl p-5 text-center border-2 ${
                      isApplicable ? `${colors.bg} ${colors.border}` : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="text-xs text-gray-500 uppercase mb-2 font-medium">{approach}</div>
                    <div className={`text-xl font-bold mb-3 ${isApplicable ? colors.text : 'text-gray-400'}`}>
                      {isApplicable ? formatCurrency(value) : 'N/A'}
                    </div>
                    {isApplicable ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Weight (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={activeReconciliation.weights[approach] || 0}
                          onChange={(e) => handleWeightChange(activeScenario.id, approach, e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center text-sm text-gray-900 focus:ring-2 focus:ring-[#0da1c7] focus:border-[#0da1c7]"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Not applicable for this scenario</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reconciliation Comments - {activeScenario.name}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder={`Explain your reasoning for the ${activeScenario.name} value conclusion...`}
                value={activeReconciliation.comments}
                onChange={(e) => handleCommentsChange(activeScenario.id, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0da1c7] focus:border-[#0da1c7]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Exposure & Marketing Time */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
          Exposure & Marketing Time
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Exposure Period (Months) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="12"
              value={exposurePeriod}
              onChange={(e) => setExposurePeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0da1c7] focus:border-[#0da1c7]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Marketing Time (Months)
            </label>
            <input
              type="number"
              placeholder="12"
              value={marketingTime}
              onChange={(e) => setMarketingTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0da1c7] focus:border-[#0da1c7]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exposure Time Rationale</label>
          <textarea
            rows={3}
            placeholder="Explain the basis for your exposure time estimate..."
            value={exposureRationale}
            onChange={(e) => setExposureRationale(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0da1c7] focus:border-[#0da1c7]"
          />
        </div>
      </div>

      {/* Final Certifications */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
          Final Certifications
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Click each certification to confirm your compliance with USPAP requirements.
        </p>
        <div className="space-y-3">
          {DEFAULT_CERTIFICATIONS.map((cert) => {
            const isSelected = selectedCertifications.includes(cert.id);
            return (
              <button
                key={cert.id}
                onClick={() => toggleCertification(cert.id)}
                className={`w-full text-left p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#0da1c7] bg-[#0da1c7]/5'
                    : 'border-gray-200 hover:border-[#0da1c7]/50 hover:bg-[#0da1c7]/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#0da1c7] border-[#0da1c7]' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{cert.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

