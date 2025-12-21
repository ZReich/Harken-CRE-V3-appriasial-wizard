import { useRef } from 'react';

/**
 * Fireworks Animation - Used for grand Analysis celebration
 * Explosive fireworks with sparks - the BIG dopamine hit
 */
export function FireworksAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Create multiple explosion points
  const explosions = [
    { x: 30, y: 40, delay: 0, color: '#0da1c7' },
    { x: 70, y: 30, delay: 300, color: '#22c55e' },
    { x: 50, y: 50, delay: 600, color: '#f59e0b' },
    { x: 25, y: 60, delay: 900, color: '#ec4899' },
    { x: 75, y: 55, delay: 1200, color: '#8b5cf6' },
  ];

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-64 overflow-hidden"
    >
      {/* Firework explosions */}
      {explosions.map((explosion, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${explosion.x}%`,
            top: `${explosion.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Central burst */}
          <div 
            className="absolute w-4 h-4 rounded-full"
            style={{
              backgroundColor: explosion.color,
              opacity: 0,
              animation: `burst 0.3s ease-out ${explosion.delay}ms forwards`,
            }}
          />

          {/* Radiating particles */}
          {[...Array(12)].map((_, j) => {
            const angle = (j * 30) * Math.PI / 180;
            const distance = 40 + Math.random() * 20;
            
            return (
              <div
                key={j}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: explosion.color,
                  left: '50%',
                  top: '50%',
                  opacity: 0,
                  animation: `explode 0.8s ease-out ${explosion.delay + 100}ms forwards`,
                  '--tx': `${Math.cos(angle) * distance}px`,
                  '--ty': `${Math.sin(angle) * distance}px`,
                } as React.CSSProperties}
              />
            );
          })}

          {/* Trailing sparks */}
          {[...Array(8)].map((_, j) => {
            const angle = (j * 45 + 22.5) * Math.PI / 180;
            const distance = 60 + Math.random() * 30;
            
            return (
              <div
                key={`spark-${j}`}
                className="absolute w-1 h-1 rounded-full bg-yellow-300"
                style={{
                  left: '50%',
                  top: '50%',
                  opacity: 0,
                  animation: `spark-trail 1s ease-out ${explosion.delay + 150}ms forwards`,
                  '--tx': `${Math.cos(angle) * distance}px`,
                  '--ty': `${Math.sin(angle) * distance}px`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      ))}

      {/* Falling stars/confetti effect */}
      {[...Array(30)].map((_, i) => {
        const colors = ['#0da1c7', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];
        return (
          <div
            key={`confetti-${i}`}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              backgroundColor: colors[i % colors.length],
              left: `${Math.random() * 100}%`,
              top: '-10%',
              opacity: 0,
              animation: `fall-spin ${1.5 + Math.random()}s ease-in ${500 + Math.random() * 1500}ms forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}

      {/* "All Complete!" text with glow */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: 0,
          animation: 'fade-scale-in 0.5s ease-out 1.5s forwards',
        }}
      >
        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0da1c7] via-green-500 to-[#0da1c7] animate-shimmer">
          🎉
        </div>
      </div>
    </div>
  );
}

export default FireworksAnimation;

