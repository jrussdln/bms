export default function Loading({ message = false }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        {/* Coin */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full
                     bg-gradient-to-b from-yellow-300 to-yellow-500
                     border border-yellow-600 shadow-sm"
          style={{ animation: "coin-drop 1.4s cubic-bezier(0.6,0,0.8,0) infinite" }}
        />

        {/* Piggy bank */}
        <svg
          viewBox="0 0 64 64"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14"
          style={{ animation: "piggy-bounce 1.4s ease-in-out infinite" }}
        >
          <ellipse cx="32" cy="54" rx="20" ry="3" fill="#000" opacity="0.08" />
          <ellipse cx="30" cy="36" rx="22" ry="16" fill="#f472b6" />
          <circle cx="50" cy="30" r="8" fill="#f472b6" />
          <ellipse cx="54" cy="32" rx="4" ry="3" fill="#ec4899" />
          <circle cx="53" cy="31" r="0.8" fill="#831843" />
          <circle cx="55.5" cy="31" r="0.8" fill="#831843" />
          <path d="M44 21 L48 14 L51 22 Z" fill="#ec4899" />
          <circle cx="46" cy="27" r="1.6" fill="#1f2937" />
          <rect x="14" y="48" width="5" height="8" rx="2" fill="#ec4899" />
          <rect x="42" y="48" width="5" height="8" rx="2" fill="#ec4899" />
          <rect x="22" y="18" width="14" height="3" rx="1.5" fill="#831843" />
          <path
            d="M8 32 q-5 -2 -3 -6 q2 -3 5 0"
            stroke="#ec4899"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {message && (
        <p className="mt-3 text-xs font-medium text-gray-500 tracking-wide animate-pulse">
          Loading...
        </p>
      )}

      <style>{`
        @keyframes coin-drop {
          0% { top: -8px; opacity: 1; transform: translateX(-50%) rotateY(0deg); }
          55% { top: 18px; opacity: 1; transform: translateX(-50%) rotateY(360deg); }
          60% { opacity: 0; }
          100% { top: 18px; opacity: 0; }
        }
        @keyframes piggy-bounce {
          0%, 50% { transform: translateX(-50%) translateY(0); }
          58% { transform: translateX(-50%) translateY(1.5px) scale(1.02, 0.97); }
          66% { transform: translateX(-50%) translateY(0); }
          100% { transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}