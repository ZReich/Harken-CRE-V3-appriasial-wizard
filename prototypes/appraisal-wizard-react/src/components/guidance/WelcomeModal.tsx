// src/components/guidance/WelcomeModal.tsx
// First-time user welcome modal with feature overview

import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Building,
  Home,
  TreeDeciduous,
  Sparkles,
} from 'lucide-react';
import { useGuidance } from './GuidanceProvider';

interface WelcomeModalProps {
  /** Force show (override first-time check) */
  forceShow?: boolean;
  /** Callback when modal is closed */
  onClose?: () => void;
}

const FEATURES = [
  {
    Icon: Layers,
    title: 'Property Components',
    description:
      'Analyze mixed-use properties by defining each component separately. Perfect for retail + apartments, nurseries with mobile home pads, and more.',
    color: 'text-harken-blue dark:text-cyan-400',
    bgColor: 'bg-harken-blue/10 dark:bg-cyan-500/20',
  },
  {
    Icon: DollarSign,
    title: 'Flexible Income Analysis',
    description:
      'Choose between commercial and residential rent comparable modes. Link individual income lines directly to supporting rent comps.',
    color: 'text-accent-teal-mint dark:text-green-400',
    bgColor: 'bg-accent-teal-mint/10 dark:bg-green-500/20',
  },
  {
    Icon: TreeDeciduous,
    title: 'Land Classification',
    description:
      'Properly classify excess and surplus land for accurate valuation. Land comparables are now integrated within Sales Comparison.',
    color: 'text-lime-600 dark:text-lime-400',
    bgColor: 'bg-lime-100 dark:bg-lime-500/20',
  },
];

const CATEGORIES = [
  { Icon: Building, label: 'Commercial', color: 'text-harken-blue' },
  { Icon: Home, label: 'Residential', color: 'text-accent-teal-mint' },
  { Icon: TreeDeciduous, label: 'Land', color: 'text-lime-600' },
];

export function WelcomeModal({ forceShow = false, onClose }: WelcomeModalProps) {
  const { isFirstTimeUser, markNotFirstTime, isEnabled } = useGuidance();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Show modal for first-time users or when forced
  useEffect(() => {
    if (forceShow || (isFirstTimeUser && isEnabled)) {
      // Small delay for smooth animation
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [forceShow, isFirstTimeUser, isEnabled]);

  const handleClose = () => {
    setIsVisible(false);
    markNotFirstTime();
    onClose?.();
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-surface-0 dark:bg-elevation-0 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-harken-gray-med hover:text-harken-dark dark:hover:text-white rounded-lg hover:bg-surface-2 dark:hover:bg-elevation-2 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-harken-blue/5 via-accent-teal-mint/5 to-lime-50 dark:from-cyan-900/20 dark:via-green-900/20 dark:to-lime-900/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-harken-blue/10 dark:bg-cyan-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-harken-blue dark:text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-harken-dark dark:text-white">
              Welcome to Harken Appraisal Wizard
            </h2>
          </div>
          <p className="text-harken-gray dark:text-slate-300 max-w-lg">
            Powerful new features for analyzing complex properties. Here's what's new:
          </p>

          {/* Category badges */}
          <div className="flex items-center gap-3 mt-4">
            {CATEGORIES.map(({ Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-1 dark:bg-elevation-1 rounded-full border border-light-border dark:border-harken-gray"
              >
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-medium text-harken-gray dark:text-slate-300">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content - Step based */}
        <div className="px-8 py-6">
          {currentStep === 0 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-semibold text-harken-dark dark:text-white mb-4">
                New Features Overview
              </h3>
              <div className="space-y-4">
                {FEATURES.map(({ Icon, title, description, color, bgColor }) => (
                  <div
                    key={title}
                    className="flex items-start gap-4 p-4 bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-harken-gray"
                  >
                    <div className={`flex-shrink-0 p-2 rounded-lg ${bgColor}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-harken-dark dark:text-white mb-1">
                        {title}
                      </h4>
                      <p className="text-sm text-harken-gray dark:text-slate-300">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-semibold text-harken-dark dark:text-white mb-4">
                How Property Components Work
              </h3>
              <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl p-6 border border-light-border dark:border-harken-gray">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-harken-blue text-white flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-harken-dark dark:text-white">
                        Define Your Primary Component
                      </h4>
                      <p className="text-sm text-harken-gray dark:text-slate-300 mt-1">
                        Start with the main use of the property (e.g., retail storefront).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-teal-mint text-white flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-harken-dark dark:text-white">
                        Add Secondary Components
                      </h4>
                      <p className="text-sm text-harken-gray dark:text-slate-300 mt-1">
                        Add apartments upstairs, excess land, or other income sources.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-600 text-white flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-harken-dark dark:text-white">
                        Automatic Value Aggregation
                      </h4>
                      <p className="text-sm text-harken-gray dark:text-slate-300 mt-1">
                        Values are automatically combined with clear reconciliation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-semibold text-harken-dark dark:text-white mb-4">
                Ready to Start
              </h3>
              <div className="bg-gradient-to-br from-accent-teal-mint/10 to-harken-blue/10 dark:from-green-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-accent-teal-mint/20 dark:border-green-500/30">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 p-3 bg-accent-teal-mint/20 dark:bg-green-500/30 rounded-full">
                    <CheckCircle className="w-8 h-8 text-accent-teal-mint dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-harken-dark dark:text-white mb-1">
                      You're All Set!
                    </h4>
                    <p className="text-sm text-harken-gray dark:text-slate-300">
                      Look for the{' '}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-harken-blue/10 dark:bg-cyan-500/20 rounded text-harken-blue dark:text-cyan-400 text-xs font-medium">
                        <Sparkles size={12} /> Help
                      </span>{' '}
                      tooltips throughout the wizard for contextual guidance.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-harken-gray-med dark:text-slate-400 mt-4 text-center">
                You can always access this guide from the Help menu.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentStep === step
                    ? 'bg-harken-blue dark:bg-cyan-400'
                    : 'bg-surface-3 dark:bg-elevation-3 hover:bg-harken-blue/50'
                }`}
                aria-label={`Go to step ${step + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm text-harken-gray-med dark:text-slate-400 hover:text-harken-dark dark:hover:text-white transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-harken-blue hover:bg-harken-blue-dark text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {currentStep === 2 ? (
                <>
                  Get Started
                  <CheckCircle size={18} />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
