export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-semibold text-center">Welcome</h1>
        <p className="text-center text-sm text-white/70 mt-2">Population of Switzerland (simulation)</p>

        <div className="mt-10 bg-black border border-white/20 rounded-lg p-6">
          <svg viewBox="0 0 900 500" className="w-full h-auto">
            {/* Chart area */}
            <rect x="80" y="40" width="760" height="380" fill="none" stroke="white" strokeWidth="2" />

            {/* X axis labels */}
            <text x="80" y="445" fill="white" fontSize="12">2025</text>
            <text x="420" y="445" fill="white" fontSize="12" textAnchor="middle">2062</text>
            <text x="840" y="445" fill="white" fontSize="12" textAnchor="end">2100</text>

            {/* Y axis labels */}
            <text x="40" y="420" fill="white" fontSize="12" textAnchor="end">0</text>
            <text x="40" y="230" fill="white" fontSize="12" textAnchor="end">5</text>
            <text x="40" y="50" fill="white" fontSize="12" textAnchor="end">10</text>

            {/* Axis titles */}
            <text x="460" y="485" fill="white" fontSize="12" textAnchor="middle">Year (2025–2100)</text>
            <text x="15" y="230" fill="white" fontSize="12" textAnchor="middle" transform="rotate(-90 15 230)">
              Population (millions)
            </text>

            {/* Empty line placeholder */}
            <path d="M80 420" stroke="white" strokeWidth="2" fill="none" strokeDasharray="6 6" />
          </svg>
        </div>
      </div>
    </main>
  );
}
