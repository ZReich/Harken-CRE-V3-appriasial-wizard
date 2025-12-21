/**
 * Home Animation - Used for Subject Data celebration
 * House outline draws itself, then fills with color
 */
export function HomeAnimation() {
  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      {/* House SVG with drawing animation */}
      <svg 
        className="w-40 h-40"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* Roof - draws first */}
        <path 
          d="M10 50 L50 15 L90 50" 
          className="text-[#0da1c7] animate-draw-line"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ 
            strokeDasharray: 150,
            strokeDashoffset: 150,
            animation: 'draw-line 0.8s ease-out forwards',
          }}
        />
        
        {/* Walls - draws second */}
        <path 
          d="M20 50 L20 85 L80 85 L80 50" 
          className="text-[#0da1c7] animate-draw-line"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ 
            strokeDasharray: 150,
            strokeDashoffset: 150,
            animation: 'draw-line 0.6s ease-out 0.3s forwards',
          }}
        />
        
        {/* Door - draws third */}
        <rect 
          x="40" y="55" width="20" height="30" 
          className="text-green-500"
          rx="2"
          style={{ 
            strokeDasharray: 100,
            strokeDashoffset: 100,
            animation: 'draw-line 0.4s ease-out 0.6s forwards',
          }}
        />
        
        {/* Window left */}
        <rect 
          x="25" y="58" width="10" height="10" 
          className="text-[#0da1c7]"
          style={{ 
            strokeDasharray: 40,
            strokeDashoffset: 40,
            animation: 'draw-line 0.3s ease-out 0.8s forwards',
          }}
        />
        
        {/* Window right */}
        <rect 
          x="65" y="58" width="10" height="10" 
          className="text-[#0da1c7]"
          style={{ 
            strokeDasharray: 40,
            strokeDashoffset: 40,
            animation: 'draw-line 0.3s ease-out 0.9s forwards',
          }}
        />

        {/* Fill effect - appears last */}
        <path 
          d="M50 15 L10 50 L20 50 L20 85 L80 85 L80 50 L90 50 Z" 
          className="text-green-400/30"
          fill="currentColor"
          style={{ 
            opacity: 0,
            animation: 'fade-in 0.5s ease-out 1.2s forwards',
          }}
        />
      </svg>

      {/* Sparkle effects around the house */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            top: `${20 + Math.sin(i * 45 * Math.PI / 180) * 40}%`,
            left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 45}%`,
            opacity: 0,
            animation: `sparkle 0.6s ease-out ${1.5 + i * 0.1}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default HomeAnimation;

