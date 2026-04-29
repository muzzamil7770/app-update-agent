// Core (framework-agnostic)
export { UpdateEngine }       from './core/update-engine';
export { fetchVersion, versionsAreDifferent } from './core/version-checker';
export type { VersionMeta, UpdateAgentConfig, UpdateUI } from './core/types';

// UI
export { AbstractUpdateUI }   from './ui/abstract-ui';
export { SwalUpdateUI }       from './ui/swal-ui';

// Angular adapter
export { AppUpdateService }   from './angular/app-update.service';
