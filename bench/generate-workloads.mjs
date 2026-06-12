#!/usr/bin/env node
// Generate reproducible sample workloads for TOON vs JSON benchmarking.
// Deterministic output — seeded PRNG — so measurements are stable across runs.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'workloads');
mkdirSync(OUT, { recursive: true });

let seed = 42;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (lo, hi) => Math.floor(lo + rand() * (hi - lo));

// 1. REST API response: 50 user records
const users = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  email: `user${i + 1}@example.com`,
  name: pick(['Alex', 'Sam', 'Jamie', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Reese']),
  role: pick(['admin', 'member', 'viewer', 'guest']),
  status: pick(['active', 'suspended', 'pending']),
  created_at: `2025-${String(int(1, 13)).padStart(2, '0')}-${String(int(1, 29)).padStart(2, '0')}T${String(int(0, 24)).padStart(2, '0')}:00:00Z`,
  last_login: `2026-${String(int(1, 5)).padStart(2, '0')}-${String(int(1, 29)).padStart(2, '0')}T${String(int(0, 24)).padStart(2, '0')}:00:00Z`,
}));
writeFileSync(join(OUT, 'api-response-users.json'), JSON.stringify(users, null, 2));

// 2. Structured logs: 200 events
const logs = Array.from({ length: 200 }, (_, i) => ({
  ts: `2026-04-24T${String(int(0, 24)).padStart(2, '0')}:${String(int(0, 60)).padStart(2, '0')}:${String(int(0, 60)).padStart(2, '0')}Z`,
  level: pick(['info', 'warn', 'error', 'debug']),
  service: pick(['api', 'worker', 'scheduler', 'webhook']),
  request_id: `req_${(seed + i).toString(36)}`,
  status: pick([200, 200, 200, 201, 204, 400, 401, 404, 500]),
  duration_ms: int(5, 2500),
}));
writeFileSync(join(OUT, 'logs-events.json'), JSON.stringify(logs, null, 2));

// 3. Metrics time series: 288 points (every 5 min for 24h)
const metrics = Array.from({ length: 288 }, (_, i) => ({
  t: i * 300,
  cpu: +(rand() * 100).toFixed(2),
  mem_mb: int(512, 4096),
  rps: int(10, 1200),
  p95_ms: int(40, 800),
}));
writeFileSync(join(OUT, 'metrics-series.json'), JSON.stringify(metrics, null, 2));

// 4. Database rows: 100 transaction records
const txns = Array.from({ length: 100 }, (_, i) => ({
  id: `txn_${i.toString(36).padStart(6, '0')}`,
  customer_id: `cus_${int(1, 50).toString(36)}`,
  amount: int(100, 50000),
  currency: pick(['usd', 'usd', 'usd', 'eur', 'gbp']),
  status: pick(['succeeded', 'succeeded', 'succeeded', 'pending', 'failed']),
  created: 1700000000 + int(0, 10000000),
}));
writeFileSync(join(OUT, 'db-transactions.json'), JSON.stringify(txns, null, 2));

// 5. Small array (TOON overhead should dominate — shows where it fails)
const tiny = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  name: `item ${i + 1}`,
}));
writeFileSync(join(OUT, 'small-array.json'), JSON.stringify(tiny, null, 2));

// 6. Deeply nested irregular (also where TOON helps less)
const irregular = {
  metadata: {
    version: '3.2.1',
    generator: 'internal',
    nested: { level2: { level3: { level4: 'deep' } } },
  },
  sections: [
    { title: 'Intro', words: 240, refs: ['a', 'b'] },
    { title: 'Body', subtitle: 'Details', paragraphs: 5 },
    { heading: 'Conclusion' },
  ],
};
writeFileSync(join(OUT, 'irregular-nested.json'), JSON.stringify(irregular, null, 2));

console.log(`Wrote 6 workloads to ${OUT}`);
