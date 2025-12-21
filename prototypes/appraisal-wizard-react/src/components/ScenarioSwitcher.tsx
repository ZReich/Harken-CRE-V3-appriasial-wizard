import { useWizard } from '../context/WizardContext';
import type { AppraisalScenario } from '../types';

interface ScenarioSwitcherProps {
  className?: string;
}

// Color configuration for each scenario type
const SCENARIO_COLORS: Record<string, {
  accent: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  inactiveBg: string;
  inactiveText: string;
  dot: string;
}> = {
  'As Is': {
    accent: '#0da1c7',
    activeBg: 'bg-[#0da1c7]/10',
    activeBorder: 'border-[#0da1c7]',
    activeText: 'text-[#0da1c7]',
    inactiveBg: 'bg-slate-50',
    inactiveText: 'text-slate-600',
    dot: 'bg-[#0da1c7]',
  },
  'As Completed': {
    accent: '#10b981',
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-500',
    activeText: 'text-emerald-700',
    inactiveBg: 'bg-slate-50',
    inactiveText: 'text-slate-600',
    dot: 'bg-emerald-500',
  },
  'As Stabilized': {
    accent: '#8b5cf6',
    activeBg: 'bg-violet-50',
    activeBorder: 'border-violet-500',
    activeText: 'text-violet-700',
    inactiveBg: 'bg-slate-50',
    inactiveText: 'text-slate-600',
    dot: 'bg-violet-500',
  },
};

// Default colors for custom scenarios
const DEFAULT_COLORS = {
  accent: '#64748b',
  activeBg: 'bg-slate-100',
  activeBorder: 'border-slate-500',
  activeText: 'text-slate-700',
  inactiveBg: 'bg-slate-50',
  inactiveText: 'text-slate-600',
  dot: 'bg-slate-500',
};

export function getScenarioColors(scenarioName: string) {
  return SCENARIO_COLORS[scenarioName] || DEFAULT_COLORS;
}

export function getScenarioAccentColor(scenarioName: string): string {
  return (SCENARIO_COLORS[scenarioName] || DEFAULT_COLORS).accent;
}

export default function ScenarioSwitcher({ className = '' }: ScenarioSwitcherProps) {
  const { state, dispatch } = useWizard();
  const { scenarios, activeScenarioId } = state;

  const handleScenarioChange = (scenario: AppraisalScenario) => {
    dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: scenario.id });
  };

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (scenarios.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide mr-2">
        Scenario:
      </span>
      <div className="flex items-center gap-1.5 bg-slate-100/80 rounded-lg p-1 border border-slate-200">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;
          const colors = getScenarioColors(scenario.name);

          return (
            <button
              key={scenario.id}
              onClick={() => handleScenarioChange(scenario)}
              className={`
                relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                flex items-center gap-2 min-w-[100px] justify-center
                ${isActive
                  ? `${colors.activeBg} ${colors.activeText} border ${colors.activeBorder} shadow-sm`
                  : `${colors.inactiveBg} ${colors.inactiveText} border border-transparent hover:bg-slate-100`
                }
              `}
            >
              {/* Color dot indicator */}
              <span className={`w-2 h-2 rounded-full ${colors.dot} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
              
              <div className="flex flex-col items-start">
                <span className="leading-tight">{scenario.name}</span>
                {scenario.effectiveDate && (
                  <span className={`text-[10px] leading-tight ${isActive ? 'opacity-70' : 'opacity-50'}`}>
                    {formatDate(scenario.effectiveDate)}
                  </span>
                )}
              </div>

              {/* Required indicator */}
              {scenario.isRequired && (
                <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white`} 
                      title="Required scenario" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active scenario info badge */}
      {activeScenario && (
        <div className="ml-3 flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getScenarioColors(activeScenario.name).activeBg} ${getScenarioColors(activeScenario.name).activeText}`}>
            {activeScenario.approaches.length} approach{activeScenario.approaches.length !== 1 ? 'es' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

