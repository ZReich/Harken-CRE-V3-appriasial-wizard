/**
 * Chart Animation - Used for per-scenario celebration in Analysis
 * Bar chart bars rise up dramatically
 */
export function ChartAnimation() {
  const bars = [
    { height: 60, delay: 0, color: '#0da1c7' },
    { height: 80, delay: 100, color: '#2fc4b2' },
    { height: 45, delay: 200, color: '#0da1c7' },
    { height: 90, delay: 300, color: '#2fc4b2' },
    { height: 70, delay: 400, color: '#0da1c7' },
  ];

  return (
    <div className="relative w-48 h-48 mx-auto flex items-end justify-center gap-3 pb-4">
      {/* Chart bars */}
      {bars.map((bar, i) => (
        <div
          key={i}
          className="relative w-8 rounded-t-md"
          style={{
            height: 0,
            backgroundColor: bar.color,
            animation: `rise-up 0.6s ease-out ${bar.delay}ms forwards`,
            '--target-height': `${bar.height}%`,
          } as React.CSSProperties}
        >
          {/* Value label */}
          <div 
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-harken-gray"
            style={{
              opacity: 0,
              animation: `fade-in 0.3s ease-out ${bar.delay + 400}ms forwards`,
            }}
          >
            ${Math.round(bar.height * 20)}K
          </div>
          
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-t-md bg-surface-1/30"
            style={{
              opacity: 0,
              animation: `pulse-glow 0.5s ease-out ${bar.delay + 200}ms forwards`,
            }}
          />
        </div>
      ))}

      {/* Baseline */}
      <div 
        className="absolute bottom-4 left-4 right-4 h-0.5 bg-harken-gray-med-lt"
        style={{
          transformOrigin: 'left',
          transform: 'scaleX(0)',
          animation: 'scale-x 0.5s ease-out forwards',
        }}
      />

      {/* Rising sparkles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
          style={{
            bottom: '20%',
            left: `${15 + i * 10}%`,
            opacity: 0,
            animation: `float-up 1s ease-out ${800 + i * 100}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default ChartAnimation;

