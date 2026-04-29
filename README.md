# @muzzamil7770/app-update-agent
 
[![npm version](https://img.shields.io/npm/v/@muzzamil7770/app-update-agent)](https://www.npmjs.com/package/@muzzamil7770/app-update-agent)
[![license](https://img.shields.io/npm/l/@muzzamil7770/app-update-agent)](LICENSE)

Detects app version changes, prompts users to update, clears cache, unregisters service workers, and reloads — with a pluggable UI and full Angular support.

---

## Installation

```bash
npm install @muzzamil7770/app-update-agent sweetalert2
```

---

## Quick Start (Angular)

### Replace `AppVersionService` in `app.component.ts`

```ts
// Before
import { AppVersionService } from './services/app-version.service';

// After
import { AppUpdateService } from '@muzzamil7770/app-update-agent';
```

```ts
// app.component.ts
constructor(private appUpdate: AppUpdateService) {}

ngOnInit() {
  this.appUpdate.startMonitoring();
}
```

Zero config needed — defaults match the original behaviour exactly.

---

## Configuration

Configure once globally before `startMonitoring()` (e.g. in `main.ts`):

```ts
import { AppUpdateService } from '@muzzamil7770/app-update-agent';

AppUpdateService.configure({
  versionUrl:       '/version.json',  // default
  pollInterval:     60_000,           // ms, default
  ui:               'sweetalert',     // 'sweetalert' | 'custom' | 'none'
  devMode:          false,            // set true in dev builds
  forceInDevMode:   false,            // override devMode guard for testing
  retryAttempts:    3,                // fetch retries on failure
  retryDelay:       2000,             // ms between retries
  onUpdateDetected: (meta) => console.log('Update detected:', meta),
  onReload:         ()     => console.log('Reloading…'),
});
```

---

## Dev Mode Testing

When `devMode: true`, monitoring is disabled unless:

- URL contains `?appUpdateTest=1`
- `localStorage.app_update_test === '1'`

A global helper is registered for manual simulation:

```js
// Browser console
window.simulateAppUpdate();
```

Or trigger programmatically:

```ts
await this.appUpdate.manualCheck();
```

---

## Custom UI

Extend `AbstractUpdateUI` to replace SweetAlert with any UI library:

```ts
import { AbstractUpdateUI, VersionMeta } from '@muzzamil7770/app-update-agent';

class MyToastUI extends AbstractUpdateUI {
  showUpdatePrompt(meta: VersionMeta, onConfirm: () => void, onDismiss: (meta: VersionMeta) => void) {
    // show your toast/modal
    // call onConfirm() if user accepts, onDismiss(meta) if they dismiss
  }
  showProgress(label: string, pct: number) { /* open progress modal */ }
  updateProgress(label: string, pct: number) { /* update progress bar */ }
}

AppUpdateService.setUI(new MyToastUI());
```

Set `ui: 'none'` to suppress all UI (handle `onUpdateDetected` yourself).

---

## Framework-Agnostic Core

Use the engine directly without Angular:

```ts
import { UpdateEngine, SwalUpdateUI } from '@muzzamil7770/app-update-agent';

const engine = new UpdateEngine(
  { versionUrl: '/version.json', pollInterval: 30_000 },
  new SwalUpdateUI(),
);

engine.start();
engine.stop();
await engine.manualCheck();
```

---

## API Reference

### `AppUpdateService` (Angular)

| Method | Description |
|---|---|
| `static configure(config)` | Set global config before first use |
| `static setUI(ui)` | Inject a custom UI implementation |
| `startMonitoring()` | Begin polling + visibility listener |
| `manualCheck()` | Trigger an immediate version check |

### `UpdateEngine` (Core)

| Method | Description |
|---|---|
| `start()` | Begin polling |
| `stop()` | Stop polling and clear interval |
| `manualCheck()` | Trigger an immediate version check |

---

## Links

- GitHub: https://github.com/muzzamil7770/app-update-agent
- npm: https://www.npmjs.com/package/@muzzamil7770/app-update-agent
- Issues: https://github.com/muzzamil7770/app-update-agent/issues
