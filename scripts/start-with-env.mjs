#!/usr/bin/env node
/** Load mobile/.env then start Metro (after pnpm env:*). */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env };
const envPath = join(repoDir, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

const r = spawnSync('npx', ['react-native', 'start'], {
  cwd: repoDir,
  env,
  stdio: 'inherit',
  shell: true,
});
process.exit(r.status ?? 1);
