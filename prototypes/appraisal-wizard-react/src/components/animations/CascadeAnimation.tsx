/**
 * Cascade Animation - Used for Review finale celebration
 * Waterfall of success elements + trophy reveal
 */
export function CascadeAnimation() {
  // Cascade of checkmarks falling
  const checkmarks = [...Array(20)].map((_, i) => ({
    x: Math.random() * 100,
    delay: i * 80,
    size: 16 + Math.random() * 8,
    duration: 1.5 + Math.random() * 0.5,
  }));

  // Stars that appear and twinkle
  const stars = [...Array(15)].map((_, i) => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    delay: 1500 + i * 100,
    size: 12 + Math.random() * 8,
  }));

  return (
    <div className="relative w-full h-72 overflow-hidden">
      {/* Cascading checkmarks */}
      {checkmarks.map((check, i) => (
        <div
          key={i}
          className="absolute text-green-500"
          style={{
            left: `${check.x}%`,
            top: '-40px',
            fontSize: `${check.size}px`,
            opacity: 0,
            animation: `cascade-fall ${check.duration}s ease-in ${check.delay}ms forwards`,
          }}
        >
          ✓
        </div>
      ))}

      {/* Twinkling stars */}
      {stars.map((star, i) => (
        <div
          key={`star-${i}`}
          className="absolute text-yellow-400"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            fontSize: `${star.size}px`,
            opacity: 0,
            animation: `twinkle 0.5s ease-out ${star.delay}ms forwards, sparkle 1.5s ease-in-out ${star.delay + 500}ms infinite`,
          }}
        >
          ★
        </div>
      ))}

      {/* Central trophy reveal */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: 0,
          transform: 'scale(0.5)',
          animation: 'trophy-reveal 0.8s ease-out 2s forwards',
        }}
      >
        <div className="relative">
          {/* Trophy */}
          <div className="text-8xl filter drop-shadow-lg">🏆</div>
          
          {/* Radiant glow behind trophy */}
          <div 
            className="absolute inset-0 -z-10 bg-yellow-400/20 rounded-full blur-3xl"
            style={{
              animation: 'pulse-glow 2s ease-in-out 2.5s infinite',
            }}
          />
          
          {/* Orbiting particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`orbit-${i}`}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                opacity: 0,
                animation: `orbit-particle 3s linear ${2.5 + i * 0.2}s infinite`,
                '--orbit-angle': `${i * 45}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Success message */}
      <div 
        className="absolute bottom-8 left-0 right-0 text-center"
        style={{
          opacity: 0,
          transform: 'translateY(20px)',
          animation: 'slide-up-fade 0.5s ease-out 2.8s forwards',
        }}
      >
        <div className="text-2xl font-bold text-green-600 mb-1">
          Report Complete!
        </div>
        <div className="text-sm text-gray-600">
          Excellent work on this appraisal
        </div>
      </div>

      {/* Confetti burst at the end */}
      {[...Array(40)].map((_, i) => {
        const colors = ['#0da1c7', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
        return (
          <div
            key={`final-confetti-${i}`}
            className="absolute rounded-sm"
            style={{
              width: `${4 + Math.random() * 4}px`,
              height: `${4 + Math.random() * 4}px`,
              backgroundColor: colors[i % colors.length],
              left: '50%',
              top: '50%',
              opacity: 0,
              animation: `confetti-burst 1.5s ease-out ${3 + Math.random() * 0.5}s forwards`,
              '--burst-x': `${(Math.random() - 0.5) * 300}px`,
              '--burst-y': `${(Math.random() - 0.5) * 200 - 100}px`,
              '--spin': `${Math.random() * 720}deg`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

export default CascadeAnimation;

