#!/usr/bin/env node
/** First-time setup for mobile-only clone. Run: node scripts/setup-dev.mjs */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const metaRoot = [join(repoDir, '..'), join(repoDir, '..', 'vista-remote')].find((p) =>
  existsSync(join(p, 'tooling/scripts/setup-single-repo.mjs')),
);

if (metaRoot) {
  execSync('node tooling/scripts/setup-single-repo.mjs --repo=mobile', {
    cwd: metaRoot,
    stdio: 'inherit',
  });
} else {
  console.log('📦 Meta-Repo not found — ensuring ../shared only');
  execSync('git clone git@github.com:VistaRemote/shared.git ../shared', {
    cwd: repoDir,
    stdio: 'inherit',
  });
  execSync('pnpm install', { cwd: repoDir, stdio: 'inherit' });
  execSync('pnpm install && pnpm build', { cwd: join(repoDir, '../shared'), stdio: 'inherit', shell: true });
}
