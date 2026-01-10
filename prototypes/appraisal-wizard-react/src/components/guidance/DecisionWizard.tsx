// src/components/guidance/DecisionWizard.tsx
// Interactive decision tree component for guiding users through complex choices

import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Check, X, ArrowRight, HelpCircle } from 'lucide-react';

export interface DecisionOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Value to return if this option is selected */
  value?: unknown;
  /** Next step ID to navigate to, or null to end */
  nextStepId?: string | null;
}

export interface DecisionStep {
  id: string;
  question: string;
  description?: string;
  options: DecisionOption[];
  /** If true, this is an informational step (no selection needed) */
  isInfoStep?: boolean;
  /** Help text shown as expandable section */
  helpText?: string;
}

export interface DecisionResult {
  /** All selected options in order */
  selections: Array<{ stepId: string; optionId: string; value: unknown }>;
  /** Final computed value (if applicable) */
  finalValue?: unknown;
}

interface DecisionWizardProps {
  /** Title of the decision wizard */
  title: string;
  /** Description shown at the top */
  description?: string;
  /** Steps in the decision tree */
  steps: DecisionStep[];
  /** Callback when wizard is completed */
  onComplete: (result: DecisionResult) => void;
  /** Callback when wizard is cancelled */
  onCancel?: () => void;
  /** Custom className */
  className?: string;
  /** ID of the first step */
  initialStepId?: string;
}

export function DecisionWizard({
  title,
  description,
  steps,
  onComplete,
  onCancel,
  className = '',
  initialStepId,
}: DecisionWizardProps) {
  const [currentStepId, setCurrentStepId] = useState<string>(
    initialStepId || steps[0]?.id || ''
  );
  const [selections, setSelections] = useState<
    Array<{ stepId: string; optionId: string; value: unknown }>
  >([]);
  const [showHelp, setShowHelp] = useState(false);

  const currentStep = steps.find((s) => s.id === currentStepId);
  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);

  // Get history of visited steps for back navigation
  const visitedSteps = selections.map((s) => s.stepId);

  const handleSelectOption = useCallback(
    (option: DecisionOption) => {
      // Record selection
      const newSelection = {
        stepId: currentStepId,
        optionId: option.id,
        value: option.value,
      };

      // Remove any previous selection for this step (in case of back navigation)
      const filteredSelections = selections.filter(
        (s) => s.stepId !== currentStepId
      );
      const newSelections = [...filteredSelections, newSelection];
      setSelections(newSelections);

      // Navigate to next step or complete
      if (option.nextStepId === null) {
        // End of wizard
        onComplete({
          selections: newSelections,
          finalValue: option.value,
        });
      } else if (option.nextStepId) {
        // Go to specified step
        setCurrentStepId(option.nextStepId);
      } else {
        // Go to next step in sequence
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
          setCurrentStepId(steps[nextIndex].id);
        } else {
          // End of wizard
          onComplete({
            selections: newSelections,
            finalValue: option.value,
          });
        }
      }
    },
    [currentStepId, currentStepIndex, onComplete, selections, steps]
  );

  const handleBack = useCallback(() => {
    if (visitedSteps.length > 0) {
      const previousStepId = visitedSteps[visitedSteps.length - 1];
      // Remove the last selection
      setSelections((prev) => prev.slice(0, -1));
      setCurrentStepId(previousStepId);
    }
  }, [visitedSteps]);

  const handleContinue = useCallback(() => {
    // For info steps, just continue to next
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStepId(steps[nextIndex].id);
    }
  }, [currentStepIndex, steps]);

  if (!currentStep) {
    return null;
  }

  // Get current selection for this step (if revisiting)
  const currentSelection = selections.find((s) => s.stepId === currentStepId);

  return (
    <div
      className={`bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-harken-gray overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-light-border dark:border-harken-gray bg-surface-2 dark:bg-elevation-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-harken-dark dark:text-white">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-harken-gray-med dark:text-slate-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-harken-gray-med hover:text-harken-dark dark:hover:text-white rounded-lg hover:bg-surface-3 dark:hover:bg-elevation-3 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-1 mt-3">
          {steps.map((step, index) => {
            const isCompleted = selections.some((s) => s.stepId === step.id);
            const isCurrent = step.id === currentStepId;

            return (
              <React.Fragment key={step.id}>
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
                    ${
                      isCompleted
                        ? 'bg-accent-teal-mint text-white'
                        : isCurrent
                        ? 'bg-harken-blue text-white'
                        : 'bg-surface-3 dark:bg-elevation-3 text-harken-gray-med'
                    }
                  `}
                >
                  {isCompleted ? <Check size={14} /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      isCompleted
                        ? 'bg-accent-teal-mint'
                        : 'bg-surface-3 dark:bg-elevation-3'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Question */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-harken-dark dark:text-white mb-2">
            {currentStep.question}
          </h4>
          {currentStep.description && (
            <p className="text-sm text-harken-gray dark:text-slate-300">
              {currentStep.description}
            </p>
          )}
        </div>

        {/* Help section (expandable) */}
        {currentStep.helpText && (
          <div className="mb-6">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 text-sm text-harken-blue dark:text-cyan-400 hover:underline"
            >
              <HelpCircle size={16} />
              <span>{showHelp ? 'Hide help' : 'Need help deciding?'}</span>
            </button>
            {showHelp && (
              <div className="mt-3 p-4 bg-harken-blue/5 dark:bg-cyan-500/10 rounded-lg border border-harken-blue/20 dark:border-cyan-500/30 text-sm text-harken-gray dark:text-slate-300 animate-fade-in">
                {currentStep.helpText}
              </div>
            )}
          </div>
        )}

        {/* Options */}
        {currentStep.isInfoStep ? (
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-harken-blue hover:bg-harken-blue-dark text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentStep.options.map((option) => {
              const isSelected = currentSelection?.optionId === option.id;
              const OptionIcon = option.icon;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${
                      isSelected
                        ? 'border-harken-blue bg-harken-blue/5 dark:bg-cyan-500/10'
                        : 'border-light-border dark:border-harken-gray hover:border-harken-blue/50 dark:hover:border-cyan-500/50 bg-surface-1 dark:bg-elevation-1'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {OptionIcon && (
                      <div
                        className={`flex-shrink-0 p-2 rounded-lg ${
                          isSelected
                            ? 'bg-harken-blue/10 dark:bg-cyan-500/20'
                            : 'bg-surface-2 dark:bg-elevation-2'
                        }`}
                      >
                        <OptionIcon
                          className={`w-5 h-5 ${
                            isSelected
                              ? 'text-harken-blue dark:text-cyan-400'
                              : 'text-harken-gray-med dark:text-slate-400'
                          }`}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold ${
                            isSelected
                              ? 'text-harken-blue dark:text-cyan-400'
                              : 'text-harken-dark dark:text-white'
                          }`}
                        >
                          {option.label}
                        </span>
                        <ChevronRight
                          size={18}
                          className={`flex-shrink-0 ${
                            isSelected
                              ? 'text-harken-blue dark:text-cyan-400'
                              : 'text-harken-gray-light dark:text-slate-600'
                          }`}
                        />
                      </div>
                      {option.description && (
                        <p className="text-sm text-harken-gray dark:text-slate-300 mt-1">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with back button */}
      {visitedSteps.length > 0 && (
        <div className="px-6 py-3 border-t border-light-border dark:border-harken-gray bg-surface-2 dark:bg-elevation-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-harken-gray-med dark:text-slate-400 hover:text-harken-dark dark:hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default DecisionWizard;
