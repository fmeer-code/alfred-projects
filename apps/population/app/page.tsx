export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <p className="text-center text-sm text-white/70 mb-4">
          Population of Switzerland (simulation)
        </p>

        <div className="bg-black">
          <svg viewBox="0 0 1000 560" className="w-full h-auto">
            {/* Chart area (no border) */}
            <rect x="90" y="50" width="860" height="420" fill="none" stroke="none" />

            {/* X axis labels */}
            <text x="90" y="510" fill="white" fontSize="12">2025</text>
            <text x="520" y="510" fill="white" fontSize="12" textAnchor="middle">2062</text>
            <text x="950" y="510" fill="white" fontSize="12" textAnchor="end">2100</text>

            {/* Y axis labels */}
            <text x="50" y="470" fill="white" fontSize="12" textAnchor="end">0</text>
            <text x="50" y="260" fill="white" fontSize="12" textAnchor="end">5</text>
            <text x="50" y="60" fill="white" fontSize="12" textAnchor="end">10</text>

            {/* Axis titles */}
            <text x="520" y="545" fill="white" fontSize="12" textAnchor="middle">Year (2025–2100)</text>
            <text x="20" y="260" fill="white" fontSize="12" textAnchor="middle" transform="rotate(-90 20 260)">
              Population (millions)
            </text>

            {/* Empty line placeholder */}
            <path d="M90 470" stroke="white" strokeWidth="2" fill="none" strokeDasharray="6 6" />
          </svg>
        </div>
      </div>
    </main>
  );
}
