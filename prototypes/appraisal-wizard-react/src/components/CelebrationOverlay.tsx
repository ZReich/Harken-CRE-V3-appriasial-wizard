import { useEffect, useMemo } from 'react';
import { useCelebration } from '../hooks/useCelebration';
import { 
  GearsAnimation, 
  HomeAnimation, 
  ChartAnimation, 
  FireworksAnimation, 
  CascadeAnimation 
} from './animations';
import type { AnimationType, CelebrationLevel } from '../constants/completionSchema';

interface OverlayConfig {
  size: string;         // Tailwind max-width class
  backdrop: string;     // Backdrop opacity
  padding: string;
}

const OVERLAY_CONFIG: Record<CelebrationLevel, OverlayConfig> = {
  none: { size: 'max-w-0', backdrop: 'bg-black/0', padding: 'p-0' },
  small: { size: 'max-w-md', backdrop: 'bg-black/30', padding: 'p-6' },
  medium: { size: 'max-w-lg', backdrop: 'bg-black/40', padding: 'p-8' },
  large: { size: 'max-w-xl', backdrop: 'bg-black/50', padding: 'p-10' },
  grand: { size: 'max-w-3xl', backdrop: 'bg-black/60', padding: 'p-12' },
  finale: { size: 'max-w-4xl', backdrop: 'bg-black/70', padding: 'p-12' },
};

function getAnimationComponent(type: AnimationType) {
  switch (type) {
    case 'gears':
      return <GearsAnimation />;
    case 'home':
      return <HomeAnimation />;
    case 'chart':
      return <ChartAnimation />;
    case 'fireworks':
      return <FireworksAnimation />;
    case 'cascade':
      return <CascadeAnimation />;
    default:
      return null;
  }
}

export function CelebrationOverlay() {
  const { celebrationData, dismissCelebration } = useCelebration();
  const { isVisible, level, animationType, duration, title, subtitle } = celebrationData;

  const config = useMemo(() => OVERLAY_CONFIG[level] || OVERLAY_CONFIG.none, [level]);

  // Handle escape key to dismiss
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissCelebration();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, dismissCelebration]);
  
  if (!isVisible || level === 'none') return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${config.backdrop} animate-fade-in`}
      onClick={dismissCelebration}
    >
      {/* Main celebration card */}
      <div 
        className={`bg-surface-1 rounded-2xl shadow-2xl ${config.size} w-full mx-4 ${config.padding} transform animate-scale-bounce`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animation area */}
        <div className="mb-6">
          {getAnimationComponent(animationType)}
        </div>

        {/* Text content */}
        <div className="text-center">
          <h2 className={`font-bold text-harken-gray mb-2 ${
            level === 'grand' || level === 'finale' ? 'text-3xl' : 
            level === 'large' ? 'text-2xl' : 'text-xl'
          }`}>
            {title}
          </h2>
          <p className="text-harken-gray">{subtitle}</p>
        </div>

        {/* Progress indicator / timer */}
        <div className="mt-6">
          <div className="h-1 bg-harken-gray-light rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#0da1c7] to-green-500 rounded-full"
              style={{
                animation: `shrink-width ${duration}s linear forwards`,
              }}
            />
          </div>
        </div>

        {/* Dismiss hint */}
        <p className="text-center text-xs text-harken-gray-med mt-4">
          Click anywhere or press Esc to continue
        </p>
      </div>
    </div>
  );
}

export default CelebrationOverlay;

