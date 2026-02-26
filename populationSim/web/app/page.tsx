import fs from 'fs';
import path from 'path';

function loadConfig() {
  try {
    const cfgPath = path.resolve(process.cwd(), 'config.json');
    const raw = fs.readFileSync(cfgPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {
      initialPopulation: 8900000,
      fertilityRate: 1.4,
      lifespan: 80,
      startYear: 2025,
      endYear: 2100,
      muslimShare: 0.062, // ~0.55 / 8.9
      muslimFertility: 2.0,
    };
  }
}

function simulateByAges(initialPop: number, fertility: number, lifespan: number, startYear: number, endYear: number) {
  const years = [];
  const values = [];
  const ages = new Array(lifespan).fill(initialPop / lifespan);
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
    values.push(ages.reduce((s, v) => s + v, 0));
    const females30 = ages[30] * 0.5;
    const births = females30 * fertility;
    for (let a = lifespan - 1; a >= 1; a--) ages[a] = ages[a - 1];
    ages[0] = births;
  }
  return { years, values };
}

function buildPath(values: number[], width: number, height: number, padding: { l: number; r: number; t: number; b: number }, maxY: number) {
  const { l, r, t, b } = padding;
  const innerW = width - l - r;
  const innerH = height - t - b;
  const minY = 0;
  const top = Math.max(maxY, 1e-9);

  return values
    .map((v, i) => {
      const x = l + (innerW * i) / (values.length - 1);
      const y = t + innerH - ((v - minY) / (top - minY)) * innerH;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export default function Home() {
  const cfg = loadConfig();
  const START_YEAR = cfg.startYear;
  const END_YEAR = cfg.endYear;
  const LIFESPAN = cfg.lifespan;
  const total0 = cfg.initialPopulation;
  const totalFert = cfg.fertilityRate;
  const muslimInit = cfg.muslimInitialPopulation ?? null;
  const muslimShare = cfg.muslimShare ?? 0.062;
  const muslim0 = muslimInit !== null ? Number(muslimInit) : total0 * muslimShare;
  const muslimFert = cfg.muslimFertility ?? cfg.fertilityRate;
  const nonMuslim0 = total0 - muslim0;
  const nonMuslimFert = totalFert; // assume same unless configured

  const simTotal = simulateByAges(total0, totalFert, LIFESPAN, START_YEAR, END_YEAR);
  const simMuslim = simulateByAges(muslim0, muslimFert, LIFESPAN, START_YEAR, END_YEAR);
  const simNon = simulateByAges(nonMuslim0, nonMuslimFert, LIFESPAN, START_YEAR, END_YEAR);

  const valuesM = simTotal.values.map((v) => v / 1e6);
  const valuesMusM = simMuslim.values.map((v) => v / 1e6);
  const valuesNonM = simNon.values.map((v) => v / 1e6);

  const W = 1000;
  const H = 560;
  const pad = { l: 110, r: 40, t: 50, b: 90 };

  const maxPop = Math.max(...valuesM, ...valuesMusM, ...valuesNonM);
  const midPop = maxPop / 2;

  const pathTotal = buildPath(valuesM, W, H, pad, maxPop);
  const pathMus = buildPath(valuesMusM, W, H, pad, maxPop);
  const pathNon = buildPath(valuesNonM, W, H, pad, maxPop);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-6xl mx-auto">
        <p className="text-center text-xl text-white/70 mt-2 mb-2">Population of Switzerland (simulation)</p>
        <div className="flex flex-col items-center">
          <div className="text-center text-base text-white/80 mb-6 space-y-2">
            <div>Population (estimate): ~8.9 million</div>
            <div>Fertility rate (estimate): ~1.4</div>
            <div>Muslim population (estimate): ~0.55 million</div>
            <div>Muslim fertility rate (estimate): ~2.0</div>
          </div>
          <div className="bg-black w-full">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <text x="110" y="510" fill="white" fontSize="26">2025</text>
              <text x="390" y="510" fill="white" fontSize="26" textAnchor="middle">2050</text>
              <text x="680" y="510" fill="white" fontSize="26" textAnchor="middle">2075</text>
              <text x="960" y="510" fill="white" fontSize="26" textAnchor="end">2100</text>
              <text x="80" y="470" fill="white" fontSize="26" textAnchor="end">0</text>
              <text x="80" y="260" fill="white" fontSize="26" textAnchor="end">{midPop.toFixed(1)}</text>
              <text x="80" y="60" fill="white" fontSize="26" textAnchor="end">{maxPop.toFixed(1)}</text>
              <text x="520" y="545" fill="white" fontSize="26" textAnchor="middle">Year (2025–2100)</text>
              <text x="30" y="260" fill="white" fontSize="26" textAnchor="middle" transform="rotate(-90 30 260)">Population (millions)</text>

              {/* Non-Muslim (dashed) */}
              <path d={pathNon} stroke="#a0a0a0" strokeWidth="2" fill="none" strokeDasharray="8 6" />
              {/* Muslim (colored) */}
              <path d={pathMus} stroke="#ffd700" strokeWidth="2" fill="none" />
              {/* Total (white) */}
              <path d={pathTotal} stroke="white" strokeWidth="3" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
