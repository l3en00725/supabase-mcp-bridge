# Dependency security remediation — 2026-10-21

Repository: `l3en00725/supabase-mcp-bridge`. Base: `main`. Draft review candidate; no merge or deployment performed.

## Scope

Updates affected direct dependencies and compatible transitive resolutions in every committed npm lockfile, including nested/template workspaces. Versions were checked against the public npm registry; advisories were matched locally against the public OSV snapshot. No private dependency inventory was sent to a scanner. Initial dependency installation disabled lifecycle scripts and npm audit.

## Validation

Runtime used: official Node.js 24.22.1 (verified by the coordinating audit). Dummy environment values were used where a build needed configuration. Tests used local mocks/loopback endpoints; production data, payment, email, SMS and deployment settings were not modified.

- `.`: npm install --ignore-scripts --no-audit --no-fund: PASS
- `.`: node -e require('@supabase/supabase-js'); console.log('Supabase SDK import passed without network'): PASS

## Scan evidence

Raw match counts (lock/package/version/advisory rows): before `{'CRITICAL': 0, 'HIGH': 1, 'MODERATE': 1, 'LOW': 0, 'UNKNOWN': 0}`; after `{'CRITICAL': 0, 'HIGH': 0, 'MODERATE': 0, 'LOW': 0, 'UNKNOWN': 0}`. These counts indicate dependency matches, not proof of reachable deployment exploits.

## Remaining findings and release gates

No remaining applicable matches in the scanned npm lockfiles. This does not assess deployed runtime/OS images, secrets, or untracked dependencies.

### Validation limitations

- Hosted runtime patch level and staging acceptance are release prerequisites; local tests do not confirm production state.

## Release and rollback

Before merge: review every remaining finding and failed/unrun check, reproduce a clean install, verify the actual host uses a supported patched Node release, and run the application acceptance flow in a staging environment with test credentials. Next.js major migrations require authenticated routes, middleware, rendering and error-path checks; static applications require browser interaction and asset checks. No approval to deploy is implied by this PR.

Rollback: revert the dependency/runtime-pin commit and restore its prior manifests and lockfiles together, then rebuild the prior known-good artifact. No database migration or production state change is part of this candidate.
