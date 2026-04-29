import { UpdateUI, VersionMeta } from '../core/types';

/**
 * Extend this class to create a custom UI adapter.
 *
 * @example
 * class MyToastUI extends AbstractUpdateUI {
 *   showUpdatePrompt(meta, onConfirm, onDismiss) { ... }
 *   showProgress(label, pct) { ... }
 *   updateProgress(label, pct) { ... }
 * }
 */
export abstract class AbstractUpdateUI implements UpdateUI {
  abstract showUpdatePrompt(
    meta: VersionMeta,
    onConfirm: () => void,
    onDismiss: (meta: VersionMeta) => void,
  ): void;

  abstract showProgress(label: string, pct: number): void;
  abstract updateProgress(label: string, pct: number): void;
}
