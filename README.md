# @muzzamil7770/app-update-agent

[![npm version](https://img.shields.io/npm/v/@muzzamil7770/app-update-agent?color=cb3837&logo=npm)](https://www.npmjs.com/package/@muzzamil7770/app-update-agent)
[![npm downloads](https://img.shields.io/npm/dm/@muzzamil7770/app-update-agent?color=cb3837&logo=npm)](https://www.npmjs.com/package/@muzzamil7770/app-update-agent)
[![license](https://img.shields.io/npm/l/@muzzamil7770/app-update-agent?color=blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-15%2B-dd0031?logo=angular&logoColor=white)](https://angular.io/)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/muzzamil7770/app-update-agent/publish.yml?label=CI%2FCD&logo=github-actions&logoColor=white)](https://github.com/muzzamil7770/app-update-agent/actions)

> Detects app version changes, prompts users to update, clears cache, unregisters service workers, and reloads — with a pluggable UI and full Angular support.

```bash
npm i @muzzamil7770/app-update-agent
```

---

## Preview

### Update Prompt
> The dialog shown to the user when a new version is detected.

![Update Prompt Screenshot](docs/screenshots/update-prompt.png)

### Progress / Reload Screen
> The progress UI shown while cache is cleared and the app reloads.

![Progress Screenshot](docs/screenshots/update-progress.png)

---

## Video Demo

> Watch how the full update flow works — from version detection to reload.

[![Watch the demo](docs/screenshots/video-thumbnail.png)](docs/demo.mp4)

> 📌 **To add your own:** replace `docs/screenshots/update-prompt.png`, `docs/screenshots/update-progress.png`, and `docs/demo.mp4` with your actual files and commit them.

---

## How It Works

### Full Update Flow

```mermaid
flowchart TD
    A([App Starts]) --> B[startMonitoring called]
    B --> C{devMode?}
    C -- Yes, no override --> Z([Monitoring Disabled])
    C -- No / forceInDevMode --> D[Poll /version.json every 60s]
    D --> E{Network Request\nGET /version.json?t=timestamp}
    E -- Fetch fails --> F[Retry up to 3x\nwith 2s delay]
    F -- All retries fail --> D
    E -- Success --> G{Version changed?}
    G -- No change --> D
    G -- Yes --> H[onUpdateDetected hook fired]
    H --> I[Show Update Prompt UI]
    I -- User dismisses --> D
    I -- User confirms --> J[Show Progress UI]
    J --> K[Clear all browser caches]
    K --> L[Unregister Service Workers]
    L --> M[onReload hook fired]
    M --> N([window.location.reload])
```

---

### Build & Publish Pipeline

```mermaid
flowchart LR
    A([git push to main]) --> B[GitHub Actions triggered]
    B --> C[npm ci — install deps]
    C --> D[npm version patch\nauto bump 1.0.0 → 1.0.1]
    D --> E[git push version bump\nback to main with skip-ci tag]
    E --> F[npm run build\ntsc compiles to dist/]
    F --> G[npm publish --access public]
    G --> H[GitHub Release created]
    H --> I([New version live on npm 🎉])
```

---

### Network Version Check Internals

```mermaid
sequenceDiagram
    participant App
    participant UpdateEngine
    participant Network as /version.json
    participant UI

    App->>UpdateEngine: startMonitoring()
    loop Every pollInterval (60s)
        UpdateEngine->>Network: GET /version.json?t={timestamp}
        alt fetch succeeds
            Network-->>UpdateEngine: { version: "1.0.5" }
            UpdateEngine->>UpdateEngine: compare with stored version
            alt version changed
                UpdateEngine->>UI: showUpdatePrompt(meta)
                UI-->>UpdateEngine: user confirmed
                UpdateEngine->>UI: showProgress(...)
                UpdateEngine->>App: clearCache + unregisterSW
                UpdateEngine->>App: reload()
            end
        else fetch fails
            UpdateEngine->>UpdateEngine: retry (up to 3x, 2s apart)
        end
    end
```

---

## Installation

```bash
npm i @muzzamil7770/app-update-agent
```

With SweetAlert2 UI (default):

```bash
npm i @muzzamil7770/app-update-agent sweetalert2
```

---

## Quick Start (Angular)

```ts
// app.component.ts
import { AppUpdateService } from '@muzzamil7770/app-update-agent';

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

```js
// Browser console
window.simulateAppUpdate();
```

```ts
// Programmatic
await this.appUpdate.manualCheck();
```

---

## Custom UI

```ts
import { AbstractUpdateUI, VersionMeta } from '@muzzamil7770/app-update-agent';

class MyToastUI extends AbstractUpdateUI {
  showUpdatePrompt(meta: VersionMeta, onConfirm: () => void, onDismiss: (meta: VersionMeta) => void) {
    // show your toast/modal
  }
  showProgress(label: string, pct: number) { /* open progress modal */ }
  updateProgress(label: string, pct: number) { /* update progress bar */ }
}

AppUpdateService.setUI(new MyToastUI());
```

Set `ui: 'none'` to suppress all UI and handle `onUpdateDetected` yourself.

---

## Framework-Agnostic Core

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

### `UpdateAgentConfig`

| Option | Type | Default | Description |
|---|---|---|---|
| `versionUrl` | `string` | `'/version.json'` | URL to fetch version from |
| `pollInterval` | `number` | `60000` | Polling interval in ms |
| `ui` | `'sweetalert' \| 'custom' \| 'none'` | `'sweetalert'` | UI mode |
| `devMode` | `boolean` | `false` | Disable monitoring in dev |
| `forceInDevMode` | `boolean` | `false` | Override devMode guard |
| `retryAttempts` | `number` | `3` | Fetch retry count |
| `retryDelay` | `number` | `2000` | Ms between retries |
| `onUpdateDetected` | `(meta) => void` | — | Hook fired on version change |
| `onReload` | `() => void` | — | Hook fired before reload |

---

## Links

- 📦 npm: https://www.npmjs.com/package/@muzzamil7770/app-update-agent
- 🐙 GitHub: https://github.com/muzzamil7770/app-update-agent
- 🐛 Issues: https://github.com/muzzamil7770/app-update-agent/issues
