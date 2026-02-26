# population-srv

Small population simulation server (multi-country).

## Endpoints

- `GET /api/countries` → list + default country
- `GET /api/population?country=<slug>` → population series + params for a country
- `GET /config.json` → legacy single-country config (defaults to index.json default)

## Migration note (multi-country)

The UI now reads country options from `countries/index.json` and fetches data via `?country=<slug>`. Existing single-country configs remain available via `config.json` for backward compatibility.

## Adding a country

1. Add `countries/<slug>.json` with the required fields.
2. Update `countries/index.json` with `{ slug, name, startYear, endYear, hasSources }`.
3. Restart the server.

## Validation

Server validates required numeric fields and range checks for shares in [0,1]. Invalid configs return 500 with `code=INVALID_CONFIG`.

## Tests

- `npm test` runs a minimal skeleton plus API smoke tests.
