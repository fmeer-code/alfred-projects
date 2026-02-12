import { NextResponse } from "next/server";

const START_YEAR = 2025;
const END_YEAR = 2100;
const LIFESPAN = 80;
const initialPopulation = 8.9e6;
const fertilityRate = 2.0;

function simulate() {
  const years: number[] = [];
  const values: number[] = [];
  const ages = new Array(LIFESPAN).fill(initialPopulation / LIFESPAN);

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    years.push(year);
    values.push(ages.reduce((s, v) => s + v, 0));

    const females30 = ages[30] * 0.5;
    const births = females30 * fertilityRate;

    for (let a = LIFESPAN - 1; a >= 1; a--) ages[a] = ages[a - 1];
    ages[0] = births;
  }

  return { years, values };
}

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(simulate());
}
