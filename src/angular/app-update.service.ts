import { Injectable, isDevMode, OnDestroy } from '@angular/core';
import { UpdateAgentConfig, UpdateUI } from '../core/types';
import { UpdateEngine } from '../core/update-engine';
import { SwalUpdateUI } from '../ui/swal-ui';

/**
 * Drop-in Angular replacement for AppVersionService.
 *
 * Provide config via AppUpdateService.configure() before startMonitoring(),
 * or inject with a custom UI via the static setUI() method.
 *
 * @example
 * // app.component.ts
 * constructor(private appUpdate: AppUpdateService) {}
 * ngOnInit() { this.appUpdate.startMonitoring(); }
 */
@Injectable({ providedIn: 'root' })
export class AppUpdateService implements OnDestroy {
  private static config: UpdateAgentConfig = {};
  private static customUI: UpdateUI | null = null;

  private engine: UpdateEngine | null = null;

  /** Call once (e.g. in main.ts or AppModule) to set global config. */
  static configure(config: UpdateAgentConfig): void {
    AppUpdateService.config = config;
  }

  /** Inject a fully custom UI implementation. */
  static setUI(ui: UpdateUI): void {
    AppUpdateService.customUI = ui;
  }

  startMonitoring(): void {
    const cfg: UpdateAgentConfig = {
      devMode: isDevMode(),
      ...AppUpdateService.config,
    };

    const ui = this.resolveUI(cfg);
    this.engine = new UpdateEngine(cfg, ui);
    this.engine.start();
  }

  /** Manually trigger a version check (e.g. on route change or user action). */
  async manualCheck(): Promise<void> {
    return this.engine?.manualCheck();
  }

  ngOnDestroy(): void {
    this.engine?.stop();
  }

  private resolveUI(cfg: UpdateAgentConfig): UpdateUI | null {
    if (AppUpdateService.customUI) return AppUpdateService.customUI;
    if (cfg.ui === 'none') return null;
    return new SwalUpdateUI(); // default: sweetalert
  }
}
