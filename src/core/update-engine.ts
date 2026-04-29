import { UpdateAgentConfig, UpdateUI, VersionMeta } from './types';
import { fetchVersion, versionsAreDifferent } from './version-checker';

const DEV_STORAGE_KEY = 'app_update_test';
const DEV_QUERY_PARAM = 'appUpdateTest';

export class UpdateEngine {
  private readonly cfg: Required<
    Pick<UpdateAgentConfig, 'versionUrl' | 'pollInterval' | 'retryAttempts' | 'retryDelay'>
  > & UpdateAgentConfig;

  private currentVersion: string | null = null;
  private promptOpen = false;
  private started = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    config: UpdateAgentConfig,
    private readonly ui: UpdateUI | null,
  ) {
    this.cfg = {
      versionUrl: '/version.json',
      pollInterval: 60_000,
      retryAttempts: 3,
      retryDelay: 2000,
      ...config,
    };
  }

  start(): void {
    if (this.started || !this.shouldRun()) return;
    this.started = true;
    this.registerDevHook();

    this.check();
    this.pollTimer = setInterval(() => this.check(), this.cfg.pollInterval);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.check();
    });
  }

  stop(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.started = false;
  }

  /** Manually trigger a version check (useful for testing) */
  async manualCheck(): Promise<void> {
    return this.check();
  }

  private async check(): Promise<void> {
    const meta = await fetchVersion(
      this.cfg.versionUrl!,
      this.cfg.retryAttempts,
      this.cfg.retryDelay,
    );

    if (!meta?.version) return;

    if (!this.currentVersion) {
      this.currentVersion = meta.version;
      return;
    }

    if (versionsAreDifferent(this.currentVersion, meta.version) && !this.promptOpen) {
      this.promptOpen = true;
      this.cfg.onUpdateDetected?.(meta);
      this.ui?.showUpdatePrompt(
        meta,
        () => this.runUpdateSequence(),
        (m) => {
          this.promptOpen = false;
          this.currentVersion = m.version ?? this.currentVersion;
        },
      );
    }
  }

  private async runUpdateSequence(): Promise<void> {
    const steps = [
      { label: 'Clearing app cache…',           pct: 30 },
      { label: 'Unregistering service workers…', pct: 65 },
      { label: 'Almost ready…',                  pct: 90 },
      { label: 'Reloading…',                     pct: 100 },
    ];

    const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    this.ui?.showProgress(steps[0].label, 0);

    if ('caches' in window) {
      await caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
    this.ui?.updateProgress(steps[0].label, steps[0].pct);

    await delay(400);
    this.ui?.updateProgress(steps[1].label, steps[1].pct);
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())));
    }

    await delay(400);
    this.ui?.updateProgress(steps[2].label, steps[2].pct);

    await delay(500);
    this.ui?.updateProgress(steps[3].label, steps[3].pct);

    this.cfg.onReload?.();
    await delay(400);
    window.location.reload();
  }

  private shouldRun(): boolean {
    if (!this.cfg.devMode) return true;
    if (this.cfg.forceInDevMode) return true;

    const fromQuery =
      new URLSearchParams(window.location.search).get(DEV_QUERY_PARAM) === '1';
    if (fromQuery) {
      localStorage.setItem(DEV_STORAGE_KEY, '1');
      return true;
    }
    return localStorage.getItem(DEV_STORAGE_KEY) === '1';
  }

  private registerDevHook(): void {
    if (!this.cfg.devMode) return;
    (window as any).simulateAppUpdate = () => {
      this.promptOpen = false;
      this.ui?.showUpdatePrompt(
        { version: `test-${Date.now()}`, buildTime: new Date().toISOString(), buildId: 'local' },
        () => this.runUpdateSequence(),
        (m) => { this.promptOpen = false; this.currentVersion = m.version ?? this.currentVersion; },
      );
    };
  }
}
