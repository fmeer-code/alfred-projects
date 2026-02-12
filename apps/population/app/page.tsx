const START_YEAR = 2025;
const END_YEAR = 2100;
const LIFESPAN = 80;

const initialPopulation = 8.9e6; // estimate
const fertilityRate = 2.0; // children per 30y female (test)

function simulatePopulationByAges() {
  const years: number[] = [];
  const values: number[] = [];

  // initialize ages array: uniform distribution
  const ages = new Array(LIFESPAN).fill(initialPopulation / LIFESPAN);

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    years.push(year);
    const population = ages.reduce((s, v) => s + v, 0);
    values.push(population);

    // births come from 30-year-old females (age index 30)
    const females30 = ages[30] * 0.5; // assume 50% female
    const births = females30 * fertilityRate;

    // shift ages up by one year: ages[79] die (dropped)
    for (let a = LIFESPAN - 1; a >= 1; a--) {
      ages[a] = ages[a - 1];
    }
    ages[0] = births; // newborn cohort
  }

  return { years, values };
}

function buildPath(values: number[], width: number, height: number, padding: { l: number; r: number; t: number; b: number }) {
  const { l, r, t, b } = padding;
  const innerW = width - l - r;
  const innerH = height - t - b;

  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const range = maxY - minY || 1;

  return values
    .map((v, i) => {
      const x = l + (innerW * i) / (values.length - 1);
      const y = t + innerH - ((v - minY) / range) * innerH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function Home() {
  const { years, values } = simulatePopulationByAges();
  const valuesM = values.map((v) => v / 1e6);

  const W = 1000;
  const H = 560;
  const pad = { l: 110, r: 40, t: 50, b: 90 };

  const path = buildPath(valuesM, W, H, pad);
  const maxPop = Math.max(...valuesM);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-6xl mx-auto">
        <p className="text-center text-xl text-white/70 mt-2 mb-2">
          Population of Switzerland (simulation)
        </p>

        <div className="flex flex-col items-center">
          <div className="text-center text-base text-white/80 mb-6 space-y-2">
            <div>Population (estimate): ~8.9 million</div>
            <div>Fertility rate (estimate): ~2.0</div>
            <div>Muslim population (estimate): ~0.55 million</div>
            <div>Muslim fertility rate (estimate): ~2.0</div>
          </div>

          <div className="bg-black w-full">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              {/* X axis labels */}
              <text x="110" y="510" fill="white" fontSize="26">2025</text>
              <text x="390" y="510" fill="white" fontSize="26" textAnchor="middle">2050</text>
              <text x="680" y="510" fill="white" fontSize="26" textAnchor="middle">2075</text>
              <text x="960" y="510" fill="white" fontSize="26" textAnchor="end">2100</text>

              {/* Y axis labels (0, mid, max) */}
              <text x="80" y="470" fill="white" fontSize="26" textAnchor="end">0</text>
              <text x="80" y="260" fill="white" fontSize="26" textAnchor="end">{(maxPop / 2).toFixed(1)}</text>
              <text x="80" y="60" fill="white" fontSize="26" textAnchor="end">{maxPop.toFixed(1)}</text>

              {/* Axis titles */}
              <text x="520" y="545" fill="white" fontSize="26" textAnchor="middle">Year (2025–2100)</text>
              <text x="30" y="260" fill="white" fontSize="26" textAnchor="middle" transform="rotate(-90 30 260)">
                Population (millions)
              </text>

              {/* Simulated line (values in millions) */}
              <path d={path} stroke="white" strokeWidth="3" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
