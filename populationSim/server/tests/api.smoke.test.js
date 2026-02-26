const http = require('http');
const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3123;
const BASE = `http://127.0.0.1:${PORT}`;

function waitForServer(proc, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('server start timeout')), timeoutMs);
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      if (text.includes('listening on')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    proc.stderr.on('data', (data) => {
      // Keep stderr visible during tests
      process.stderr.write(data.toString());
    });
  });
}

function getJson(pathname) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}${pathname}`, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, json });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  const server = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForServer(server);

    const countries = await getJson('/api/countries');
    assert.strictEqual(countries.status, 200, 'countries status');
    assert.ok(countries.json.default, 'countries default present');
    assert.ok(Array.isArray(countries.json.countries), 'countries list present');

    const population = await getJson('/api/population?country=switzerland');
    assert.strictEqual(population.status, 200, 'population status');
    assert.ok(population.json.years && population.json.years.length > 0, 'population years present');
    assert.ok(population.json.country && population.json.country.slug === 'switzerland', 'population country slug');

    console.log('api.smoke.test.js: ok');
  } catch (err) {
    console.error('api.smoke.test.js: failed', err);
    process.exitCode = 1;
  } finally {
    server.kill();
  }
})();
