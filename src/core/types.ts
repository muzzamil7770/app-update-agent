export interface VersionMeta {
  version?: string;
  buildTime?: string;
  buildId?: string;
}

export interface UpdateAgentConfig {
  /** URL to fetch version from. Default: '/version.json' */
  versionUrl?: string;
  /** Polling interval in ms. Default: 60000 (prod), 5000 (dev) */
  pollInterval?: number;
  /** UI strategy. Default: 'sweetalert' */
  ui?: 'sweetalert' | 'custom' | 'none';
  /** Disable monitoring entirely. Default: false */
  devMode?: boolean;
  /** Allow monitoring even in devMode (for testing). Default: false */
  forceInDevMode?: boolean;
  /** Retry attempts on failed fetch. Default: 3 */
  retryAttempts?: number;
  /** Delay between retries in ms. Default: 2000 */
  retryDelay?: number;
  /** Lifecycle hook: called when an update is detected */
  onUpdateDetected?: (meta: VersionMeta) => void;
  /** Lifecycle hook: called just before reload */
  onReload?: () => void;
}

export interface UpdateUI {
  showUpdatePrompt(meta: VersionMeta, onConfirm: () => void, onDismiss: (meta: VersionMeta) => void): void;
  showProgress(label: string, pct: number): void;
  updateProgress(label: string, pct: number): void;
}
