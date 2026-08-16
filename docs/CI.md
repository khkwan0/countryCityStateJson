# Continuous integration

This repo does **not** use GitHub Actions. CI is a portable shell script that Jenkins (or any other runner) can invoke.

## What CI runs

```bash
bash scripts/ci.sh
```

That script:

1. `npm ci`
2. `npm run build` (client chunk split + CJS/ESM emit)
3. `npm test`
4. Dual-module smoke: CJS `require` and ESM `import` against package `exports`
5. If postal data is present (`packages/postal-*/src/lib/DATA_HASH`): build, test, and smoke the postal workspace packages

## Monthly postal refresh

Separate Pipeline job using [`Jenkinsfile.postal`](../Jenkinsfile.postal) (cron on the 1st). It runs `node scripts/update-postal.js`, which downloads GeoNames, recompiles bridges, and opens/updates a GitHub PR when data changed. It does **not** `npm publish` (maintainers release with 2FA after merge).

Requires `gh` + git push credentials on the agent.

A declarative `Jenkinsfile` is at the repo root.

### One-time Jenkins setup

1. Install plugins: **Pipeline**, **NodeJS**, **JUnit** (optional).
2. **Manage Jenkins → Tools → NodeJS** → add an installation named exactly `node-20` (Node 20.x).
3. Create a **Multibranch Pipeline** (or Pipeline) job pointed at this repository.
4. Jenkins will pick up the root `Jenkinsfile` automatically.

### Job tip for PRs

Use a Multibranch Pipeline with branch/PR discovery enabled so feature branches get the same checks as `master`.

## Alternatives (same script)

Any CI that can run bash + Node works — point it at `scripts/ci.sh`:

| System | Sketch |
|---|---|
| **GitLab CI** | `script: bash scripts/ci.sh` |
| **CircleCI** | `run: bash scripts/ci.sh` |
| **Buildkite** | command step: `bash scripts/ci.sh` |
| **Woodpecker / Drone** | pipeline step running the script in a `node:20` image |

## Local developer check

```bash
npm install
bash scripts/ci.sh
```
