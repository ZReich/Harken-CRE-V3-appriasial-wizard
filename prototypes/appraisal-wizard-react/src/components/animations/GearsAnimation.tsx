/**
 * Gears Animation - Used for Setup section celebration
 * Two interlocking gears that spin and click into place
 */
export function GearsAnimation() {
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Large gear */}
      <svg 
        className="absolute top-0 left-0 w-32 h-32 text-[#0da1c7] animate-spin-slow"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M50 10 L55 25 L65 20 L60 35 L75 35 L65 45 L80 50 L65 55 L75 65 L60 65 L65 80 L55 75 L50 90 L45 75 L35 80 L40 65 L25 65 L35 55 L20 50 L35 45 L25 35 L40 35 L35 20 L45 25 Z" />
        <circle cx="50" cy="50" r="15" className="text-white" fill="currentColor" />
      </svg>
      
      {/* Small gear - counter-rotating */}
      <svg 
        className="absolute bottom-2 right-2 w-24 h-24 text-green-500 animate-spin-slow-reverse"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M50 15 L55 28 L68 23 L62 38 L78 40 L65 50 L78 60 L62 62 L68 77 L55 72 L50 85 L45 72 L32 77 L38 62 L22 60 L35 50 L22 40 L38 38 L32 23 L45 28 Z" />
        <circle cx="50" cy="50" r="12" className="text-white" fill="currentColor" />
      </svg>

      {/* Spark effect when gears "click" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-spark"
            style={{
              animationDelay: `${i * 150 + 500}ms`,
              transform: `rotate(${i * 60}deg) translateY(-30px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default GearsAnimation;

