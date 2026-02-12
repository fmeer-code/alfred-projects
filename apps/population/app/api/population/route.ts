import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function loadConfig() {
  const cfgPath = path.resolve(process.cwd(), "config.json");
  const raw = fs.readFileSync(cfgPath, "utf8");
  return JSON.parse(raw);
}

function simulateByAges(initialPop: number, fertility: number, lifespan: number, startYear: number, endYear: number) {
  const years: number[] = [];
  const values: number[] = [];
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

export async function GET() {
  const cfg = loadConfig();

  const total0 = Number(cfg.initialPopulation);
  const totalFert = Number(cfg.fertilityRate);
  const lifespan = Number(cfg.lifespan);
  const startYear = Number(cfg.startYear);
  const endYear = Number(cfg.endYear);

  const muslimInit = cfg.muslimInitialPopulation ? Number(cfg.muslimInitialPopulation) : null;
  const muslimShare = Number(cfg.muslimShare ?? 0);
  const muslim0 = muslimInit !== null ? muslimInit : total0 * muslimShare;
  const muslimFert = Number(cfg.muslimFertility ?? totalFert);
  const non0 = total0 - muslim0;
  const nonFert = totalFert;

  const total = simulateByAges(total0, totalFert, lifespan, startYear, endYear);
  const muslim = simulateByAges(muslim0, muslimFert, lifespan, startYear, endYear);
  const nonMuslim = simulateByAges(non0, nonFert, lifespan, startYear, endYear);

  return NextResponse.json({
    years: total.years,
    total: total.values,
    muslim: muslim.values,
    nonMuslim: nonMuslim.values,
  });
}
