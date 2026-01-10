// src/components/guidance/index.ts
// Export all guidance components

export { InfoTooltip } from './InfoTooltip';
export type { TooltipVariant, TooltipPosition } from './InfoTooltip';

export { InlineHelp } from './InlineHelp';
export type { InlineHelpVariant } from './InlineHelp';

export { DecisionWizard } from './DecisionWizard';
export type { DecisionStep, DecisionOption, DecisionResult } from './DecisionWizard';

export { GuidanceProvider, useGuidance, useGuidanceHint } from './GuidanceProvider';
export type { GuidanceTopic, GuidanceHint } from './GuidanceProvider';

export { WelcomeModal } from './WelcomeModal';

export { ContextualHint } from './ContextualHint';

// Content exports
export * from './content';
