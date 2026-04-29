import Swal from 'sweetalert2';
import { VersionMeta } from '../core/types';
import { AbstractUpdateUI } from './abstract-ui';

export class SwalUpdateUI extends AbstractUpdateUI {
  showUpdatePrompt(
    meta: VersionMeta,
    onConfirm: () => void,
    onDismiss: (meta: VersionMeta) => void,
  ): void {
    const time = meta.buildTime
      ? new Date(meta.buildTime).toLocaleString()
      : 'Just now';

    Swal.fire({
      icon: 'info',
      title: 'Update Available',
      html: `
        <div class="text-start">
          <p class="mb-2">A new version is ready. Please refresh to use the latest update.</p>
          <p class="mb-0"><strong>Latest update time:</strong> ${escapeHtml(time)}</p>
        </div>`,
      showCancelButton: true,
      confirmButtonText: 'Update Now',
      cancelButtonText: 'Later',
      allowOutsideClick: false,
      confirmButtonColor: '#0c5669',
      cancelButtonColor: '#6c757d',
      customClass: { popup: 'swal2-premium-popup' },
    }).then((result) => {
      result.isConfirmed ? onConfirm() : onDismiss(meta);
    });
  }

  showProgress(label: string, pct: number): void {
    Swal.fire({
      title: 'Updating App',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: { popup: 'swal2-premium-popup' },
      html: buildProgressHtml(label, pct),
    });
  }

  updateProgress(label: string, pct: number): void {
    const bar   = document.getElementById('upd-bar');
    const lbl   = document.getElementById('upd-label');
    const pctEl = document.getElementById('upd-pct');
    if (bar)   bar.style.width    = `${pct}%`;
    if (lbl)   lbl.textContent    = label;
    if (pctEl) pctEl.textContent  = `${pct}%`;
  }
}

function buildProgressHtml(label: string, pct: number): string {
  return `
    <div style="text-align:center;padding:8px 0">
      <div style="font-size:2.4rem;margin-bottom:8px">⚙️</div>
      <p id="upd-label" style="margin:0 0 16px;font-weight:500;color:#374151">${label}</p>
      <div style="background:#e5e7eb;border-radius:999px;height:10px;overflow:hidden">
        <div id="upd-bar" style="
          height:100%;width:${pct}%;
          background:linear-gradient(90deg,#0c5669,#1a8fa8);
          border-radius:999px;
          transition:width .5s cubic-bezier(.4,0,.2,1);
        "></div>
      </div>
      <p id="upd-pct" style="margin:8px 0 0;font-size:.85rem;color:#6b7280">${pct}%</p>
    </div>`;
}

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
