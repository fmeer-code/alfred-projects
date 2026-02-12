import fs from 'fs';
import path from 'path';

const cfgPath = path.resolve(process.cwd(), 'config.json');
function loadConfig() {
  try {
    const raw = fs.readFileSync(cfgPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {
      initialPopulation: 8.9e6,
      fertilityRate: 1.4,
      lifespan: 80,
      startYear: 2025,
      endYear: 2100,
    };
  }
}

function simulatePopulationByAges() {
  const cfg = loadConfig();
  const START_YEAR = cfg.startYear;
  const END_YEAR = cfg.endYear;
  const LIFESPAN = cfg.lifespan;
  const initialPopulation = cfg.initialPopulation;
  const fertilityRate = cfg.fertilityRate;
  const years: number[] = [];
  const values: number[] = [];

  const ages = new Array(LIFESPAN).fill(initialPopulation / LIFESPAN);

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    years.push(year);
    values.push(ages.reduce((s, v) => s + v, 0));

    const females30 = ages[30] * 0.5;
    const births = females30 * fertilityRate;

    for (let a = LIFESPAN - 1; a >= 1; a--) {
      ages[a] = ages[a - 1];
    }
    ages[0] = births;
  }

  return { years, values };
}

function buildPath(
  values: number[],
  width: number,
  height: number,
  padding: { l: number; r: number; t: number; b: number }
) {
  const { l, r, t, b } = padding;
  const innerW = width - l - r;
  const innerH = height - t - b;

  // Always chart from 0..max for readability.
  const minY = 0;
  const maxY = Math.max(...values, 1);

  return values
    .map((v, i) => {
      const x = l + (innerW * i) / (values.length - 1);
      const y = t + innerH - ((v - minY) / (maxY - minY)) * innerH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export const dynamic = "force-dynamic";

export default function Home() {
  const { values } = simulatePopulationByAges();
  const valuesM = values.map((v) => v / 1e6);

  const W = 1000;
  const H = 560;
  const pad = { l: 110, r: 40, t: 50, b: 90 };

  const maxPop = Math.max(...valuesM);
  const midPop = maxPop / 2;
  const path = buildPath(valuesM, W, H, pad);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-6xl mx-auto">
        <p className="text-center text-xl text-white/70 mt-2 mb-2">
          Population of Switzerland (simulation)
        </p>

        <div className="flex flex-col items-center">
          <div className="text-center text-base text-white/80 mb-6 space-y-2">
            <div>Population (estimate): ~8.9 million</div>
            <div>Fertility rate (estimate): ~1.4</div>
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
              <text x="80" y="260" fill="white" fontSize="26" textAnchor="end">{midPop.toFixed(1)}</text>
              <text x="80" y="60" fill="white" fontSize="26" textAnchor="end">{maxPop.toFixed(1)}</text>

              {/* Axis titles */}
              <text x="520" y="545" fill="white" fontSize="26" textAnchor="middle">Year (2025–2100)</text>
              <text x="30" y="260" fill="white" fontSize="26" textAnchor="middle" transform="rotate(-90 30 260)">
                Population (millions)
              </text>

              {/* Simulated line */}
              <path d={path} stroke="white" strokeWidth="3" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
