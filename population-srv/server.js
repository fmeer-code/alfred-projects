const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cfgPath = path.resolve(__dirname, 'config.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  } catch (e) {
    return {
      total_population: 9051029,
      percentage_population_non_western_culture: 0.0738,
      net_migration_per_year: 82800,
      percentage_migrants_from_non_western_culture: 0.17,
      fertility_rates: {
        non_western_background: 1.74,
        western_native_background: 1.21,
      },
      lifespan: 80,
      startYear: 2025,
      endYear: 2100,
    };
  }
}

function simulateByAges(initialPop, fertility, lifespan, startYear, endYear, migrantsPerYear = 0, migrantAgeStart = 20, migrantAgeEnd = 40) {
  const years = [];
  const values = [];
  const ages = new Array(lifespan).fill(initialPop / lifespan);

  // clamp age range
  const startAge = Math.max(0, Math.min(lifespan - 1, migrantAgeStart));
  const endAge = Math.max(0, Math.min(lifespan - 1, migrantAgeEnd));
  const migrantSpan = endAge >= startAge ? (endAge - startAge + 1) : 0;

  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
    values.push(ages.reduce((s, v) => s + v, 0));

    const females30 = ages[30] * 0.5;
    const births = females30 * fertility;

    // add migrants for this year distributed uniformly across the chosen age band
    if (migrantsPerYear && migrantSpan > 0) {
      const perAge = migrantsPerYear / migrantSpan;
      for (let a = startAge; a <= endAge; a++) ages[a] += perAge;
    }

    // age the population
    for (let a = lifespan - 1; a >= 1; a--) ages[a] = ages[a - 1];
    ages[0] = births;
  }
  return { years, values };
}

app.use(express.static(path.join(__dirname, 'static')));
// expose config.json via HTTP so the static UI can read parameters
app.get('/config.json', (req, res) => {
  try {
    const cfg = loadConfig();
    res.json(cfg);
  } catch (e) {
    res.status(500).json({ error: 'failed to load config' });
  }
});

app.get('/api/population', (req, res) => {
  const cfg = loadConfig();
  const total0 = Number(cfg.total_population ?? cfg.initialPopulation ?? 0);
  const nonWesternShare = Number(cfg.percentage_population_non_western_culture ?? 0);
  const lifespan = Number(cfg.lifespan);
  const startYear = Number(cfg.startYear);
  const endYear = Number(cfg.endYear);

  const nonWestern0 = total0 * nonWesternShare;
  const western0 = total0 - nonWestern0;

  const fertNonWestern = Number((cfg.fertility_rates && cfg.fertility_rates.non_western_background) ?? cfg.fertilityRate ?? 1.4);
  const fertWestern = Number((cfg.fertility_rates && cfg.fertility_rates.western_native_background) ?? cfg.fertilityRate ?? 1.4);

  // migration totals from config; can be overridden by ?migration=off
  let migrationTotal = Number(cfg.net_migration_per_year ?? cfg.migrationPerYear ?? 0);
  const migrantNonWesternShare = Number(cfg.percentage_migrants_from_non_western_culture ?? cfg.muslimMigrantsShare ?? 0);
  if (req.query && String(req.query.migration).toLowerCase() === 'off') migrationTotal = 0;
  const migrantsNonWesternPerYear = migrationTotal * migrantNonWesternShare;
  const migrantsWesternPerYear = migrationTotal - migrantsNonWesternPerYear;

  // simulate non-western and western separately, adding migrants concentrated in ages 20-40
  const nonWestern = simulateByAges(nonWestern0, fertNonWestern, lifespan, startYear, endYear, migrantsNonWesternPerYear, 20, 40);
  const western = simulateByAges(western0, fertWestern, lifespan, startYear, endYear, migrantsWesternPerYear, 20, 40);

  // total is element-wise sum
  const years = nonWestern.years;
  const totalValues = nonWestern.values.map((v, i) => v + western.values[i]);

  res.json({ years, total: totalValues, nonWestern: nonWestern.values, western: western.values });
});

const port = process.env.PORT || 3002;
app.listen(port, '127.0.0.1', () => {
  console.log('population-srv listening on', port);
});
