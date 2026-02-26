const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cfgPath = path.resolve(__dirname, 'config.json');
const countriesDir = path.resolve(__dirname, 'countries');
const countriesIndexPath = path.join(countriesDir, 'index.json');

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

function loadCountriesIndex() {
  return JSON.parse(fs.readFileSync(countriesIndexPath, 'utf8'));
}

function loadCountryConfig(slug) {
  const filePath = path.join(countriesDir, `${slug}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateCountryConfig(cfg) {
  const errors = [];
  const numericFields = [
    'total_population',
    'percentage_population_non_western_culture',
    'net_migration_per_year',
    'percentage_migrants_from_non_western_culture',
    'lifespan',
    'startYear',
    'endYear',
  ];
  numericFields.forEach((field) => {
    const value = Number(cfg[field]);
    if (!Number.isFinite(value)) errors.push({ field, issue: 'must be a number' });
  });
  if (!cfg.fertility_rates || !Number.isFinite(Number(cfg.fertility_rates.non_western_background))) {
    errors.push({ field: 'fertility_rates.non_western_background', issue: 'must be a number' });
  }
  if (!cfg.fertility_rates || !Number.isFinite(Number(cfg.fertility_rates.western_native_background))) {
    errors.push({ field: 'fertility_rates.western_native_background', issue: 'must be a number' });
  }
  const shareFields = [
    'percentage_population_non_western_culture',
    'percentage_migrants_from_non_western_culture',
  ];
  shareFields.forEach((field) => {
    const value = Number(cfg[field]);
    if (Number.isFinite(value) && (value < 0 || value > 1)) {
      errors.push({ field, issue: 'must be between 0 and 1' });
    }
  });
  return errors;
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
    const countriesIndex = loadCountriesIndex();
    const cfg = loadCountryConfig(countriesIndex.default);
    res.json(cfg);
  } catch (e) {
    res.status(500).json({ error: 'failed to load config' });
  }
});

app.get('/api/countries', (req, res) => {
  try {
    const countriesIndex = loadCountriesIndex();
    res.json(countriesIndex);
  } catch (e) {
    res.status(500).json({ error: 'failed to load countries index', code: 'COUNTRIES_INDEX_FAILED' });
  }
});

app.get('/api/population', (req, res) => {
  let countriesIndex;
  try {
    countriesIndex = loadCountriesIndex();
  } catch (e) {
    return res.status(500).json({ error: 'failed to load countries index', code: 'COUNTRIES_INDEX_FAILED' });
  }

  const available = (countriesIndex.countries || []).map((c) => c.slug);
  const requested = req.query && req.query.country !== undefined ? String(req.query.country).trim() : '';
  const slug = requested || countriesIndex.default;
  if (!slug || !available.includes(slug)) {
    return res.status(400).json({
      error: 'unknown country',
      code: 'COUNTRY_NOT_FOUND',
      received: requested || null,
      available,
    });
  }

  let cfg;
  try {
    cfg = loadCountryConfig(slug);
  } catch (e) {
    return res.status(500).json({ error: 'failed to load country config', code: 'COUNTRY_CONFIG_FAILED', slug });
  }

  const validationErrors = validateCountryConfig(cfg);
  if (validationErrors.length) {
    return res.status(500).json({
      error: 'invalid country config',
      code: 'INVALID_CONFIG',
      slug,
      details: validationErrors,
    });
  }

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

  const countryMeta = (countriesIndex.countries || []).find((c) => c.slug === slug) || { slug: cfg.slug, name: cfg.name };
  res.json({
    country: countryMeta,
    params: cfg,
    sources: cfg.data_sources_and_years,
    years,
    total: totalValues,
    nonWestern: nonWestern.values,
    western: western.values,
  });
});

const port = process.env.PORT || 3002;
app.listen(port, '127.0.0.1', () => {
  console.log('population-srv listening on', port);
});
