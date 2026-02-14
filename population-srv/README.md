# population-srv

Small population simulation server (multi-country).

## Endpoints

- `GET /api/countries` → list + default country
- `GET /api/population?country=<slug>` → population series for a country
- `GET /api/country?slug=<slug>` → country parameters
- `GET /config.json` → legacy single-country config

## Adding a country

1. Add `countries/<slug>.json` with the required fields.
2. Update `countries/index.json` with `{ slug, name, startYear, endYear, hasSources }`.
3. Restart the server.

## Validation

Server validates required numeric fields and range checks for shares in [0,1]. Invalid configs return 500 with `code=invalid_config`.

## Tests

- `npm test` runs a minimal skeleton. Expand with API and validation coverage.
