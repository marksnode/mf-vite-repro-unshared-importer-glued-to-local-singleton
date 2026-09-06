# Repro: an unshared workspace importer is glued to the remote's local copy of a shared singleton

`@module-federation/vite` `main` @ `82013b2`, Vite 8.2.1.

Since #1210 `getSharedPackageFromFile` also names the *unshared* workspace package that owns an importing file, so
the package-level cycle rule in `proxyPreBuildShared:resolve-shared-loadShare`

```ts
if (importerPackage && isSharedPackageDependency(key, importerPackage)) return; // ordinary edge, no loadShare proxy
```

now applies to every workspace file. `isSharedPackageDependency` walks the shared package's **manifest closure**
(`dependencies` + `peerDependencies` + `optionalDependencies`, transitively). In a monorepo that closure is not the
module graph: type-only packages, tooling helpers and page packages all sit in `dependencies`, so a shared singleton
"reaches" most of the workspace on paper while its code evaluates none of it. Every unshared workspace importer of that
singleton then gets an ordinary edge to the **remote's local fallback** — even when the host provides the singleton
and the rest of the remote uses the host copy through the proxy.

## Graph

```
host   ── shares aaa-runtime (singleton), registers a service in it, loads remote/widget
remote ── shares aaa-runtime (singleton, local fallback), exposes ./widget
             widget ──► zzz-hooks (workspace, NOT shared, bundled into the widget) ──► aaa-runtime

aaa-runtime ──(dependencies)──► mid-types ──(dependencies)──► zzz-hooks        manifest-only: mid-types never imports zzz-hooks
```

## Run

```bash
npm install
npm run build
npm run check      # serves both builds, opens the host in headless Chromium, prints the verdict
```

On `main` @ `82013b2`:

```
host registered localSettings in aaa-runtime copy 8qgktw
RESULT FAIL: Service "localSettings" is not registered in the container (copy dbciyj)
```

Two copies of the singleton: the widget chunk imports `resolve` straight from `lib-runtime-*.js`
(`import { r as resolve, t as instanceId } from "./lib-runtime-Cwnb4jIA.js"`) instead of the `aaa-runtime`
loadShare wrapper.

Controls:

- drop the `zzz-hooks` entry from `lib-types/package.json` (no manifest chain) → `RESULT OK: settings-from-host (via aaa-runtime copy …)`;
- `@module-federation/vite@1.21.3` (before #1210) → `RESULT OK`.

## Real-world hit

Agent Desktop (Bright Pattern): a calendar remote embedded in the host shell renders
`Service "localSettings" is not registered in the container` — `@bpinc/platform-runtime` (the IoC container singleton)
is reached by `@bpinc/lib-formatting-hooks` through an ordinary edge, because the manifest closure of the singleton
covers 175 of 289 workspace packages (`platform-runtime → state-factory → ad-local-settings-types → records-page-ui → lib-formatting-hooks`,
all of them type-only imports at runtime).

## Fix

Unshared workspace importers are still recognized (#1210), but the cycle test for them walks the imports the shared
package **evaluates** — its source files and those of the workspace packages they pull in, `import type` /
`export type` dropped, `node_modules` treated as leaves — instead of the manifest closure. `aaa-runtime` never imports
`mid-types` at runtime, so `zzz-hooks` stays on the proxy and the widget reads the host's copy (`RESULT OK`); a genuine
evaluation cycle (marksnode/mf-vite-repro-cycle-guard-skips-unshared-workspace-importer) still keeps its ordinary edge.
